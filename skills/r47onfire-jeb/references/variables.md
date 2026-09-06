# Variables & Constants

## builtins

### `OP_audit`
```ts
const OP_audit: (vm: JebVM, args: [any, ...unknown[]]) => void
```

### `B_audit`
```ts
const B_audit: JSFun<CallableSignatureFromShorthand<["event", "params", true]>>
```

### `OP_tbPop`
```ts
const OP_tbPop: (vm: any) => any
```

### `OP_tbPush`
```ts
const OP_tbPush: (vm: JebVM, __namedParameters: [f: Identifier, Location | undefined, tail?: boolean]) => void
```

### `OP_shuffle`
```ts
const OP_shuffle: (vm: JebVM, __namedParameters: [number, number[]]) => void
```

### `OP_eval`
```ts
const OP_eval: (vm: JebVM, __namedParameters: [Location | undefined, tail?: boolean]) => void
```

### `B_eval`
```ts
const B_eval: JSFun<CallableSignatureFromShorthand<["arg"]>>
```

### `B_macro_wrap`
```ts
const B_macro_wrap: JSFun<CallableSignatureFromShorthand<["code"]>>
```

### `OP_apply`
```ts
const OP_apply: (vm: JebVM, __namedParameters: [any[], location?: Location, tail?: boolean, noEval?: boolean]) => void
```

### `B_atLocation`
```ts
const B_atLocation: JSFun<CallableSignatureFromShorthand<["pos", readonly [true, "expr"]]>>
```

### `B_splat`
```ts
const B_splat: JSFun<CallableSignatureFromShorthand<["value", readonly ["kw", false]]>>
```

### `B_keyword`
```ts
const B_keyword: JSFun<CallableSignatureFromShorthand<["name", "value"]>>
```

### `OP_index`
```ts
const OP_index: (vm: JebVM, __namedParameters: [AccessType]) => void
```

### `OP_get`
```ts
const OP_get: (vm: JebVM, __namedParameters: [boolean]) => void
```

### `OP_set`
```ts
const OP_set: (vm: JebVM, __namedParameters: [create?: boolean, readonly_?: boolean]) => void
```

### `B_dot`
```ts
const B_dot: JSFun<CallableSignatureFromShorthand<["obj", "name"]>>
```

### `B_set`
```ts
const B_set: JSFun<CallableSignatureFromShorthand<[readonly [readonly ["ref"], "ref"], readonly [false, "value"], readonly ["old", false]]>>
```

### `OP_throw`
```ts
const OP_throw: (vm: JebVM, __namedParameters: [JEBError]) => void
```

### `B_throw`
```ts
const B_throw: JSFun<CallableSignatureFromShorthand<["err"]>>
```

### `B_err`
```ts
const B_err: JSFun<CallableSignatureFromShorthand<[readonly ["message", "no message"], readonly ["type", undefined], readonly ["up", 0]]>>
```

### `B_with`
```ts
const B_with: JSFun<CallableSignatureFromShorthand<[readonly [true, "binding"], "context", readonly [false, "body"], true]>>
```

### `B_is_nil`
```ts
const B_is_nil: JSFun<CallableSignatureFromShorthand<["value"]>>
```

### `OP_set_env`
```ts
const OP_set_env: (vm: JebVM, __namedParameters: [Env]) => Env
```

### `OP_if`
```ts
const OP_if: (vm: T, __namedParameters: [any, any, asm?: false] | [Command<T> | null, Command<T> | null, true]) => void
```

### `B_if`
```ts
const B_if: JSFun<CallableSignatureFromShorthand<["condition", readonly [true, "then"], readonly [true, "else", null]]>>
```

### `B_begin`
```ts
const B_begin: JSFun<CallableSignatureFromShorthand<[readonly [true, "body"], true]>>
```

### `B_let`
```ts
const B_let: JSFun<CallableSignatureFromShorthand<[readonly [true, "__args"], true]>>
```

### `B_let_in`
```ts
const B_let_in: JSFun<CallableSignatureFromShorthand<["pairs", true]>>
```

### `B_define`
```ts
const B_define: JSFun<CallableSignatureFromShorthand<[readonly [true, "definition"], true]>>
```

### `B_plus`
```ts
const B_plus: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_minus`
```ts
const B_minus: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_mul`
```ts
const B_mul: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_div`
```ts
const B_div: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_mod`
```ts
const B_mod: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_pow`
```ts
const B_pow: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_bitAnd`
```ts
const B_bitAnd: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_bitOr`
```ts
const B_bitOr: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_bitXor`
```ts
const B_bitXor: JSFun<CallableSignatureFromShorthand<["a", readonly ["b", typeof NOTHING]]>>
```

