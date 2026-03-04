import { expect, test } from "bun:test";
import { LocationTrace, Thing, ThingType } from "../src";
import { tokenize } from "../src/parser/tokenizer";
import { F } from "./astCheck";

const getTokenContents = (a: Thing[]) => a.map(t => t.v);
const getTokenTypes = (a: Thing[]) => a.map(t => t.t)

test("doesn't make assumptions about comments", () => {
    const x = tokenize("# foo", F);
    const y = tokenize("## foo ##", F);
    expect(getTokenContents(x)).toEqual(["#", " ", "foo", null]);
    expect(getTokenContents(y)).toEqual(["#", "#", " ", "foo", " ", "#", "#", null]);
    expect(getTokenTypes(x)).toEqual([ThingType.sym_op, ThingType.sym_space, ThingType.sym_name, ThingType.end]);
    expect(getTokenTypes(y)).toEqual([ThingType.sym_op, ThingType.sym_op, ThingType.sym_space, ThingType.sym_name, ThingType.sym_space, ThingType.sym_op, ThingType.sym_op, ThingType.end]);
});
test("groups name tokens", () => {
    expect(getTokenContents(tokenize("a b coffee", F))).toEqual(["a", " ", "b", " ", "coffee", null]);
});
test("maintains column and line", () => {
    expect(tokenize("a\nb c", F).map(t => t.loc)).toEqual([
        new LocationTrace(0, 0, F),
        new LocationTrace(0, 1, F),
        new LocationTrace(1, 0, F),
        new LocationTrace(1, 1, F),
        new LocationTrace(1, 2, F),
        new LocationTrace(1, 3, F)]);
});
test("parses hex numbers", () => {
    const x = tokenize("0xFFE65A", F);
    expect(x).toBeArrayOfSize(2);
    expect(x[0]).toEqual(new Thing(ThingType.number, [], 0xFFE65A, "0xFFE65A", "", "", new LocationTrace(0, 0, F)));
});
test("parses binary numbers", () => {
    const x = tokenize("0b00010001", F);
    expect(x).toBeArrayOfSize(2);
    expect(x[0]).toEqual(new Thing(ThingType.number, [], 0b00010001, "0b00010001", "", "", new LocationTrace(0, 0, F)));
});
test("parses float numbers", () => {
    const x = tokenize("123456.789E+56", F);
    expect(x).toBeArrayOfSize(2);
    expect(x[0]).toEqual(new Thing(ThingType.number, [], 123456.789E+56, "123456.789E+56", "", "", new LocationTrace(0, 0, F)));
});
test("invalid float numbers get broken up", () => {
    const x = tokenize("123456..789E+56", F);
    expect(x).toBeArrayOfSize(3);
    expect(x[0]).toEqual(new Thing(ThingType.number, [], 123456., "123456.", "", "", new LocationTrace(0, 0, F)));
    expect(x[1]).toEqual(new Thing(ThingType.number, [], .789E+56, ".789E+56", "", "", new LocationTrace(0, 7, F)));
});
