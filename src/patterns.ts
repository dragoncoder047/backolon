import { imul } from "lib0/math";
import { RuntimeError } from "./errors";
import { javaHash } from "./objects/hash";
import { extractSymbolName, Thing, ThingType } from "./objects/thing";

export interface MatchResult<T> {
    data: T;
    bindings: Record<string, Thing[]>;
    span: [number, number];
}

/**
 * Finds all of the matches of the pattern and returns (for each match) the bindings
 * and the span.
 *
 * Uses a tree-walking version of Thompson's NFA construction internally, for speed.
 *
 * @param source Stream of tokens to be fed to the pattern matching.
 * @param patterns List of structured trees of `pattern`-type Things describing the patterns to be matched against.
 */
export function doMatchPatterns<T>(source: Thing[], patterns: [Thing, T][]): MatchResult<T>[] {
    var waitingStates: NFASubstate<T>[] = [];
    var progressStates: NFASubstate<T>[] = [];
    const results: MatchResult<T>[] = [];
    const hashes = new Set<number>();
    const zippy = (index: number, input: Thing | null, end: boolean) => {
        hashes.clear();
        for (var i = 0; i < progressStates.length; i++) {
            const orig = progressStates[i]!;
            const result = stepNFASubstate(orig, input, index, end);
            var k = i;
            for (var j = 0; j < result.length; j++) {
                const newItem = result[j]!;
                if (newItem._complete) {
                    results.push({
                        data: newItem._data,
                        bindings: Object.fromEntries(Object.entries(newItem._bindingSpans).map(k => [k[0], source.slice(k[1][0], k[1][1]!)])),
                        span: [newItem._startIndex, index],
                    });
                    progressStates.splice(i, 1);
                    i--;
                    break;
                }
                if (newItem === orig) {
                    waitingStates.push(orig);
                    progressStates.splice(i, 1);
                    i--;
                    break;
                }
                if (!hashes.has(newItem._hash)) {
                    hashes.add(newItem._hash);
                    progressStates.splice(k, 0, newItem);
                    k++;
                }
            }
        }
    }
    const swap = () => {
        const temp = waitingStates;
        waitingStates = progressStates;
        progressStates = temp;
    }
    var i: number;
    for (var inputIndex = 0; inputIndex < source.length; inputIndex++) {
        for (i = 0; i < patterns.length; i++) {
            progressStates.push(makeNFASubstate(inputIndex, patterns[i]![1], [[patterns[i]![0], 0]], {}, false));
        }
        zippy(inputIndex, null, false);
        swap();
        zippy(inputIndex, source[inputIndex]!, false);
        swap();
    }
    zippy(inputIndex, null, true);
    return results;
}

export function bestMatch<T>(matches: MatchResult<T>[]): MatchResult<T> {
    return matches.sort((left, right) => {
        var n: number;
        if ((n = left.span[0] - right.span[0]) !== 0) return n; // Leftmost
        if ((n = left.span[1] - right.span[1]) !== 0) return -n; // Longest
        return 0;
    })[0]!;
}


