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
     * The signature is always (type, current token, left)
     *
     * For a prefix parselet, it is passed only type="prefix" and current token; left is undefined.
     *
     * For an infix parselet, it is passed type="infix", the current token, and the left-side expression.
     *
     * In either case the parse function must return a chunk of JEB code that implements the
     * parse result, or call `skip` to mark what it has parsed as insignificant (`skip`
     * is a continuation which doesn't return).
     */
    readonly parse: any;
    readonly precedence: number;
}

export const createParselet = (prefix: RegExp | string, parse: any, precedence: number): Parselet => {
    const fixedRegExp =
        isString(prefix)
            ? new RegExp(RegExp.escape(prefix), "y") :
            /y/.test(prefix.flags)
                ? prefix :
                new RegExp(prefix, prefix.flags + "y");
    return {
        prefix: fixedRegExp,
        parse,
        precedence
    };
}
