import { describe, expect, test } from "bun:test";
import { boxNameSymbol, boxNumber, doMatchPatterns, MatchResult, Thing, ThingType } from "../src";
import { NFASubstate } from "../src/patterns/internals";
import { L } from "./astCheck";

describe("step pattern NFA substates", () => {
    test("detects done", () => {
        const pat = new Thing(ThingType.pattern_sequence, [], null, "", "", "", L);
        expect(new NFASubstate(0, null, [[pat, 2000]])._step(null, 1, true))
            .toEqual([new NFASubstate(0, null, [], {}, true)]);
    })
    test("advances anchor cmds", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_anchor, [], true, "", "", "", L),
            new Thing(ThingType.pattern_anchor, [], false, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const sStep = new NFASubstate(0, null, [[pat, 1]]);
        const sStep2 = new NFASubstate(0, null, [[pat, 2]]);
        expect(state._step(null, 0, false))
            .toEqual([sStep]);
        expect(state._step(null, 1, false))
            .toEqual([]);
        expect(sStep._step(null, 0, true))
            .toEqual([sStep2]);
        expect(sStep._step(null, 0, false))
            .toEqual([]);
    });
    test("basic sequence", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_value, [boxNumber(2, L)], null, "", "", "", L),
            new Thing(ThingType.pattern_match_value, [boxNumber(3, L)], null, "", "", "", L),
            new Thing(ThingType.pattern_match_value, [boxNumber(4, L)], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const x1 = state._step(boxNumber(0, L), 0, false);
        const c1 = state._step(boxNumber(2, L), 0, false);
        expect(x1).toEqual([]);
        expect(c1).toEqual([new NFASubstate(0, null, [[pat, 1]])]);
        const x2 = c1[0]!._step(boxNumber(1, L), 0, false);
        const c2 = c1[0]!._step(boxNumber(3, L), 0, false);
        expect(x2).toEqual([]);
        expect(c2).toEqual([new NFASubstate(0, null, [[pat, 2]])]);
        const x3 = c2[0]!._step(boxNumber(2, L), 0, false);
        const c3 = c2[0]!._step(boxNumber(4, L), 0, false);
        expect(x3).toEqual([]);
        expect(c3).toEqual([new NFASubstate(0, null, [[pat, 3]])]);
        const c4 = c3[0]!._step(null, 0, false);
        expect(c4).toEqual([new NFASubstate(0, null, [], {}, true)]);
    });
    test("matches by type", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_type, [], ThingType.name_symbol, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const sStep = new NFASubstate(0, null, [[pat, 1]]);
        const input1 = boxNameSymbol("hi", L);
        const input2 = boxNameSymbol("bye", L);
        const input3 = boxNumber(123, L);
        expect(state._step(null, 0, false))
            .toEqual([state]);
        expect(state._step(input1, 0, false))
            .toEqual([sStep]);
        expect(state._step(input2, 0, false))
            .toEqual([sStep]);
        expect(state._step(input3, 0, false))
            .toEqual([]);
    });
    test("matches by value", () => {
        const input1 = boxNameSymbol("hi", L);
        const input2 = boxNameSymbol("bye", L);
        const input3 = boxNumber(123, L);
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_value, [input1], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const sStep = new NFASubstate(0, null, [[pat, 1]]);
        expect(state._step(null, 0, false))
            .toEqual([state]);
        expect(state._step(input1, 0, false))
            .toEqual([sStep]);
        expect(state._step(input2, 0, false))
            .toEqual([]);
        expect(state._step(input3, 0, false))
            .toEqual([]);
    });
    test("processed capture groups", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_capture, [
                boxNameSymbol("foo", L),
                new Thing(ThingType.pattern_match_type, [], ThingType.number, "", "", "", L)
            ], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const stepped = state._step(null, 12345, false);
        const stepped2 = stepped[0]!._step(boxNumber(123, L), 0, false);
        expect(stepped).toEqual([new NFASubstate(0, null, [[pat, 0], [pat.children[0]!, 1]], { foo: [12345, null] }, false, ["foo"])]);
        expect(stepped[0]!._step(null, 0, false)).toEqual([stepped[0]!]);
        expect(stepped2).toEqual([new NFASubstate(0, null, [[pat, 0], [pat.children[0]!, 2]], { foo: [12345, null] }, false, ["foo"])]);
        expect(stepped[0]!._step(boxNameSymbol("hi", L), 0, false)).toEqual([]);
        expect(stepped2[0]!._step(null, 23456, false))
            .toEqual([new NFASubstate(0, null, [[pat, 1]], { foo: [12345, 23456] }, false, ["foo"])]);
    });
    test("alternatives", () => {
        const indexes = new Array(1000).fill(0).map((_, i) => i);
        const inputs = indexes.map(n => boxNumber(n, L));
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_alternatives, inputs.map(n =>
                new Thing(ThingType.pattern_match_value, [n], null, "", "", "", L),
            ), null, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[pat, 0]]);
        const stepped = state._step(null, 0, false);
        expect(stepped).toEqual(indexes.map(n =>
            new NFASubstate(0, null, [[pat, 0], [pat.children[0]!, n]]),
        ));
        for (var i = 0; i < stepped.length; i++) {
            for (var j = 0; j < inputs.length; j++) {
                expect(stepped[i]!._step(inputs[j]!, 0, false))
                    .toEqual(i === j ? [
                        new NFASubstate(0, null, [[pat, 1]])
                    ] : [])
            }
        }
    });
    test("optional", () => {
        const input = boxNameSymbol("hi", L);
        const lazypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_optional, [
                new Thing(ThingType.pattern_match_value, [input], null, "", "", "", L),
            ], false, "", "", "", L),
        ], null, "", "", "", L);
        const greedypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_optional, [
                new Thing(ThingType.pattern_match_value, [input], null, "", "", "", L),
            ], true, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[lazypattern, 0]]);
        const state2 = new NFASubstate(0, null, [[greedypattern, 0]]);
        const stepped = state._step(null, 0, false);
        const stepped2 = state2._step(null, 0, false);
        expect(stepped).toEqual([
            new NFASubstate(0, null, [[lazypattern, 1]]),
            new NFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]]),
        ]);
        expect(stepped2).toEqual([
            new NFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]]),
            new NFASubstate(0, null, [[greedypattern, 1]]),
        ]);
        expect(stepped[0]!._step(null, 0, false))
            .toEqual([new NFASubstate(0, null, [], {}, true)]);
        expect(stepped[1]!._step(null, 0, false))
            .toEqual([stepped[1]!]);
        expect(stepped[1]!._step(input, 0, false))
            .toEqual([new NFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 1]])]);
    });
    test("repeat", () => {
        const input = boxNameSymbol("hi", L);
        const lazypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [input], null, "", "", "", L),
            ], false, "", "", "", L),
        ], null, "", "", "", L);
        const greedypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [input], null, "", "", "", L),
            ], true, "", "", "", L),
        ], null, "", "", "", L);
        const state = new NFASubstate(0, null, [[lazypattern, 0]]);
        const state2 = new NFASubstate(0, null, [[greedypattern, 0]]);
        const stepped = state._step(null, 0, false);
        const stepped2 = state2._step(null, 0, false);
        // repeat is 1-or-more so the first time should always jump in
        expect(stepped).toEqual([
            new NFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]]),
        ]);
        expect(stepped2).toEqual([
            new NFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]]),
        ]);
        const step2 = stepped[0]!._step(input, 0, false)[0]!._step(null, 0, false);
        const step22 = stepped2[0]!._step(input, 0, false)[0]!._step(null, 0, false);
        // after repeat: the result index should have the exit first if lazy
        expect(step2).toEqual([
            new NFASubstate(0, null, [[lazypattern, 1]]),
            new NFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]]),
        ]);
        expect(step22).toEqual([
            new NFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]]),
            new NFASubstate(0, null, [[greedypattern, 1]]),
        ]);
    });
});
describe("full pattern match", () => {
    test("empty matches don't lock up or spam", () => {
        const pat = new Thing(ThingType.pattern_sequence, [], null, "", "", "", L);
        const indexes = new Array(10000).fill(0).map((_, i) => i);
        const data = ["test", 22] as const;
        const inputs = indexes.map(n => boxNumber(n, L));

        const result = doMatchPatterns(inputs, [[pat, data]]);
        expect(result).toEqual(indexes.map(i => new MatchResult(
            data,
            {},
            [i, i]
        )));
    });
    test("basic sequence search", () => {
        const targetSpan = [100, 900];
        const inputs = new Array(10000).fill(0).map((_, n) => boxNumber(n, L));
        const pat = new Thing(ThingType.pattern_sequence, inputs.slice(targetSpan[0], targetSpan[1]).map(n =>
            new Thing(ThingType.pattern_match_value, [n], null, "", "", "", L),
        ), null, "", "", "", L);
        const result = doMatchPatterns(inputs, [[pat, null]]);
        expect(result).toEqual([
            new MatchResult(
                null,
                {},
                targetSpan as any,
            )
        ]);
    });
    test("repeat finds all occurrences", () => {
        const zeros = new Array(300).fill(0).map(_ => boxNumber(0, L));
        const greedypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
            ], true, "", "", "", L),
        ], null, "", "", "", L);
        const lazypattern = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
            ], false, "", "", "", L),
        ], null, "", "", "", L);
        const resultGreedy = doMatchPatterns(zeros, [[greedypattern, null]]);
        const resultLazy = doMatchPatterns(zeros, [[lazypattern, null]]);
        // expect(resultGreedy[0]!.span).toEqual([0, zeros.length]);
        // expect(resultLazy[0]!.span).toEqual([0, 1]);
        const byStartGreedy: Record<number, number[]> = {};
        for (var result of resultGreedy) {
            (byStartGreedy[result.span[0]] ??= []).push(result.span[1]);
        }
        const byStartLazy: Record<number, number[]> = {};
        for (var result of resultLazy) {
            (byStartLazy[result.span[0]] ??= []).push(result.span[1]);
        }
        expect(Object.keys(byStartGreedy)).toEqual(zeros.map((_, i) => String(i)));
        expect(Object.keys(byStartLazy)).toEqual(zeros.map((_, i) => String(i)));
        for (var key of Object.keys(byStartGreedy)) {
            const n = Number(key);
            expect(byStartGreedy[n]).toEqual(zeros.slice(n).map((_, i) => zeros.length - i));
        }
        for (var key of Object.keys(byStartLazy)) {
            const n = Number(key);
            expect(byStartLazy[n]).toEqual(zeros.slice(n).map((_, i) => i + n + 1));
        }
    });
    test("alternation", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_alternatives, [
                new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
                new Thing(ThingType.pattern_sequence, [
                    new Thing(ThingType.pattern_match_value, [boxNumber(1, L)], null, "", "", "", L),
                    new Thing(ThingType.pattern_match_value, [boxNumber(2, L)], null, "", "", "", L)
                ], null, "", "", "", L),
            ], null, "", "", "", L),
        ], null, "", "", "", L);
        const inputs = [
            boxNumber(2, L),
            boxNumber(1, L),
            boxNumber(7, L),
            boxNumber(0, L),
            boxNumber(1, L),
            boxNumber(4, L),
            boxNumber(2, L),
            boxNumber(0, L),
            boxNumber(1, L),
            boxNumber(2, L),
        ];
        const results = doMatchPatterns(inputs, [[pat, null]]);
        expect(results).toEqual([
            new MatchResult(
                null,
                {},
                [3, 4]
            ),
            new MatchResult(
                null,
                {},
                [7, 8]
            ),
            new MatchResult(
                null,
                {},
                [8, 10]
            )
        ]);
    })
    test("capture groups", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
            new Thing(ThingType.pattern_capture, [
                boxNameSymbol("foo", L),
                new Thing(ThingType.pattern_match_type, [], ThingType.name_symbol, "", "", "", L),
            ], null, "", "", "", L),
            new Thing(ThingType.pattern_match_value, [boxNumber(1, L)], null, "", "", "", L),
        ], null, "", "", "", L);
        const inputs = [
            boxNumber(2, L),
            boxNameSymbol("bye", L),
            boxNumber(1, L),
            boxNumber(7, L),
            boxNumber(0, L),
            boxNameSymbol("hi2", L),
            boxNumber(1, L),
            boxNumber(4, L),
            boxNumber(2, L),
            boxNumber(0, L),
            boxNameSymbol("hi3", L),
            boxNumber(1, L),
        ];
        const results = doMatchPatterns(inputs, [[pat, null]]);
        expect(results).toEqual([
            {
                data: null,
                bindings: { foo: boxNameSymbol("hi2", L) },
                span: [4, 7]
            },
            {
                data: null,
                bindings: { foo: boxNameSymbol("hi3", L) },
                span: [9, 12]
            }
        ]);
    });
    test("lazy vs. greedy grouping", () => {
        const lazyfirstpat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_anchor, [], true, "", "", "", L),
            new Thing(ThingType.pattern_capture, [
                boxNameSymbol("foo", L),
                new Thing(ThingType.pattern_repeat, [
                    new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
                ], false, "", "", "", L),
            ], null, "", "", "", L),
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
            ], true, "", "", "", L),
            new Thing(ThingType.pattern_anchor, [], false, "", "", "", L),
        ], null, "", "", "", L);
        const lazysecondpat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_anchor, [], true, "", "", "", L),
            new Thing(ThingType.pattern_capture, [
                boxNameSymbol("foo", L),
                new Thing(ThingType.pattern_repeat, [
                    new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
                ], true, "", "", "", L),
            ], null, "", "", "", L),
            new Thing(ThingType.pattern_repeat, [
                new Thing(ThingType.pattern_match_value, [boxNumber(0, L)], null, "", "", "", L),
            ], false, "", "", "", L),
            new Thing(ThingType.pattern_anchor, [], false, "", "", "", L),
        ], null, "", "", "", L);
        const inputs = new Array(300).fill(0).map(_ => boxNumber(0, L));
        const resultslazyfirst = doMatchPatterns(inputs, [[lazyfirstpat, null]]);
        const resultslazysecond = doMatchPatterns(inputs, [[lazysecondpat, null]]);
        expect(resultslazyfirst.map(r => (r.bindings.foo as Thing[]).length))
            .toEqual(inputs.slice(1).map((_, i) => i + 1));
        expect(resultslazysecond.map(r => (r.bindings.foo as Thing[]).length))
            .toEqual(inputs.slice(1).map((_, i) => inputs.length - i - 1));
    })
});
