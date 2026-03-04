import { LocationTrace, RuntimeError, UNKNOWN_LOCATION } from "../errors";
import { StackEntry } from "../runtime/task";
import { javaHash, rotate32 } from "../utils";

export enum ThingType {
    /** the empty value */
    nil,
    /** represents the end-of-file marker for tokenization, or the end of a read stream, or the end of an iterable */
    end,
    /** an alphanumeric symbol, such as x, hello, or _QWE_RTY_123 */
    sym_name,
    /** an operator character (only ever one character) */
    sym_op,
    /** a symbol composed entirely of whitespace and/or comments. Newlines get their own Thing. */
    sym_space,
    number,
    string,
    blk_round,
    blk_square,
    blk_curly,
    blk_top,
    blk_str,
    /** represents a function call, children[0] is the function, children[1:] are the arguments */
    apply,
    /** closed-over lambda function or macro, children[0] is the call signature, children[1] is the body */
    fn,
    /** javascript function or macro, children is empty, value is the native function details */
    fn_native,
    /** implicit block, value=env, children[0] is the body */
    fn_implicit,
    /** name, type, default; value=lazy */
    fn_param_descriptor,
    continuation,
    /** children[0] is the bind target object (the "self" value), children[1] is the method */
    fn_bound_method,
    /** value=true means anchor to start, value=false means anchor to end */
    pat_anchor,
    /** value is string enum of ThingType */
    pat_m_type,
    /** child[0] is compared to */
    pat_m_val,
    /** children[0] is the symbol, children[1] is the thing to capture */
    pat_group,
    /** each child is an alternatives inside separately, leftmost takes precedence */
    pat_alt,
    /** try each child in sequence */
    pat_seq,
    /** repeat children (as sequence) zero or one times, greedy or not */
    pat_opt,
    /** repeat children (as sequence) one or more times, greedy or not */
    pat_rep,
    list,
    map,
    pair,
    triple,
    env,
    i_am_a_macro,
    i_am_a_splat,
}

type ThingInternalTypes<T extends ThingType> = {
    [ThingType.nil]: [null, []],
    [ThingType.end]: [null, []],
    [ThingType.sym_name]: [string, []],
    [ThingType.sym_op]: [string, []],
    [ThingType.sym_space]: [string, []],
    [ThingType.number]: [number, []],
    [ThingType.string]: [string, []],
    [ThingType.blk_round]: [null, Thing[]],
    [ThingType.blk_square]: [null, Thing[]],
    [ThingType.blk_curly]: [null, Thing[]],
    [ThingType.blk_top]: [null, Thing[]],
    [ThingType.blk_str]: [null, Thing<ThingType.string | ThingType.blk_round>[]],
    [ThingType.apply]: [null, Thing[]],
    [ThingType.fn]: [null, [Thing<ThingType.blk_round>, Thing]],
    [ThingType.fn_native]: [string, []],
    [ThingType.fn_implicit]: [Thing<ThingType.env | ThingType.nil>, [Thing]],
    [ThingType.fn_param_descriptor]: [boolean, [Thing<ThingType.sym_name>, Thing<ThingType.list>] | [Thing<ThingType.sym_name>, Thing<ThingType.list>, Thing]],
    [ThingType.continuation]: [readonly StackEntry[], []],
    [ThingType.fn_bound_method]: [null, [Thing, Thing<ThingType.fn>]],
    [ThingType.pat_anchor]: [boolean, []],
    [ThingType.pat_m_type]: [ThingType, []],
    [ThingType.pat_m_val]: [null, [Thing]],
    [ThingType.pat_group]: [null, [Thing<ThingType.sym_name>, ...Thing[]]],
    [ThingType.pat_alt]: [null, Thing[]],
    [ThingType.pat_seq]: [null, Thing[]],
    [ThingType.pat_opt]: [boolean, Thing[]],
    [ThingType.pat_rep]: [boolean, Thing[]],
    [ThingType.list]: [null, Thing[]],
    [ThingType.map]: [null, Thing<ThingType.pair>[]],
    [ThingType.pair]: [null, [Thing, Thing]],
    [ThingType.triple]: [null, [Thing, Thing, Thing]],
    [ThingType.env]: [null, [Thing<ThingType.env | ThingType.nil>, Thing<ThingType.map>, Thing<ThingType.list>]]
    [ThingType.i_am_a_macro]: [null, [Thing]],
    [ThingType.i_am_a_splat]: [null, [Thing]],
}[T];

const unhashable = [ThingType.list, ThingType.map];
type ValueType<T extends ThingType> = ThingInternalTypes<T>[0];
type ChildrenType<T extends ThingType> = ThingInternalTypes<T>[1];

