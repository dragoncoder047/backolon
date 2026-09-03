import { isString } from "lib0/function";

export class Parselet {
    /**
     * It always has the sticky (y) flag.
     */
    readonly prefix: RegExp;
    /**
     * This is a JEB callable (builtin, lambda, etc) of one argument that implements the parse
     * handler of the parselet.
     *
     * For a prefix position, context.left is undefined, and context.first is true.
     *
     * For an infix position, context.left is the left-side expression, and context.first is false.
     *
     * In either case the parse function must return a chunk of JEB code that implements the
     * parse result, call `context.skip()` to mark what it has parsed as insignificant (`skip`
     * is a continuation which doesn't return), or call `context.discard()`
     * which goes to the next token.
     */
    readonly parse: any;
    constructor(prefix: RegExp | string, parse: any) {
        this.prefix =
            isString(prefix)
                ? new RegExp(RegExp.escape(prefix), "y") :
                prefix.sticky
                    ? prefix :
                    new RegExp(prefix, prefix.flags + "y");
        this.parse = parse;
    }
}
