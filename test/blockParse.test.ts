import { describe, expect, test } from "bun:test";
import { parse, ThingType, unparse } from "../src";
import { expectParse, expectParseError, makespec } from "./astCheck";

test("top-level block", () => {
    expectParse("",
        makespec(ThingType.toplevel_block));
});
test("symbol", () => {
    expectParse("hello",
        makespec(ThingType.toplevel_block, null,
            makespec(ThingType.name_symbol, "hello")));
});
test("raw string", () => {
    expectParse("'hello'",
        makespec(ThingType.toplevel_block, null,
            makespec(ThingType.string, "hello")));
});
test("string", () => {
    expectParse('"hello"',
        makespec(ThingType.toplevel_block, null,
            makespec(ThingType.string, "hello")));
});
describe("numbers", () => {
    test("float", () => {
        expectParse("123.45",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.number, 123.45)));
    });
    test("scientific", () => {
        expectParse("123.45e67",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.number, 123.45e67)));
    });
    test("int", () => {
        expectParse("123",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.number, 123)));
    });
    test("hex", () => {
        expectParse("0x123",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.number, 0x123)));
    });
    test("bin", () => {
        expectParse("0b111",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.number, 0b111)));
    });
});
describe("strings", () => {
    test("parses raw string and ignores escapes except for single 's", () => {
        expectParse("'hello\\u0001'",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.string, "hello\\u0001")));
        expectParse("'hello\\u{a234'",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.string, "hello\\u{a234")));
        expectParse("'hello\\''",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.string, "hello'")));
    });
    test("parses normal string and processes escapes", () => {
        expectParse("\"hello\\u0001\"",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.string, "hello\u0001")));
        expectParseError("\"\\u{1234567890}\"", "escape out of range");
        expectParseError("\"\\u{\"", "\"\\\"\" was never closed");
    });
    test("parses string with interpolations", () => {
        expectParse("\"hello {world+\"another string\"}\"",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.string_block, null,
                    makespec(ThingType.string, "hello "),
                    makespec(ThingType.round_block, null,
                        makespec(ThingType.name_symbol, "world"),
                        makespec(ThingType.operator_symbol, "+"),
                        makespec(ThingType.string, "another string")))));
    });
});
describe("symbols", () => {
    test("operators and words", () => {
        expectParse("a+b",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.name_symbol, "a"),
                makespec(ThingType.operator_symbol, "+"),
                makespec(ThingType.name_symbol, "b")));
    });
    test("operators don't get merged", () => {
        expectParse("a+=&b",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.name_symbol, "a"),
                makespec(ThingType.operator_symbol, "+"),
                makespec(ThingType.operator_symbol, "="),
                makespec(ThingType.operator_symbol, "&"),
                makespec(ThingType.name_symbol, "b")));
    });
    test("whitespace counts as a symbol", () => {
        expectParse("  ",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.space_symbol, "  ")));
    });
});
describe("blocks", () => {
    test("blocks can nest", () => {
        expectParse("([{}])",
            makespec(ThingType.toplevel_block, null,
                makespec(ThingType.round_block, null,
                    makespec(ThingType.square_block, null,
                        makespec(ThingType.curly_block, null)))));
    });
    describe("comment blocks", () => {
        test("comment blocks ignore all inside", () => {
            expectParse("##((((\"'//[}[)##",
                makespec(ThingType.toplevel_block, null,
                    makespec(ThingType.space_symbol, null)));
        });
        test("line comment blocks can be terminated with EOF or newline", () => {
            expectParse("# hi\n",
                makespec(ThingType.toplevel_block, null,
                    makespec(ThingType.space_symbol, null)));
            expectParse("# hi",
                makespec(ThingType.toplevel_block, null,
                    makespec(ThingType.space_symbol, null)));
        });
        test("comments round-trip", () => {
            expect(unparse(parse("## hi ##"))).toEqual("## hi ##")
            expect(unparse(parse("# hi\n"))).toEqual("# hi\n")
        });
        test("block comments complain if they're not closed", () => {
            expectParseError("##", "\"##\" was never closed");
        });
    });
});