export class Thing<T extends (ThingType | string) = ThingType | string> {
    /** Null if this or any child is not hashable. */
    public readonly h: number | null = null;
    constructor(
        /** type */
        public readonly t: T,
        /** children */
        public readonly c: T extends ThingType ? ChildrenType<T> : Thing[],
        /** value */
        public v: T extends ThingType ? ValueType<T> : any,
        /** source prefix */
        public readonly s0: string,
        /** source suffix */
        public readonly s1: string,
        /** source joiner */
        public readonly sj: string,
        /** source location */
        public readonly loc: LocationTrace,
        hashable: boolean = !unhashable.includes(t as ThingType),
        valueInHash: boolean = true,
    ) {
        if (!hashable) return;
        var hash = javaHash(t + "");
        for (var child of c) {
            if (child.h === null) return;
            hash ^= rotate32(hash ^ 0xabcdef01, 30) + child.h;
        }
        hash ^= rotate32(hash ^ 0x31415926, 7) + (valueInHash ? javaHash(String(v)) : 0);
        this.h = hash;
    }
}

export function boxNil(trace = UNKNOWN_LOCATION) { return new Thing(ThingType.nil, [], null, "", "", "", trace); }
export function boxEnd(trace = UNKNOWN_LOCATION) { return new Thing(ThingType.end, [], null, "", "", "", trace); }
export function boxSymbol<T extends ThingType.sym_name | ThingType.sym_op | ThingType.sym_space>(value: string, kind: T, trace = UNKNOWN_LOCATION): Thing<T> { return new Thing(kind, [] as any, value as any, value, "", "", trace); }
export function boxNameSymbol(value: string, trace = UNKNOWN_LOCATION) { return boxSymbol(value, ThingType.sym_name, trace); }
export function boxOperatorSymbol(value: string, trace = UNKNOWN_LOCATION) { return boxSymbol(value, ThingType.sym_op, trace); }
export function boxSpaceSymbol(value: string, trace = UNKNOWN_LOCATION) { return boxSymbol(value, ThingType.sym_space, trace); }
export function boxNumber(value: number, trace = UNKNOWN_LOCATION, repr = value.toString()) { return new Thing(ThingType.number, [], value, repr, "", "", trace); }
export function boxString(value: string, trace = UNKNOWN_LOCATION, raw: string, quote: string) { return new Thing(ThingType.string, [], value, quote + raw, quote, "", trace); }
export function boxBlock<T extends ThingType.blk_round | ThingType.blk_square | ThingType.blk_curly | ThingType.blk_str | ThingType.blk_top>(children: Thing[], kind: T, trace = UNKNOWN_LOCATION, start: string, end: string): Thing<T> { return new Thing(kind, children as any, null as any, start, end, "", trace); }
export function boxRoundBlock(children: Thing[], trace = UNKNOWN_LOCATION) { return boxBlock(children, ThingType.blk_round, trace, "(", ")"); }
export function boxSquareBlock(children: Thing[], trace = UNKNOWN_LOCATION) { return boxBlock(children, ThingType.blk_square, trace, "[", "]"); }
export function boxCurlyBlock(children: Thing[], trace = UNKNOWN_LOCATION) { return boxBlock(children, ThingType.blk_curly, trace, "{", "}"); }
export function boxToplevelBlock(children: Thing[], trace = UNKNOWN_LOCATION) { return boxBlock(children, ThingType.blk_top, trace, "", ""); }
export function boxStringBlock(children: Thing[], trace = UNKNOWN_LOCATION, quote: string) { return boxBlock(children, ThingType.blk_str, trace, quote, quote); }
export function boxList(items: Thing[], trace = UNKNOWN_LOCATION) { return new Thing(ThingType.list, items, null, "[", "]", ", ", trace, false); }

export function typecheck<T extends ThingType>(...types: T[]) {
    return (thing: Thing<any>): thing is Thing<T> => types.includes(thing.t as T);
}

export const isBlock = typecheck(ThingType.blk_round, ThingType.blk_square, ThingType.blk_curly, ThingType.blk_str, ThingType.blk_top);
export const isSymbol = typecheck(ThingType.sym_name, ThingType.sym_op, ThingType.sym_space);
export const isCallable = typecheck(ThingType.fn, ThingType.fn_native, ThingType.fn_implicit, ThingType.continuation, ThingType.fn_bound_method);
export const isPattern = typecheck(ThingType.pat_alt, ThingType.pat_anchor, ThingType.pat_group, ThingType.pat_m_type, ThingType.pat_m_val, ThingType.pat_opt, ThingType.pat_rep, ThingType.pat_seq);
export const isValuePattern = typecheck(ThingType.pat_m_type, ThingType.pat_m_val);
export const isAtom = typecheck(ThingType.nil, ThingType.end, ThingType.sym_name, ThingType.sym_op, ThingType.sym_space, ThingType.number, ThingType.string, ThingType.fn, ThingType.fn_bound_method, ThingType.fn_implicit, ThingType.fn_native, ThingType.continuation, ThingType.list, ThingType.map, ThingType.i_am_a_splat, ThingType.i_am_a_macro);

export type CheckedType<T extends (thing: Thing<any>) => thing is Thing<any>> = T extends (thing: Thing<any>) => thing is Thing<infer U> ? U : never;

export function extractSymbolName(thing: Thing): string {
    if (!isSymbol(thing)) {
        throw new RuntimeError("Expected symbol", thing.loc);
    }
    return thing.v;
}
