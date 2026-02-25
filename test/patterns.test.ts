import { describe, expect, test } from "bun:test";
import { boxNameSymbol, boxNumber, Thing, ThingType } from "../src";
import { makeNFASubstate, stepNFASubstate } from "../src/patterns";
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
    test("matches by type", () => {
        const pat = new Thing(ThingType.pattern_sequence, [
            new Thing(ThingType.pattern_match_type, [], ThingType.name_symbol, "", "", "", L),
        ], null, "", "", "", L);
        const state = makeNFASubstate(0, null, [[pat, 0]], {}, false);
        const sStep = makeNFASubstate(0, null, [[pat, 1]], {}, false);
        const input1 = boxNameSymbol("hi", L);
        const input2 = boxNameSymbol("bye", L);
        const input3 = boxNumber(123, L);
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
        expect(stepNFASubstate(state, input1, 0, false))
            .toEqual([sStep]);
        expect(stepNFASubstate(state, input2, 0, false))
            .toEqual([]);
        expect(stepNFASubstate(state, input3, 0, false))
            .toEqual([]);
    });
});
