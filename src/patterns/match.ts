import { Thing } from "../objects/thing";
import { NFASubstate, stepNFASubstate, makeNFASubstate } from "./internals";


export interface MatchResult<T> {
    data: T;
    bindings: Record<string, Thing[] | Thing>;
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
    const addIfNotAlreadySeen = (item: NFASubstate<T>, hashSet: Record<number, true>, list: NFASubstate<T>[], insertAt = Infinity) => {
        hashSet[item._hash] || (hashSet[item._hash] = true, list.splice(insertAt, 0, item));
    }
    const zippy = (index: number, input: Thing | null, end: boolean) => {
        const waitingHashes = {};
        const progressHashes = {};
        while (progressStates.length > 0) {
            const orig = progressStates.shift()!;
            const result = stepNFASubstate(orig, input, index, end);
            for (var j = 0, k = 0; j < result.length; j++) {
                const newItem = result[j]!;
                if (newItem._complete) {
                    results.push({
                        data: newItem._data,
                        bindings: Object.fromEntries(Object.entries(newItem._bindingSpans).map(k => [k[0], newItem._atomicBindings.includes(k[0]) ? source[k[1][0]]! : source.slice(k[1][0], k[1][1]!)])),
                        span: [newItem._startIndex, index],
                    });
                }
                else if (newItem === orig || input !== null) {
                    addIfNotAlreadySeen(newItem, waitingHashes, waitingStates);
                }
                else {
                    addIfNotAlreadySeen(newItem, progressHashes, progressStates, k);
                    k++;
                }
            }
        }
        const temp = waitingStates;
        waitingStates = progressStates;
        progressStates = temp;
    };
    for (var inputIndex = 0; inputIndex < source.length; inputIndex++) {
        for (var i = 0; i < patterns.length; i++) {
            progressStates.push(makeNFASubstate(inputIndex, patterns[i]![1], [[patterns[i]![0], 0]]));
        }
        zippy(inputIndex, null, false);
        zippy(inputIndex, source[inputIndex]!, false);
    }
    zippy(inputIndex, null, true);
    return results;
}
