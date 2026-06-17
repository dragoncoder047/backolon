import { LocationTrace, Token, tokenize } from "@r47onfire/backolon";
import { expect, test } from "bun:test";
import { F } from "./astCheck";

const getTokenContents = (a: Token[]) => a.map(t => t.text);
const getTokenTypes = (a: Token[]) => a.map(t => t.type)

test("doesn't make assumptions about comments", () => {
    const x = tokenize("# foo");
    const y = tokenize("## foo ##");
    expect(getTokenContents(x)).toEqual(["#", " ", "foo"]);
    expect(getTokenContents(y)).toEqual(["#", "#", " ", "foo", " ", "#", "#"]);
    expect(getTokenTypes(x)).toEqual(["operator", "space", "name"]);
    expect(getTokenTypes(y)).toEqual(["operator", "operator", "space", "name", "space", "operator", "operator"]);
});
test("groups name tokens", () => {
    expect(getTokenContents(tokenize("a b coffee", F))).toEqual(["a", " ", "b", " ", "coffee"]);
});
test("'_' is a valid name", () => {
    expect(getTokenTypes(tokenize("_", F))).toEqual(["name"]);
});
test("'_' gets separated from operators", () => {
    expect(getTokenTypes(tokenize(":_+", F))).toEqual(["operator", "name", "operator"]);
});
test("maintains column and line", () => {
    expect(tokenize("a\nb c", F).map(t => t.source)).toEqual([
        new LocationTrace(0, 0, F),
        new LocationTrace(0, 1, F),
        new LocationTrace(1, 0, F),
        new LocationTrace(1, 1, F),
        new LocationTrace(1, 2, F)]);
});
test("parses hex numbers", () => {
    const x = tokenize("0xFFE65A", F);
    expect(x).toEqual([{ type: "number", text: "0xFFE65A", source: new LocationTrace(0, 0, F) }]);
});
test("parses binary numbers", () => {
    const x = tokenize("0b00010001", F);
    expect(x).toEqual([{ type: "number", text: "0b00010001", source: new LocationTrace(0, 0, F) }]);
});
test("parses float numbers", () => {
    const x = tokenize("123456.789E+56", F);
    expect(x).toEqual([{ type: "number", text: "123456.789E+56", source: new LocationTrace(0, 0, F) }]);
});
test("invalid float numbers get broken up", () => {
    const x = tokenize("123456..789E+56", F);
    expect(x).toEqual([
        { type: "number", text: "123456.", source: new LocationTrace(0, 0, F) },
        { type: "number", text: ".789E+56", source: new LocationTrace(0, 7, F) }
    ]);
});
test("newline is a separate token from space", () => {
    const x = tokenize("\n ", F);
    expect(x).toEqual([
        { type: "newline", text: "\n", source: new LocationTrace(0, 0, F) },
        { type: "space", text: " ", source: new LocationTrace(1, 0, F) }
    ]);
});
