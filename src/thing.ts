import { LocationTrace } from "./errors";
import { javaHash } from "./hash";

export enum ThingType {
    /** the empty value */
    nil = "nil",
    /** represents the end-of-file marker for tokenization, or the end of a read stream, or the end of an iterable */
    end = "end",
    /** any unquoted text, like "aaa", "+", or "  " */
    symbol = "symbol",
    number = "number",
    string = "string",
    /** a collection of syntax nodes */
    block = "block",
    /** represents a function call, children[0] is the function, children[1:] are the arguments */
    apply = "apply",
    /** represents a bound lambda function, children[0] is the call signature, children[1] is the body, value is the bound environment */
    lambda = "lambda",
    /** represents a native function handle (but does not contain it, only its name) */
    native_function = "native_function",
    /** represents a pattern matching construct */
    pattern = "pattern",
    /** represents a container object like list, map, or set */
    collection = "collection",
    /** any custom object type */
    custom = "custom",
}


export class Thing {
    /** Null if this or any child is not hashable. */
    public readonly hash: number | null = null;
    constructor(
        public readonly type: ThingType,
        public readonly subtype: string | null,
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
        var hash = javaHash(type) ^ javaHash(String(subtype));
        for (var c of children) {
            if (c.hash === null) return;
            hash ^= ((hash ^ 0xabcdef01) << 3) + c.hash;
        }
        hash ^= ((hash ^ 0x31415926) >>> 7) + (valueInHash ? javaHash(String(value)) : 0);
        this.hash = hash;
    }
}

export enum SymbolType {
    /** an alphanumeric symbol, such as x, hello, or _QWE_RTY_123 */
    name = "name",
    /** an operator character (only ever one character) */
    operator = "operator",
    /** a symbol composed entirely of whitespace and/or comments. Newlines get their own Thing. */
    space = "space",
}

export enum BlockType {
    round = "round",
    square = "square",
    curly = "curly",
    toplevel = "toplevel",
    string = "string",
}

export enum LambdaType {
    function = "function",
    macro = "macro",
}

export enum CollectionType {
    list = "list",
    map = "map",
    kv_pair = "kv_pair",
}

export enum PatternType {
    match_type = "match_type",
    match_subtype = "match_subtype",
    match_value = "match_value",
    /** capture into this symbol */
    capture = "capture",
    /** try all of the alternatives inside separately */
    alternatives = "alternatives",
    /** try in sequence */
    sequence = "sequence",
    /** repeat zero or one times */
    optional = "optional",
    /** repeat one or more times */
    repeat = "repeat",
    /** repeat children[0] joined by children[1] */
    repeat_joined = "repeat_joined",
}

export function boxNil(trace: LocationTrace): Thing { return new Thing(ThingType.nil, null, [], null, "", "", "", trace); }
export function boxSymbol(value: string, subtype: SymbolType, trace: LocationTrace): Thing { return new Thing(ThingType.symbol, subtype, [], value, value, "", "", trace); }
export function boxNameSymbol(value: string, trace: LocationTrace): Thing { return boxSymbol(value, SymbolType.name, trace); }
export function boxOperatorSymbol(value: string, trace: LocationTrace): Thing { return boxSymbol(value, SymbolType.operator, trace); }
export function boxSpaceSymbol(value: string, trace: LocationTrace): Thing { return boxSymbol(value, SymbolType.space, trace); }
export function boxNumber(value: number, trace: LocationTrace, repr = value.toString()): Thing { return new Thing(ThingType.number, null, [], value, repr, "", "", trace); }
export function boxString(value: string, trace: LocationTrace, raw: string, quote: string): Thing { return new Thing(ThingType.string, null, [], value, quote + raw, quote, "", trace); }
export function boxBlock(children: Thing[], subtype: BlockType, trace: LocationTrace, start: string, end: string): Thing { return new Thing(ThingType.block, subtype, children, null, start, end, "", trace); }
export function boxRoundBlock(children: Thing[], trace: LocationTrace): Thing { return boxBlock(children, BlockType.round, trace, "(", ")"); }
export function boxSquareBlock(children: Thing[], trace: LocationTrace): Thing { return boxBlock(children, BlockType.square, trace, "[", "]"); }
export function boxCurlyBlock(children: Thing[], trace: LocationTrace): Thing { return boxBlock(children, BlockType.curly, trace, "{", "}"); }
export function boxToplevelBlock(children: Thing[], trace: LocationTrace): Thing { return boxBlock(children, BlockType.toplevel, trace, "", ""); }
export function boxStringBlock(children: Thing[], trace: LocationTrace, quote: string): Thing { return boxBlock(children, BlockType.string, trace, quote, quote); }
