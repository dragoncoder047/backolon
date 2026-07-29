import { isString } from "lib0/function";
export interface Parselet {
    /**
     * It must have the sticky (y) flag.
     */
    readonly prefix: RegExp;
    /**
     * This is a JEB callable (builtin, lambda, etc) that implements the parse
     * handler of the parselet.
     *
     * The signature is always (context, left, token)
     *
     * For a prefix position, left is undefined, and context.first is true.
     *
     * For an infix position, left is the left-side expression, and context.first is false.
     *
     * In either case the parse function must return a chunk of JEB code that implements the
     * parse result, call `skip()` to mark what it has parsed as insignificant (`skip`
     * is a continuation which doesn't return), or call `discard()`
     * which goes to the next token.
     */
    readonly parse: any;
    readonly precedence: number;
}

const RE = RegExp;
export const createParselet = (prefix: RegExp | string, parse: any, precedence: number): Parselet => {
    const fixedRegExp =
        isString(prefix)
            ? new RE(RE.escape(prefix), "y") :
            prefix.sticky
                ? prefix :
                new RE(prefix, prefix.flags + "y");
    return {
        prefix: fixedRegExp,
        parse,
        precedence
    };
}

export const parseletComparator = (a: Parselet, b: Parselet) => a.precedence - b.precedence;

