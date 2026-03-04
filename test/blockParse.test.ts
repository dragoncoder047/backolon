import { describe, expect, test } from "bun:test";
import { parse, ThingType, unparse } from "../src";
import { expectParse, expectParseError, makespec } from "./astCheck";

test("top-level block", () => {
    expectParse("",
        makespec(ThingType.blk_top));
});
test("symbol", () => {
    expectParse("hello",
        makespec(ThingType.blk_top, null,
            makespec(ThingType.sym_name, "hello")));
});
test("raw string", () => {
    expectParse("'hello'",
        makespec(ThingType.blk_top, null,
            makespec(ThingType.string, "hello")));
});
test("string", () => {
    expectParse('"hello"',
        makespec(ThingType.blk_top, null,
            makespec(ThingType.string, "hello")));
});
describe("numbers", () => {
    test("float", () => {
        expectParse("123.45",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.number, 123.45)));
    });
    test("scientific", () => {
        expectParse("123.45e67",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.number, 123.45e67)));
    });
    test("int", () => {
        expectParse("123",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.number, 123)));
    });
    test("hex", () => {
        expectParse("0x123",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.number, 0x123)));
    });
    test("bin", () => {
        expectParse("0b111",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.number, 0b111)));
    });
});
describe("strings", () => {
    test("parses raw string and ignores escapes except for single 's", () => {
        expectParse("'hello\\u0001'",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.string, "hello\\u0001")));
        expectParse("'hello\\u{a234'",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.string, "hello\\u{a234")));
        expectParse("'hello\\''",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.string, "hello'")));
    });
    test("parses normal string and processes escapes", () => {
        expectParse("\"hello\\u0001\"",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.string, "hello\u0001")));
        expectParseError("\"\\u{1234567890}\"", "escape out of range");
        expectParseError("\"\\u{\"", "\"\\\"\" was never closed");
    });
    test("parses string with interpolations", () => {
        expectParse("\"hello {world+\"another string\"}\"",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.blk_str, null,
                    makespec(ThingType.string, "hello "),
                    makespec(ThingType.blk_round, null,
                        makespec(ThingType.sym_name, "world"),
                        makespec(ThingType.sym_op, "+"),
                        makespec(ThingType.string, "another string")))));
    });
});
describe("symbols", () => {
    test("operators and words", () => {
        expectParse("a+b",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.sym_name, "a"),
                makespec(ThingType.sym_op, "+"),
                makespec(ThingType.sym_name, "b")));
    });
    test("operators don't get merged", () => {
        expectParse("a+=&b",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.sym_name, "a"),
                makespec(ThingType.sym_op, "+"),
                makespec(ThingType.sym_op, "="),
                makespec(ThingType.sym_op, "&"),
                makespec(ThingType.sym_name, "b")));
    });
    test("whitespace counts as a symbol", () => {
        expectParse("  ",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.sym_space, "  ")));
    });
});
describe("blocks", () => {
    test("blocks can nest", () => {
        expectParse("([{}])",
            makespec(ThingType.blk_top, null,
                makespec(ThingType.blk_round, null,
                    makespec(ThingType.blk_square, null,
                        makespec(ThingType.blk_curly, null)))));
    });
    describe("comment blocks", () => {
        test("comment blocks ignore all inside", () => {
            expectParse("##((((\"'//[}[)##",
                makespec(ThingType.blk_top, null,
                    makespec(ThingType.sym_space, null)));
        });
        test("line comment blocks can be terminated with EOF or newline", () => {
            expectParse("# hi\n",
                makespec(ThingType.blk_top, null,
                    makespec(ThingType.sym_space, null)));
            expectParse("# hi",
                makespec(ThingType.blk_top, null,
                    makespec(ThingType.sym_space, null)));
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
