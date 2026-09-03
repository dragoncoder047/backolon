import { B_begin, B_define, B_let, Continuation, JEBStateError } from "@r47onfire/jeb";
import { SourceTracker } from "../runtime/importer";
import { BackolonVM } from "../runtime/vm";
import { Parselet } from "./parselet";
import { Constraint, sortByConstraints } from "./sort";
import { Span } from "./span";

export class Token {
    constructor(
        readonly text: string,
        readonly span: Span,
    ) { }
}

export class Parser {
    constructor(
        readonly source: SourceTracker,
        readonly index: number,
        readonly parselets: Parselet[],
        readonly constraints: Constraint<Parselet>[],
        readonly skipErrors: boolean,
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
        if (this.#clean) return;
        this.#precedenceOf = sortByConstraints(this.parselets, this.constraints);
        this.#clean = true;
    }
    #assertClean() {
        if (!this.#clean) throw new JEBStateError("Cannot parse right now");
    }
    peek(): [precedence: number, parselet: Parselet, token: Token] | undefined {
        this.#assertClean();
        const { parselets, source: { code, src }, index } = this;
        for (var i = parselets.length - 1; i >= 0; i--) {
            const p = parselets[i]!, regex = p.prefix;
            regex.lastIndex = index;
            const match = regex.exec(code);
            if (match) {
                const text = match[0];
                return [i, p, new Token(text, new Span(src, index, index + text.length))];
            }
        }
    }
}

const createParserContext = (
    parser: Parser,
    parselet: Parselet,
    first: boolean,
    left: any,
    token: Token,
    skip: Continuation<BackolonVM>,
    discard: Continuation<BackolonVM>) => {
        return {
            first, left, token, skip, discard,
        }
}

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
