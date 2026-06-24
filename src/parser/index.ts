import { LinkedList, llPop, llPushArray } from "@r47onfire/jeb";
import { Span } from "../errors";
import { BackolonVM } from "../runtime/vm";
import { Parselet } from "./parselet";

export interface SourceTracker {
    readonly src: Readonly<URL>;
    readonly code: string;
    readonly tags: Record<number, string[]>;
}

export interface Token {
    readonly text: string;
    readonly span: Span;
}

export interface Parser {
    readonly source: SourceTracker;
    readonly index: number;
    readonly firstErrorIndex: number;
    readonly errors: Record<number, [type: string, message: string, restarts: any][]>;
    readonly parselets: LinkedList<Parselet>;
    readonly skipErrors: boolean;
}

export const createParser = (source: SourceTracker): Parser => {
    return {
        source,
        index: 0,
        firstErrorIndex: 0,
        errors: {},
        parselets: llPushArray(null, []),
        skipErrors: false,
    }
}

export const parserInsertParselet = (parser: Parser, parselet: Parselet): Parser => {
    var parselets = parser.parselets;
    const head: Parselet[] = [];
    while (parselets && parselet.precedence < parselets.value.precedence) {
        const res = llPop(parselets);
        head.push(res.value);
        parselets = res.rest;
    }
    head.push(parselet);
    return {
        ...parser,
        parselets: llPushArray(parselets, head),
    };
}

export const peekPrecedence = (parser: Parser) => {
    const { source: { code }, index, parselets } = parser;
    for (var node = parselets, parselet = node?.value!; node; parselet = (node = node.next)?.value!) {
        const { prefix, precedence } = parselet;
        prefix.lastIndex = index;
        const match = prefix.exec(code);
        if (match) return precedence;
    }
}


export const installParserMachinery = (vm: BackolonVM) => {
}

/*

parseExpression(precedence = -Infinity) {

    --> left = undefined, first = true
        2. initialize parselet find loop
        3. test first find
        if not found, go to next iteration (step 3) or exit if !first and precedence < peekPrecedence()
        if found, call, with "skip" as continue to next iteration (step 3)
        if no parselets left, throw error if normal mode, else chop first character, mark as error, and back to step 2
        left = result, first = false
        goto step 2

    let token = this.consume();

    const prefix = this.prefixParselets[token.type];

    if (prefix === undefined) throw new Error(`Could not parse ${token.text}.`);

    let left = prefix.parse(this, token);

    while (precedence < this.getPrecedence()) {
        token = this.consume();

        const infix = this.infixParselets[token.type]!;
        left = infix.parse(this, left, token);
    }

    return left;
};


*/