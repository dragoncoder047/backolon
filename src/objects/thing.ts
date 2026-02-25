import { LocationTrace, RuntimeError, UNKNOWN_LOCATION } from "../errors";
import { javaHash } from "./hash";

export enum ThingType {
    /** the empty value */
    nil,
    /** represents the end-of-file marker for tokenization, or the end of a read stream, or the end of an iterable */
    end,
    /** an alphanumeric symbol, such as x, hello, or _QWE_RTY_123 */
    name_symbol,
    /** an operator character (only ever one character) */
    operator_symbol,
    /** a symbol composed entirely of whitespace and/or comments. Newlines get their own Thing. */
    space_symbol,
    number,
    string,
    round_block,
    square_block,
    curly_block,
    toplevel_block,
    string_block,
    /** represents a function call, children[0] is the function, children[1:] are the arguments */
    apply,
    /** closed-over lambda function or macro, children[0] is the call signature, children[1] is the body, value is the bound environment */
    function,
    /** javascript function or macro, children is empty, value is the native function details */
    native_function,
    implicit_block_function,
    continuation,
    /** children[0] is the bind target object (the "self" value), children[1] is the method */
    bound_method,
    /** value=true means anchor to start, value=false means anchor to end */
    pattern_anchor,
    /** value is string enum of ThingType */
    pattern_match_type,
    /** child[0] is compared to */
    pattern_match_value,
    /** children[0] is the symbol, children[1] is the thing to capture */
    pattern_capture,
    /** each child is an alternatives inside separately, leftmost takes precedence */
    pattern_alternatives,
    /** try each child in sequence */
    pattern_sequence,
    /** repeat children (as sequence) zero or one times, greedy or not */
    pattern_optional,
    /** repeat children (as sequence) one or more times, greedy or not */
    pattern_repeat,
    list,
    map,
    kv_pair,
    macro_expand_result,
    splice_result,
}


export class Thing {
    /** Null if this or any child is not hashable. */
    public readonly hash: number | null = null;
    constructor(
        public readonly type: ThingType | string,
        public readonly children: Thing[],
        public value: any,
        public readonly srcPrefix: string,
        public readonly srcSuffix: string,
        public readonly srcJoiner: string,
        public readonly srcLocation: LocationTrace,
        hashable: boolean = true,
        valueInHash: boolean = true,
    ) {
        if (!hashable) return;
        var hash = javaHash(type + "");
        for (var c of children) {
            if (c.hash === null) return;
            hash ^= ((hash ^ 0xabcdef01) >>> 30) + c.hash;
        }
        hash ^= ((hash ^ 0x31415926) >>> 7) + (valueInHash ? javaHash(String(value)) : 0);
        this.hash = hash;
    }
}

export function boxNil(trace = UNKNOWN_LOCATION): Thing { return new Thing(ThingType.nil, [], null, "", "", "", trace); }
export function boxEnd(trace = UNKNOWN_LOCATION): Thing { return new Thing(ThingType.end, [], null, "", "", "", trace); }
export function boxSymbol(value: string, kind: ThingType, trace = UNKNOWN_LOCATION): Thing { return new Thing(kind, [], value, value, "", "", trace); }
export function boxNameSymbol(value: string, trace = UNKNOWN_LOCATION): Thing { return boxSymbol(value, ThingType.name_symbol, trace); }
export function boxOperatorSymbol(value: string, trace = UNKNOWN_LOCATION): Thing { return boxSymbol(value, ThingType.operator_symbol, trace); }
export function boxSpaceSymbol(value: string, trace = UNKNOWN_LOCATION): Thing { return boxSymbol(value, ThingType.space_symbol, trace); }
export function boxNumber(value: number, trace = UNKNOWN_LOCATION, repr = value.toString()): Thing { return new Thing(ThingType.number, [], value, repr, "", "", trace); }
export function boxString(value: string, trace = UNKNOWN_LOCATION, raw: string, quote: string): Thing { return new Thing(ThingType.string, [], value, quote + raw, quote, "", trace); }
export function boxBlock(children: Thing[], kind: ThingType, trace = UNKNOWN_LOCATION, start: string, end: string): Thing { return new Thing(kind, children, null, start, end, "", trace); }
export function boxRoundBlock(children: Thing[], trace = UNKNOWN_LOCATION): Thing { return boxBlock(children, ThingType.round_block, trace, "(", ")"); }
export function boxSquareBlock(children: Thing[], trace = UNKNOWN_LOCATION): Thing { return boxBlock(children, ThingType.square_block, trace, "[", "]"); }
export function boxCurlyBlock(children: Thing[], trace = UNKNOWN_LOCATION): Thing { return boxBlock(children, ThingType.curly_block, trace, "{", "}"); }
export function boxToplevelBlock(children: Thing[], trace = UNKNOWN_LOCATION): Thing { return boxBlock(children, ThingType.toplevel_block, trace, "", ""); }
export function boxStringBlock(children: Thing[], trace = UNKNOWN_LOCATION, quote: string): Thing { return boxBlock(children, ThingType.string_block, trace, quote, quote); }

function makeChecker(...types: ThingType[]) {
    return (thingType: ThingType | string) => types.includes(thingType as ThingType);
}

export const isBlock = makeChecker(ThingType.round_block, ThingType.square_block, ThingType.curly_block, ThingType.string_block, ThingType.toplevel_block);
export const isSymbol = makeChecker(ThingType.name_symbol, ThingType.operator_symbol, ThingType.space_symbol);
export const isCallable = makeChecker(ThingType.function, ThingType.native_function, ThingType.implicit_block_function, ThingType.continuation, ThingType.bound_method);
export const isPattern = makeChecker(ThingType.pattern_alternatives, ThingType.pattern_anchor, ThingType.pattern_capture, ThingType.pattern_match_type, ThingType.pattern_match_value, ThingType.pattern_optional, ThingType.pattern_repeat, ThingType.pattern_sequence);
export const isValuePattern = makeChecker(ThingType.pattern_match_type, ThingType.pattern_match_value);

export function extractSymbolName(thing: Thing): string {
    if (!isSymbol(thing.type)) {
        throw new RuntimeError("Expected symbol", thing.srcLocation);
    }
    return thing.value;
}
