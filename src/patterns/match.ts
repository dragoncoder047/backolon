import { is } from "lib0/function";
import { Thing } from "../objects/thing";
import { NFASubstate } from "./internals";


export class MatchResult<T> {
    constructor(
        public data: T,
        public bindings: Record<string, Thing[] | Thing>,
        public span: [number, number]
    ) { }
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
    const queue: (NFASubstate<T> | MatchResult<T>)[] = [];
    const addIfNotAlreadySeen = (item: NFASubstate<T>, hashSet: Record<number, true>, i: number) => {
        if (hashSet[item._hash]) return;
        hashSet[item._hash] = true;
        queue.splice(i, 0, item);
    }
    const zippy = (index: number, input: Thing | null, end: boolean) => {
        const waitingHashes = {};
        const progressHashes = {};
        for (var i = 0; i < queue.length; i++) {
            const orig = queue[i]!;
            if (is(orig, MatchResult)) continue;
            var k = i;
            queue.splice(i--, 1);
            const result = orig._step(input, index, end);
            for (var j = 0; j < result.length; j++) {
                const newItem = result[j]!;
                if (newItem._complete) {
                    queue.splice(k++, 0, new MatchResult(
                        newItem._data,
                        Object.fromEntries(Object.entries(newItem._bindingSpans).map(k => [k[0], newItem._atomicBindings.includes(k[0]) ? source[k[1][0]]! : source.slice(k[1][0], k[1][1]!)])),
                        [newItem._startIndex, index],
                    ));
                }
                else if (newItem === orig || input !== null) {
                    addIfNotAlreadySeen(newItem, waitingHashes, k++);
                    i++;
                }
                else {
                    addIfNotAlreadySeen(newItem, progressHashes, k++);
                }
            }
        }
    };
    for (var inputIndex = 0; inputIndex < source.length; inputIndex++) {
        for (var i = 0; i < patterns.length; i++) {
            queue.push(new NFASubstate(inputIndex, patterns[i]![1], [[patterns[i]![0], 0]]));
        }
        zippy(inputIndex, null, false);
        zippy(inputIndex, source[inputIndex]!, false);
    }
    zippy(inputIndex, null, true);
    for (var i = 0; i < queue.length; i++) {
        if (is(queue[i], NFASubstate)) queue.splice(i--, 1);
    }
    return queue as MatchResult<T>[];
}