### `B_bitInv`
```ts
const B_bitInv: JSFun<CallableSignatureFromShorthand<["a"]>>
```

### `B_eq`
```ts
const B_eq: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_not_eq`
```ts
const B_not_eq: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_less`
```ts
const B_less: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_greater`
```ts
const B_greater: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_less_eq`
```ts
const B_less_eq: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_greater_eq`
```ts
const B_greater_eq: JSFun<CallableSignatureFromShorthand<["items", true]>>
```

### `B_not`
```ts
const B_not: JSFun<CallableSignatureFromShorthand<["value"]>>
```

### `B_and_shortcircuit`
```ts
const B_and_shortcircuit: JSFun<CallableSignatureFromShorthand<["a", readonly [true, "b"]]>>
```

### `B_or_shortcircuit`
```ts
const B_or_shortcircuit: JSFun<CallableSignatureFromShorthand<["a", readonly [true, "b"]]>>
```

### `B_list`
```ts
const B_list: JSFun<CallableSignatureFromShorthand<["values", true]>>
```

### `B_head`
```ts
const B_head: JSFun<CallableSignatureFromShorthand<["list"]>>
```

### `B_tail`
```ts
const B_tail: JSFun<CallableSignatureFromShorthand<["list"]>>
```

### `B_concat`
```ts
const B_concat: JSFun<CallableSignatureFromShorthand<["lists", true]>>
```

### `B_quote`
```ts
const B_quote: JSFun<CallableSignatureFromShorthand<[readonly [true, "expr"]]>>
```

### `B_quasiquote`
```ts
const B_quasiquote: JSFun<CallableSignatureFromShorthand<[readonly [true, "value"]]>>
```

### `B_unquote`
```ts
const B_unquote: JSFun<CallableSignatureFromShorthand<[readonly [true, "value"]]>>
```

### `B_unquoteSplicing`
```ts
const B_unquoteSplicing: JSFun<CallableSignatureFromShorthand<[readonly [true, "value"]]>>
```

### `B_jsonparse`
```ts
const B_jsonparse: JSFun<CallableSignatureFromShorthand<["json"]>>
```

### `B_jsonstringify`
```ts
const B_jsonstringify: JSFun<CallableSignatureFromShorthand<["value"]>>
```

## define

### `ALL_OPCODES`
```ts
const ALL_OPCODES: Record<string, [fn: OpcodeFunction<any, any>, doc: string | null]>
```

### `NOTHING`
Special symbol to represent 'no value' in contexts where `undefined` is a valid value.
```ts
const NOTHING: typeof NOTHING
```

## doc

### `EmptyTag`
Parser for a blank tag that only serves as a flag and carries no content.
```ts
const EmptyTag: DocMetadataParser
```

### `ParamTag`
Parser for a param tag (pretty common) with the form `{type} name - description` or `{type} [name=default] - description`
```ts
const ParamTag: DocMetadataParser
```

### `ReturnsTag`
Parser for a returns tag (pretty common) with the form `{type} - description`
```ts
const ReturnsTag: DocMetadataParser
```

### `ThrowsTag`
Parser for a throws tag for throwing errors
```ts
const ThrowsTag: DocMetadataParser
```

### `OpcodeParsers`
Metadata parsers used for the JEB stack machine opcode docstrings
```ts
const OpcodeParsers: Record<string, DocMetadataParser>
```

### `FuncOrMacroTag`
Metadata parser for the func or macro tags
```ts
const FuncOrMacroTag: DocMetadataParser
```

### `FunctionOrMacroParsers`
Metadata parsers used for the high(er)-level JEB function or macro docstrings
```ts
const FunctionOrMacroParsers: Record<string, DocMetadataParser>
```

### `ApplierParsers`
Metadata parsers used for the JEBProtocols.apply apply protocol's docstring
```ts
const ApplierParsers: Record<string, DocMetadataParser>
```

### `EvaluatorParsers`
Metadata parsers used for the JEBProtocols.eval eval protocol's docstring
```ts
const EvaluatorParsers: Record<string, DocMetadataParser>
```

### `AccessorParsers`
Metadata parsers used for the JEBProtocols.access access protocol's docstring
```ts
const AccessorParsers: Record<string, DocMetadataParser>
```

### `UnwrapperParsers`
Metadata parsers used for the JEBProtocols.unwrap unwrap protocol's docstring
```ts
const UnwrapperParsers: Record<string, DocMetadataParser>
```

## errors

### `ALL_ERRORS`
Mapping of error tag to class constructor (used by the `err` function)
```ts
const ALL_ERRORS: Record<string, typeof JEBError>
```

## math

### `float`
```ts
const float: NumberConstructor
```

### `int`
```ts
const int: BigIntConstructor
```
