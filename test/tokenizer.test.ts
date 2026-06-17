import { Token, createTokenizer, nextToken } from "@r47onfire/backolon";
import { expect, test } from "bun:test";
import { F } from "./astCheck";

const tokenize = (string: string) => {
    const out: Token[] = [];
    var state = createTokenizer(string, F), token: Token;
    while (state.index < string.length) {
        ({ 0: token, 1: state } = nextToken(state));
        out.push(token);
    }
    return out;
}

const getTokenContents = (a: Token[]) => a.map(t => t.text);
const getTokenTypes = (a: Token[]) => a.map(t => t.type)

test("doesn't make assumptions about comments", () => {
    const x = tokenize("# foo");
    const y = tokenize("## foo ##");
    expect(getTokenContents(x)).toEqual(["#", " ", "foo"]);
    expect(getTokenContents(y)).toEqual(["#", "#", " ", "foo", " ", "#", "#"]);
    expect(getTokenTypes(x)).toEqual(["backolon:operator", "backolon:whitespace", "backolon:identifier"]);
    expect(getTokenTypes(y)).toEqual(["backolon:operator", "backolon:operator", "backolon:whitespace", "backolon:identifier", "backolon:whitespace", "backolon:operator", "backolon:operator"]);
});
test("groups identifier tokens", () => {
    expect(getTokenContents(tokenize("a b coffee"))).toEqual(["a", " ", "b", " ", "coffee"]);
});
test("'_' is a valid identifier", () => {
    expect(getTokenTypes(tokenize("_"))).toEqual(["backolon:identifier"]);
});
test("'_' gets separated from operators", () => {
    expect(getTokenTypes(tokenize(":_+"))).toEqual(["backolon:operator", "backolon:identifier", "backolon:operator"]);
});
test("maintains column and line", () => {
    expect(tokenize("a\nb c").map(({ line, col }) => ({ line, col }))).toEqual([
        { line: 0, col: 0 },
        { line: 0, col: 1 },
        { line: 1, col: 0 },
        { line: 1, col: 1 },
        { line: 1, col: 2 }]);
});
test("parses hex numbers", () => {
    const x = tokenize("0xFFE65A");
    expect(x).toEqual([{ type: "backolon:number", text: "0xFFE65A", line: 0, col: 0, src: F }]);
});
test("parses binary numbers", () => {
    const x = tokenize("0b00010001");
    expect(x).toEqual([{ type: "backolon:number", text: "0b00010001", line: 0, col: 0, src: F}]);
});
test("parses float numbers", () => {
    const x = tokenize("123456.789E+56");
    expect(x).toEqual([{ type: "backolon:number", text: "123456.789E+56", line: 0, col: 0, src: F }]);
});
test("invalid float numbers get broken up", () => {
    const x = tokenize("123456..789E+56");
    expect(x).toEqual([
        { type: "backolon:number", text: "123456.", line: 0, col: 0, src: F },
        { type: "backolon:number", text: ".789E+56", line: 0, col: 7, src: F }
    ]);
});
test("newline is a separate token from space", () => {
    const x = tokenize("\n ");
    expect(x).toEqual([
        { type: "backolon:newline", text: "\n", line: 0, col: 0, src: F },
        { type: "backolon:whitespace", text: " ", line: 1, col: 0, src: F }
    ]);
});
