import { ErrorNote, LocationTrace, ParseError, UNKNOWN_LOCATION } from "../errors";
import { boxBlock, boxString, boxStringBlock, isBlock, isSymbol, Thing, ThingType } from "../objects/thing";
import { blockParse, BlockRule } from "./blockParse";
import { tokenize } from "./tokenizer";
import { unparse } from "./unparse";

const baseBlocks = {
    "(": "round",
    "[": "square",
    "{": "curly",
    '"': "string",
    "'": "rawstring",
    "##": "comment",
    "# ": "lineComment",
}

function makeBlock(this: BlockRule, items: Thing[], start: string, end: string, loc: LocationTrace) {
    return boxBlock(items, this.t, loc, start, end);
}

function makeComment(items: Thing[], start: string, end: string, loc: LocationTrace) {
    return new Thing(ThingType.sym_space, [], start, start + items.map(i => unparse(i)).join(""), end, "", loc);
}

const defaultBlockRules: Record<string, BlockRule> = {
    toplevel: {
        t: ThingType.blk_top,
        e: [null],
        x: [],
        i: baseBlocks,
        p: makeBlock,
    },
    round: {
        t: ThingType.blk_round,
        e: [")"],
        x: [],
        i: baseBlocks,
        p: makeBlock,
    },
    square: {
        t: ThingType.blk_square,
        e: ["]"],
        x: [],
        i: baseBlocks,
        p: makeBlock,
    },
    curly: {
        t: ThingType.blk_curly,
        e: ["}"],
        x: [],
        i: baseBlocks,
        p: makeBlock,
    },
    rawstring: {
        t: ThingType.blk_str,
        e: ["'"],
        x: ["\\'", "\\\\"],
        i: {},
        p(items, start, end, loc) {
            if (end !== start) throw new ParseError("unreachable", loc);
            const raw = items.map(item => unparse(item)).join("");
            return boxString(raw.replaceAll(/\\(['\\])/g, "$1"), loc, raw, start);
        },
    },
    string: {
        t: ThingType.blk_str,
        e: ['"'],
        x: ['\\"', "\\\\", "\\{"],
        i: { "{": "stringInterpolation" },
        p(items, start, end, loc) {
            var curString = "", curStringRaw = "", startLoc: LocationTrace | null = loc;
            const bits: Thing[] = [];
            const chuck = () => {
                bits.push(boxString(curString, startLoc!, curStringRaw, ""));
                curString = curStringRaw = "";
                startLoc = null;
            }
            for (var i = 0; i < items.length; i++) {
                const item = items[i]!;
                if (isBlock(item)) {
                    chuck();
                    bits.push(item);
                    continue;
                }
                startLoc ??= item.loc;
                if (item.v === "\\") {
                    // Process escape characters
                    const next = items[++i];
                    if (!next) throw new ParseError("unreachable (backslash at end of string)", item.loc);
                    if (/^['"{}]$/.test(next.v as string)) {
                        curStringRaw += "\\" + next.v;
                        curString += next.v;
                    } else if (isSymbol(next)) {
                        const escPortion = unescape(next.v, next.loc, false);
                        if (escPortion.length === 0) {
                            const curlyblock = items[++i];
                            if (!curlyblock || !isBlock(curlyblock)) {
                                throw new ParseError(`expected \"{\" after \"\\${next.v}\"`, (curlyblock ?? next).loc,
                                    [new ErrorNote("note: use ' instead of \" to make this a raw string", loc)]);
                            }
                            const fullEscape = "u" + unparse(curlyblock);
                            curStringRaw += "\\" + fullEscape;
                            curString += unescape(fullEscape, curlyblock.loc, true);
                        } else {
                            curStringRaw += "\\" + next.v;
                            curString += escPortion;
                        }
                    } else throw new ParseError("invalid escape", next.loc);
                } else {
                    curStringRaw += item.v;
                    curString += item.v;
                }
            }
            if (bits.length === 0) chuck();
            return bits.length === 1 ? bits[0]! : boxStringBlock(bits, loc, start);
        },
    },
    stringInterpolation: {
        t: ThingType.blk_round,
        e: ["}"],
        x: [],
        i: baseBlocks,
        p: makeBlock,
    },
    comment: {
        t: ThingType.blk_round,
        e: ["##"],
        x: [],
        i: {},
        p: makeComment,
    },
    lineComment: {
        t: ThingType.blk_round,
        e: ["\n", null],
        x: [],
        i: {},
        p: makeComment,
    }
}


// string string string
function unescape(string: string, src: LocationTrace, variable: boolean): string {
    if (variable) {
        if (!/^u\{[a-f0-9]+\}$/i.test(string)) throw new ParseError("invalid escape sequence", src);
        return hexEsc(string, src);
    } else if (/^u$/i.test(string)) return "";
    const escapeLen = {
        a: 1, b: 1, e: 1, f: 1, n: 1, r: 1, t: 1, v: 1, z: 1, '"': 1, "'": 1, "\\": 1,
        x: 3, u: 5
    }[string[0]!];
    if (!escapeLen) throw new ParseError("unknown escaped character", src);
    const afterPortion = string.slice(escapeLen);
    string = string.slice(0, escapeLen);
    if (string.length < escapeLen || !/^.[a-f0-9]*$/i.test(string)) throw new ParseError("invalid escape sequence", src);
    return ({
        a: "\a", b: "\b", e: "\e", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", z: "\0", "'": "'", "\"": "\"", "\\": "\\",
        x: false as const,
        u: false as const
    }[string.toLowerCase()[0]!] || hexEsc(string, src)) + afterPortion;
}

function hexEsc(string: string, src: LocationTrace): string {
    try {
        return String.fromCodePoint(parseInt(/[0-9a-f]+/i.exec(string)![0], 16));
    } catch (e: any) {
        if (e instanceof RangeError) {
            const e2 = new ParseError("escape out of range", src);
            e2.cause = e;
            throw e2;
        }
    }
    throw new ParseError("unreachable", src);
}

export function parse(string: string, filename: URL = UNKNOWN_LOCATION.file) {
    return blockParse(tokenize(string, filename), defaultBlockRules, "toplevel");
}
