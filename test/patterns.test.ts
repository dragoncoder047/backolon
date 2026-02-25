import { describe, expect, test } from "bun:test";
import { bestMatch, boxNameSymbol, boxNumber, doMatchPatterns, Thing, ThingType } from "../src";
import { makeNFASubstate, stepNFASubstate } from "../src/patterns/internals";
import { L } from "./astCheck";

describe("step pattern NFA substates", () => {
    test("detects done", () => {
        const pat = new Thing(ThingType.pattern_sequence, [], null, "", "", "", L);
        expect(stepNFASubstate(makeNFASubstate(0, null, [[pat, 2000]], {}, false), null, 1, true))
            .toEqual([makeNFASubstate(0, null, [], {}, true)]);
    })
    test("advances anchor cmds", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_anchor, [], true, "", "", "", L),
            new Thing(ThingType.pattern_anchor, [], false, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const sStep = makeNFASubstate(0, null, [[pat, 1]], {}, false);
        const sStep2 = makeNFASubstate(0, null, [[pat, 2]], {}, false);
        expect(stepNFASubstate(state, null, 0, false))
            .toEqual([sStep]);
        expect(stepNFASubstate(state, null, 1, false))
            .toEqual([]);
        expect(stepNFASubstate(sStep, null, 0, true))
            .toEqual([sStep2]);
        expect(stepNFASubstate(sStep, null, 0, false))
            .toEqual([]);
    });
    test("basic sequence", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_value, [boxNumber(2, L)], null, "", "", "", L),
            new Thing(ThingType.pattern_match_value, [boxNumber(3, L)], null, "", "", "", L),
            new Thing(ThingType.pattern_match_value, [boxNumber(4, L)], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const x1 = stepNFASubstate(state, boxNumber(0, L), 0, false);
        const c1 = stepNFASubstate(state, boxNumber(2, L), 0, false);
        expect(x1).toEqual([]);
        expect(c1).toEqual([makeNFASubstate(0, null, [[pat, 1]], {}, false)]);
        const x2 = stepNFASubstate(c1[0]!, boxNumber(1, L), 0, false);
        const c2 = stepNFASubstate(c1[0]!, boxNumber(3, L), 0, false);
        expect(x2).toEqual([]);
        expect(c2).toEqual([makeNFASubstate(0, null, [[pat, 2]], {}, false)]);
        const x3 = stepNFASubstate(c2[0]!, boxNumber(2, L), 0, false);
        const c3 = stepNFASubstate(c2[0]!, boxNumber(4, L), 0, false);
        expect(x3).toEqual([]);
        expect(c3).toEqual([makeNFASubstate(0, null, [[pat, 3]], {}, false)]);
        const c4 = stepNFASubstate(c3[0]!, null, 0, false);
        expect(c4).toEqual([makeNFASubstate(0, null, [], {}, true)]);
    });
    test("matches by type", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_type, [], ThingType.name_symbol, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const sStep = makeNFASubstate(0, null, [[pat, 1]], {}, false);
        const input1 = boxNameSymbol("hi", L);
        const input2 = boxNameSymbol("bye", L);
        const input3 = boxNumber(123, L);
        expect(stepNFASubstate(state, null, 0, false))
            .toEqual([state]);
        expect(stepNFASubstate(state, input1, 0, false))
            .toEqual([sStep]);
        expect(stepNFASubstate(state, input2, 0, false))
            .toEqual([sStep]);
        expect(stepNFASubstate(state, input3, 0, false))
            .toEqual([]);
    });
    test("matches by value", () => {
        const input1 = boxNameSymbol("hi", L);
        const input2 = boxNameSymbol("bye", L);
        const input3 = boxNumber(123, L);
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_value, [input1], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const sStep = makeNFASubstate(0, null, [[pat, 1]], {}, false);
        expect(stepNFASubstate(state, null, 0, false))
            .toEqual([state]);
        expect(stepNFASubstate(state, input1, 0, false))
            .toEqual([sStep]);
        expect(stepNFASubstate(state, input2, 0, false))
            .toEqual([]);
        expect(stepNFASubstate(state, input3, 0, false))
            .toEqual([]);
    });
    test("processed capture groups", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_capture, [
                boxNameSymbol("foo", L),
                new Thing(ThingType.pattern_match_type, [], ThingType.number, "", "", "", L)
            ], null, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const stepped = stepNFASubstate(state, null, 12345, false);
        const stepped2 = stepNFASubstate(stepped[0]!, boxNumber(123, L), 0, false);
        expect(stepped).toEqual([makeNFASubstate(0, null, [[pat, 0], [pat.children[0]!, 1]], { foo: [12345, null] }, false)]);
        expect(stepNFASubstate(stepped[0]!, null, 0, false)).toEqual([stepped[0]!]);
        expect(stepped2).toEqual([makeNFASubstate(0, null, [[pat, 0], [pat.children[0]!, 2]], { foo: [12345, null] }, false)]);
        expect(stepNFASubstate(stepped[0]!, boxNameSymbol("hi", L), 0, false)).toEqual([]);
        expect(stepNFASubstate(stepped2[0]!, null, 23456, false))
            .toEqual([makeNFASubstate(0, null, [[pat, 1]], { foo: [12345, 23456] }, false)]);
    });
    test("alternatives", () => {
        const indexes = new Array(100).fill(0).map((_, i) => i);
        const inputs = indexes.map(n => boxNumber(n, L));
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_alternatives, inputs.map(n =>
                new Thing(ThingType.pattern_match_value, [n], null, "", "", "", L),
            ), null, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const stepped = stepNFASubstate(state, null, 0, false);
        expect(stepped).toEqual(indexes.map(n =>
            makeNFASubstate(0, null, [[pat, 0], [pat.children[0]!, n]], {}, false),
        ));
        for (var i = 0; i < stepped.length; i++) {
            for (var j = 0; j < inputs.length; j++) {
                expect(stepNFASubstate(stepped[i]!, inputs[j]!, 0, false))
                    .toEqual(i === j ? [
                        makeNFASubstate(0, null, [[pat, 1]], {}, false)
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
        const state = makeNFASubstate(0, null, [[lazypattern, 0]], {}, false);
        const state2 = makeNFASubstate(0, null, [[greedypattern, 0]], {}, false);
        const stepped = stepNFASubstate(state, null, 0, false);
        const stepped2 = stepNFASubstate(state2, null, 0, false);
        expect(stepped).toEqual([
            makeNFASubstate(0, null, [[lazypattern, 1]], {}, false),
            makeNFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]], {}, false),
        ]);
        expect(stepped2).toEqual([
            makeNFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]], {}, false),
            makeNFASubstate(0, null, [[greedypattern, 1]], {}, false),
        ]);
        expect(stepNFASubstate(stepped[0]!, null, 0, false))
            .toEqual([makeNFASubstate(0, null, [], {}, true)]);
        expect(stepNFASubstate(stepped[1]!, null, 0, false))
            .toEqual([stepped[1]!]);
        expect(stepNFASubstate(stepped[1]!, input, 0, false))
            .toEqual([makeNFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 1]], {}, false)]);
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
        const state = makeNFASubstate(0, null, [[lazypattern, 0]], {}, false);
        const state2 = makeNFASubstate(0, null, [[greedypattern, 0]], {}, false);
        const stepped = stepNFASubstate(state, null, 0, false);
        const stepped2 = stepNFASubstate(state2, null, 0, false);
        // repeat is 1-or-more so the first time should always jump in
        expect(stepped).toEqual([
            makeNFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]], {}, false),
        ]);
        expect(stepped2).toEqual([
            makeNFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]], {}, false),
        ]);
        const step2 = stepNFASubstate(stepNFASubstate(stepped[0]!, input, 0, false)[0]!, null, 0, false);
        const step22 = stepNFASubstate(stepNFASubstate(stepped2[0]!, input, 0, false)[0]!, null, 0, false);
        // after repeat: the result index should have the exit first if lazy
        expect(step2).toEqual([
            makeNFASubstate(0, null, [[lazypattern, 1]], {}, false),
            makeNFASubstate(0, null, [[lazypattern, 0], [lazypattern.children[0]!, 0]], {}, false),
        ]);
        expect(step22).toEqual([
            makeNFASubstate(0, null, [[greedypattern, 0], [greedypattern.children[0]!, 0]], {}, false),
            makeNFASubstate(0, null, [[greedypattern, 1]], {}, false),
        ]);
    });
});
describe("full pattern match", () => {
    test("empty matches don't lock up or spam", () => {
        const pat = new Thing(ThingType.pattern_sequence, [], null, "", "", "", L);
        const indexes = new Array(1000).fill(0).map((_, i) => i);
        const data = ["test", 22] as const;
        const inputs = indexes.map(n => boxNumber(n, L));

        const result = doMatchPatterns(inputs, [[pat, data]]);
        expect(result).toEqual(indexes.map(i => ({
            data,
            bindings: {},
            span: [i, i]
        })));
    });
    test("basic sequence search", () => {
        const targetSpan = [10, 100];
        const inputs = new Array(1000).fill(0).map((_, n) => boxNumber(n, L));
        const pat = new Thing(ThingType.pattern_sequence, inputs.slice(targetSpan[0], targetSpan[1]).map(n =>
            new Thing(ThingType.pattern_match_value, [n], null, "", "", "", L),
        ), null, "", "", "", L);
        const result = doMatchPatterns(inputs, [[pat, null]]);
        expect(result).toEqual([
            {
                data: null,
                bindings: {},
                span: targetSpan as any,
            }
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
        expect(resultGreedy[0]!.span).toEqual([0, zeros.length]);
        expect(resultLazy[0]!.span).toEqual([0, 1]);
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
            expect(byStartGreedy[n]).toEqual(zeros.slice(n).map((_, i) => i + n + 1));
        }
        for (var key of Object.keys(byStartLazy)) {
            const n = Number(key);
            expect(byStartLazy[n]).toEqual(zeros.slice(n).map((_, i) => zeros.length - i + n));
        }
    })
});
