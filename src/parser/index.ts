import { LinkedList, llPop, llPushArray } from "@r47onfire/jeb";
import { Span } from "../errors";
import { SourceTracker } from "../runtime/importer";
import { BackolonVM } from "../runtime/vm";
import { Parselet, parseletComparator } from "./parselet";

export interface Token {
    readonly text: string;
    readonly span: Span;
}

export interface Parser {
    readonly source: SourceTracker;
    readonly index: number;
    /** The parselet list is always ascending precedence order */
    readonly parselets: Parselet[];
    readonly skipErrors: boolean;
}

const createParser = (source: SourceTracker, skipErrors: boolean): Parser => {
    return {
        source,
        index: 0,
        parselets: [],
        skipErrors,
    }
}

export const parserInsertParselet = (parser: Parser, parselet: Parselet): Parser => {
    var parselets = parser.parselets;
    const head: Parselet[] = [];
    while (parselets && parselet.precedence > parselets.value.precedence) {
        const { 0: value, 1: rest } = llPop(parselets);
        head.push(value);
        parselets = rest;
    }
    head.push(parselet);
    return {
        ...parser,
        parselets: llPushArray(parselets, head),
    };
}

const matchParselet = (code: string, index: number, parselet: Parselet) => {
    const regex = parselet.prefix;
    regex.lastIndex = index;
    return regex.exec(code);
}

const firstMatch = <T>(parser: Parser, parselets: LinkedList<Parselet>, callback: (parselet: Parselet, match: RegExpExecArray) => T): T | undefined => {
    const { source: { code }, index } = parser;
    for (var parselet = parselets?.value!; parselets; parselet = (parselets = parselets.next)?.value!) {
        const match = matchParselet(code, index, parselet);
        if (match) return callback(parselet, match);
    }
}

const peekPrecedence = (parser: Parser) => firstMatch(parser, parser.parselets, parselet => parselet.precedence);

const matchToToken = (match: RegExpExecArray, source: SourceTracker, start: number): Token => {
    const text = match[0], len = text.length, end = start + len;
    return {
        text,
        span: {
            file: source.src,
            start, end
        },
    };
}

const nextToken = (parser: Parser): [token: Token, next: Parser] | undefined => firstMatch(parser, parser.parselets, (_, match) => {
    const token = matchToToken(match, parser.source, parser.index);
    const next: Parser = {
        ...parser,
        index: token.span.end,
    };
    return [token, next];
});

export const copyParselets = (sourceParser: Parser, parselets: LinkedList<Parselet>): Parser => {
    var parselets1 = sourceParser.parselets;
    const head: Parselet[] = [];
    const shift = (list: LinkedList<Parselet>): LinkedList<Parselet> => {
        const { 0: data, 1: rest } = llPop(list!);
        head.push(data);
        return rest;
    }
    const pop1 = () => { parselets1 = shift(parselets1); }
    const pop0 = () => { parselets = shift(parselets); }
    while (parselets1 && parselets) {
        (parseletComparator(parselets1.value, parselets.value) < 0 ? pop1 : pop0)();
    }
    return {
        ...sourceParser,
        parselets: llPushArray(parselets1 ?? parselets, head),
    }
}

export const installParserMachinery = (vm: BackolonVM) => {
}

const PARSER_CODE = ["begin",
    ["define", ["parseExpression", "minPrecedence", "orEqual", ["skipErrors", false]],
        ["let", [
            ["left", undefined],
            ["first", true],
            ["curParselet", ["getCurrentParselet"]]
        ],
            ["while", ["or", ["$", "first"], [">", ["peekPrecedence"], ["$", "minPrecedence"]]],
                ["let", [["savedPos", ["parseletPosition"]]],
                    ["foreach", "parselet", ["allParselets"]
                    /* AAAAAAAA */]]]]],
];


/*

parser context control functions:
    tryConsume(string/regex) = get token at current position or undefined if it doesn't match
    tag(span, tag) = syntax highlighting tagging
    save() = save parser state
    restore(saved) = restore parser state
    shouldStop() = true if the next token is lower precedence

parseExpression(minPrecedence, orEqual, skipErrors=false) {

    let left = undefined
    let first = true
    let curParent = getParentParselet()

    while (first || peekPrecedence() > minPrecedence) {
        let savedPosition = parserPosition()
        findloop: for (each registered parselet) {
            resetParserPosition(savedPosition)
            if (parselet matches && parselet.precedence (orEqual ? >= : >) minPrecedence) {
                setParentParselet(parselet)
                left = call parselet.parse(context{skip = () => continue findloop, discard = () => break findloop, first, ...}, left, token)
                break findloop
            }
        } else { // nothing matched
            if (skipErrors) {
                tag(savedPosition, "error")
                resetParserPosition(savedPosition + 1)
            } else {
                die("failed to parse")
            }
        }
        first = false
    }
    setParentParselet(curParent)

    return left
};


*/
