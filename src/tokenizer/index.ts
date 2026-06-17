import { last } from "lib0/array";
import { id } from "lib0/function";
import { BackolonError, LocationTrace, UNKNOWN_LOCATION } from "../errors";

export interface Token {
    type: string;
    text: string;
    source: LocationTrace;
}

type Rule = [
    RegExp,
    string,
];
const TOKENIZE_RULES = [
    [/0x[a-f0-9]+|-?0b[01]+|(\.\d+|\d+\.?\d*)(e[+-]?\d+)?/yi, "number"],
    [/[\p{L}_][\p{L}\p{N}_]*/yu, "name"],
    [/[(){}[\]"']/y, "paren"],
    [/((?!\n)\s)+/y, "space"],
    [/\n(\s+\n)?/y, "newline"],
    [/[\p{P}\p{C}\p{S}]/yu, "operator"],
    [/./y, "unknown"]
] satisfies Rule[];


/**
 * Tokenize Backolon source text into a list of tokens. No further grouping is done;
 * parens like "(" are kept as "paren" tokens.
 */
export function tokenize(source: string, filename: URL = UNKNOWN_LOCATION.file): Token[] {
    var line = 0, col = 0;
    const out: Token[] = [];
    tokens: for (var i = 0; i < source.length;) {
        for (var { 0: regex, 1: type } of TOKENIZE_RULES) {
            regex.lastIndex = i;
            const match = regex.exec(source);
            if (match) {
                const chunk = match[0];
                out.push({
                    type,
                    text: chunk,
                    source: new LocationTrace(line, col, filename)
                });
                const interlines = chunk.split("\n");
                if (interlines.length > 1) {
                    col = last(interlines)!.length;
                    line += interlines.length - 1;
                } else {
                    col += chunk.length;
                }
                i = regex.lastIndex;
                continue tokens;
            }
        }
        // the last rule should always match, we should never get here
        throw new BackolonError("unreachable", new LocationTrace(line, col, filename));
    }
    return out;
}
