import { B_begin, B_define, B_let, JEBStateError } from "@r47onfire/jeb";
import { SourceTracker } from "../runtime/importer";
import { Parselet } from "./parselet";
import { Constraint, sortByConstraints } from "./sort";
import { Span } from "./span";

export class Token {
    constructor(
        public readonly text: string,
        public readonly span: Span,
    ) { }
}

export class Parser {
    constructor(
        public readonly source: SourceTracker,
        public readonly index: number,
        public readonly parselets: Parselet[],
        public readonly constraints: Constraint<Parselet>[],
        public readonly skipErrors: boolean,
    ) { }
    #clean = false;
    #precedenceOf!: Map<number, Parselet>;
    addParselet(parselet: Parselet): Parser {
        return new Parser(this.source, this.index, this.parselets.concat(parselet), this.constraints, this.skipErrors);
    }
    addConstraint(constraint: Constraint<Parselet>): Parser {
        return new Parser(this.source, this.index, this.parselets, this.constraints.concat(constraint), this.skipErrors);
    }
    sort() {
        this.#precedenceOf = sortByConstraints(this.parselets, this.constraints);
        this.#clean = true;
    }
    #assertClean() {
        if (!this.#clean) {
            throw new JEBStateError("Cannot parse right now");
        }
    }
    peek(): [precedence: number, parselet: Parselet, token: Token] | undefined {
        this.#assertClean();
        const { parselets, source: { code, src } } = this;
        for (var i = parselets.length - 1; i >= 0; i--) {
            const p = parselets[i]!;
            p.prefix.lastIndex = this.index;
            const match = p.prefix.exec(code);
            if (match) {
                return [i, p, new Token(match[0], new Span(src, this.index, this.index + match[0].length))];
            }
        }
    }
}

// const createParser = (source: SourceTracker, skipErrors: boolean): Parser => {
//     return {
//         source,
//         index: 0,
//         parselets: [],
//         skipErrors,
//     }
// }

// const matchParselet = (code: string, index: number, parselet: Parselet) => {
//     const regex = parselet.prefix;
//     regex.lastIndex = index;
//     return regex.exec(code);
// }

// const firstMatch = <T>(parser: Parser, parselets: LinkedList<Parselet>, callback: (parselet: Parselet, match: RegExpExecArray) => T): T | undefined => {
//     const { source: { code }, index } = parser;
//     for (var parselet = parselets?.value!; parselets; parselet = (parselets = parselets.next)?.value!) {
//         const match = matchParselet(code, index, parselet);
//         if (match) return callback(parselet, match);
//     }
// }

// const peekPrecedence = (parser: Parser) => firstMatch(parser, parser.parselets, parselet => parselet.precedence);

// const matchToToken = (match: RegExpExecArray, source: SourceTracker, start: number): Token => {
//     const text = match[0], len = text.length, end = start + len;
//     return {
//         text,
//         span: {
//             file: source.src,
//             start, end
//         },
//     };
// }

// const nextToken = (parser: Parser): [token: Token, next: Parser] | undefined => firstMatch(parser, parser.parselets, (_, match) => {
//     const token = matchToToken(match, parser.source, parser.index);
//     const next: Parser = {
//         ...parser,
//         index: token.span.end,
//     };
//     return [token, next];
// });

const PARSER_CODE = [B_begin,
    [B_define, ["parseExpression", "minPrecedence", "orEqual", ["skipErrors", false]],
        [B_let, [
            ["left", undefined],
            ["first", true],
            ["curParselet", ["getCurrentParselet"]]
        ],
            ["while", ["or", ["$", "first"], [">", ["peekPrecedence"], ["$", "minPrecedence"]]],
                [B_let, [["savedPos", ["parseletPosition"]]],
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
        findloop: for (each registered parselet greater than minPrecedence) {
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