export function stepNFASubstate<T>(state: NFASubstate<T>, input: Thing | null, inputIndex: number, isAtEnd: boolean): NFASubstate<T>[] {
    // Handle atomic commands (no children)
    const { _thing: cmd, _index: pIndex } = getCurrentCommand(state, 1);
    if (cmd === null) {
        // We fell off the end of the group. Go back up one.
        if (state._path.length === 1) {
            // No parent = we're done.
            return [
                makeNFASubstate(state._startIndex, state._data, [], state._bindingSpans, true)
            ];
        }
        const { _thing: cmd2, _index: pIndex2 } = getCurrentCommand(state, 2);
        switch (cmd2!.type) {
            case ThingType.pattern_optional:
            case ThingType.pattern_sequence:
            case ThingType.pattern_alternatives:
                return [
                    // just move on
                    updateNFASubstate(state, 1, null, pIndex2 + 1, null, 0, false),
                ];
            case ThingType.pattern_repeat:
                return [
                    // One is the repeat back to itself code, the other is the continue-on code
                    updateNFASubstate(state, 1, null, pIndex2 + (cmd2!.value ? 1 : 0), null, 0, false),
                    updateNFASubstate(state, 1, null, pIndex2 + (cmd2!.value ? 0 : 1), null, 0, false)
                ];
            case ThingType.pattern_capture:
                return [
                    updateNFASubstate(state, 1, null, pIndex2 + 1, extractSymbolName(cmd2!.children[0]!), inputIndex, true),
                ]
            case ThingType.pattern_anchor:
            case ThingType.pattern_match_value:
            case ThingType.pattern_match_type:
                throw new RuntimeError("Atomic command reached compound command exit code!!", cmd2!.srcLocation);
            default:
                throw new RuntimeError("Non-pattern in pattern!!", cmd2!.srcLocation);
        }
    }
    const next = () => updateNFASubstate(state, 0, null, pIndex + 1, null, 0, false);
    const enter = () => updateNFASubstate(state, 0, cmd, 0, null, 0, false);
    const firstChild = cmd.children[0]!;
    switch (cmd.type) {
        case ThingType.pattern_optional:
            return cmd.value ? [enter(), next()] : [next(), enter()];
        case ThingType.pattern_sequence:
        case ThingType.pattern_repeat:
            return [enter()];
        case ThingType.pattern_alternatives:
            return cmd.children.map(subcmd => updateNFASubstate(state, 0, subcmd, 0, null, 0, false));
        case ThingType.pattern_anchor:
            return (cmd.value ? (inputIndex === 0) : isAtEnd) ? [next()] : [];
        case ThingType.pattern_capture:
            return [updateNFASubstate(state, 0, cmd, 1, extractSymbolName(firstChild), inputIndex, false)];
        case ThingType.pattern_match_value:
            if (input === null) return [state];
            if (input.type !== firstChild.type || input.hash !== firstChild.hash) return [];
            return [next()];
        case ThingType.pattern_match_type:
            if (input === null) return [state];
            if (input === null) return [state];
            if (input.type !== cmd.value) return [];
            return [next()];
        default:
            throw new RuntimeError("Non-pattern in pattern!!", cmd.srcLocation);
    }
}

function getCurrentCommand(state: NFASubstate<any>, index: number): { _thing: Thing | null, _index: number } {
    const cur = state._path.at(-index)!;
    return { _thing: cur[0].children[cur[1]] ?? null, _index: cur[1] };
}

function updateNFASubstate<T>(orig: NFASubstate<T>, popElements: number, push: Thing | null, newIndex: number, binding: string | null, bindingIndex: number, bindingIsSecond: boolean): NFASubstate<T> {
    const p = orig._path.slice();
    for (; popElements > 0; popElements--) p.pop();
    if (push) p.push([push, newIndex]);
    else p.push(p.pop()!.with(1, newIndex) as [Thing, number]);
    var b = orig._bindingSpans;
    if (binding) {
        b = { ...b };
        if (bindingIsSecond) {
            b[binding] = b[binding]!.with(1, bindingIndex) as any;
        } else {
            b[binding] = [bindingIndex, null];
        }
    }
    return makeNFASubstate(orig._startIndex, orig._data, p, b, false);
}

const x23 = (a: number, b: number) => imul(a ^ b, b >>> 23);
export function makeNFASubstate<T>(start: number, data: T, path: NFASubstate<T>["_path"], bindings: NFASubstate<T>["_bindingSpans"], complete: boolean): NFASubstate<T> {
    var hash = path.map(p => p[0].hash! ^ (javaHash(p[1].toString(16)) >>> 19)).reduce(x23, 0) ^ start;
    // Uncomment if backreferences are added
    // hash ^= Object.entries(bindings).map(b => (javaHash(b[0]) + javaHash(b[1][0].toString(16)) ^ javaHash(String(b[1][1]))) >>> 29).reduce(x23, 0);
    return {
        _data: data,
        _startIndex: start,
        _path: path,
        _bindingSpans: bindings,
        _complete: complete,
        _hash: hash
    }
}

interface NFASubstate<T> {
    readonly _data: T;
    readonly _startIndex: number;
    readonly _path: readonly (readonly [Thing, number])[];
    readonly _bindingSpans: Record<string, readonly [number, number | null]>;
    readonly _complete: boolean;
    readonly _hash: number;
}
