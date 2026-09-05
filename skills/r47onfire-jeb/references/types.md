# Types & Enums

## auditHookTypes

### `JEBAuditEvents`
**Properties:**
- `jeb:add_audit_hook: []`
- `jeb:ffi/call_function: [f: Function, args: any[]]`
- `jeb:ffi/object/get: [o: any, key: PropertyKey]`
- `jeb:ffi/object/set: [o: any, key: PropertyKey, value: any]`
- `jeb:loop_check: [repeatCount: number]`

### `JEBAuditEvent`
```ts
[T, ...JEBAuditEvents[T]]
```

## continuation

### `Windable`
Data holding a dynamic wind enter/exit handler pair
**Properties:**
- `enter: any`
- `exit: any`

## doc

### `DocNode`
Documentation tree markup node

* i = italics
* b = bold
* p = paragraph
* c = inline code
* u = unordered list (bullets)
* o = ordered list (numbers)
* l = list item
* r = reference to another function/macro
```ts
string | ["i", ...DocNode[]] | ["b", ...DocNode[]] | ["p", ...DocNode[]] | ["c", ...DocNode[]] | ["u", ...DocNode[]] | ["o", ...DocNode[]] | ["l", index: number | null, ...DocNode[]] | ["r", code: string] | ["r", display: string, group: string | undefined, path: string]
```

### `DocMetadata`
Documentation metadata tags, from header
**Properties:**
- `tag: string`
- `type: string` (optional)
- `name: DocNode` (optional)
- `default: string` (optional)
- `flags: string[]` (optional)
- `groups: DocMetadata[]` (optional)
- `description: DocNode[]` (optional)

### `DocMetadataParser`
Metadata parser that takes the lines on and after the tag and parses it into a DocMetadata
```ts
(lines: string[], tag: string) => Omit<DocMetadata, "groups">
```

### `Doc`
Parsed documentation data for something (e.g. builtin function, lambda)
**Properties:**
- `meta: DocMetadata[]` — Rendered header data
- `body: DocNode[]` — Rendered body documentation data. each outer list is a single paragraph

### `HasDocstring`
interface for a thing that has a docstring.
**Properties:**
- `doc: string`

## errors

### `Location`
```ts
[start: number | undefined, end: number | undefined, file: string | undefined]
```

### `StackTreeNode`
Tree node representing a compressed stack trace
```ts
Readonly<{ leaf: false; count: number; children: StackTreeNode[]; hash: number } | { leaf: true; name: Identifier | undefined; location: Location | undefined; hash: number }>
```

## math

### `BinaryFun`
A function taking two arguments
```ts
(a: any, b: any) => any
```

### `Relation`
The value is a bit field: equal is 4, less is 2, greater is 1
- `FALSE` = `0`
- `GREATER` = `1`
- `LESS` = `2`
- `NOT_EQ` = `3`
- `EQUAL` = `4`
- `GREATER_EQ` = `5`
- `LESS_EQ` = `6`
- `TRUE` = `7`

## protocol

### `Type`
Thing that can be used to match a type of an object. `true` = any
```ts
((args: any[]) => any) | keyof TypeMap | true
```

### `TypeValue`
```ts
T extends true ? any : T extends keyof TypeMap ? TypeMap[T] : T extends (args: any[]) => infer U ? U : never
```

### `TypeArrayValue`
```ts
number extends T["length"] ? TypeValue<T[number][number]> : T extends [...(infer Head extends Type[][]), infer Tail extends Type[]] ? [...TypeArrayValue<Head, D>, Head["length"] extends keyof D ? D[Head["length"]] : TypeValue<Tail[number]>] : []
```

### `BaseProtocolObj`
**Properties:**
- `type: T` — The type specialization that this protocol works with.
- `doc: string` — Documentation string for this protocol implementation.

### `DescribedProtocolObj`
**Properties:**
- `type: T` — The type specialization that this protocol works with.
- `doc: string` — Documentation string for this protocol implementation.

### `ProtocolObj`
```ts
I extends void ? BaseProtocolObj<R, T, D, F> : DescribedProtocolObj<R, T, D, I, F>
```

### `ProtocolsList`
```ts
ProtocolObj<R, T, D, I, F>[]
```

### `BinaryProtocolToResult`
```ts
ProtocolsList<Result<any, string>, [Type[], Type[]], {}, void, void>
```

### `UnaryProtocolToResult`
```ts
ProtocolsList<Result<any, string>, [Type[]], {}, void, void>
```

### `ApplyMetadata`
**Properties:**
- `name: Identifier | undefined` — The name of the function to appear in tracebacks, if undefined it means it's a hidden callframe and won't show.
- `signature: CallableSignature`
- `closureEnv: Env` (optional) — The environment(s) that this function closes over on order to allow default value expressions to be evaluated in that environment.

### `ApplyFlags`
**Properties:**
- `tail: boolean`
- `location: Location | undefined`

### `EvalFlags`
**Properties:**
- `tail: boolean`
- `location: Location | undefined`

### `AccessFlags`
**Properties:**
- `field: PropertyKey`
- `type: AccessType`

### `JEBProtocols`
**Properties:**
- `apply: ProtocolsList<void, [Type[]], {}, ApplyMetadata, ApplyFlags>`
- `eval: ProtocolsList<void, [Type[]], {}, void, EvalFlags>`
- `access: ProtocolsList<typeof NOTHING | Reference, [Type[]], {}, void, AccessFlags>`
- `unwrap: ProtocolsList<void, [typeof Wrapper[]], {}, void, void>`
- `add: BinaryProtocolToResult`
- `abs: UnaryProtocolToResult`
- `sub: BinaryProtocolToResult`
- `neg: UnaryProtocolToResult`
- `div: BinaryProtocolToResult`
- `inv: UnaryProtocolToResult`
- `mul: BinaryProtocolToResult`
- `matMul: BinaryProtocolToResult`
- `mod: BinaryProtocolToResult`
- `cmp: ProtocolsList<Result<boolean, string>, [Type[], Type[], ["number"]], { 2: Relation }, void, void>`
- `pow: BinaryProtocolToResult`
- `bitAnd: BinaryProtocolToResult`
- `bitOr: BinaryProtocolToResult`
- `bitXor: BinaryProtocolToResult`
- `bitNot: ProtocolsList<Result<any, string>>`

### `ArgcForName`
```ts
JEBProtocols[N] extends ProtocolsList<any, infer N, any, any> ? N["length"] : number
```

### `ResultForName`
```ts
JEBProtocols[N] extends ProtocolsList<infer N, any, any, any> ? N : unknown
```

### `FlagsForName`
```ts
JEBProtocols[N] extends ProtocolsList<any, any, any, any, infer N> ? N : []
```

### `InfoForName`
```ts
JEBProtocols[N] extends ProtocolsList<any, any, any, any, infer N> ? N : never
```

### `FnTypeForName`
```ts
JEBProtocols[N][number]["run"]
```

### `AccessType`
- `VARIABLE` = `0`
- `FUNCTION` = `1`
- `PROPERTY` = `2`

## signature

### `ShorthandArgument`
```ts
N | readonly [name: N, defaultExpr: any] | readonly [lazy: false, name: N] | readonly [macro: true, name: N] | readonly [flags: F, name: N] | readonly [flags: F, name: N, defaultExpr: any] | readonly [flags: F, lazy: false, name: N] | true | false
```

### `LonghandArgument`
**Properties:**
- `name: N`
- `required: boolean`
- `defaultExpr: any`
- `lazy: Laziness`
- `flags: F`

### `ShorthandToLonghand`
```ts
S extends readonly [ShorthandArgument<any, any>, boolean, ...(infer T extends readonly any[])] ? ShorthandToLonghand<T> : S extends readonly [ShorthandArgument<infer N, infer F>, ...(infer T extends readonly any[])] ? [LonghandArgument<N, F>, ...ShorthandToLonghand<T>] : readonly []
```

### `ExtractRest`
```ts
S extends readonly [ShorthandArgument<infer N, infer F>, B, ...readonly any[]] ? LonghandArgument<N, F> : S extends readonly [any, ...(infer R extends readonly ShorthandArgument<any, any>[])] ? ExtractRest<R, B> : undefined
```

### `CallableSignature`
**Properties:**
- `params: P`
- `rest: R`
- `kwRest: K`

### `CallableSignatureFromShorthand`
```ts
CallableSignature<ShorthandToLonghand<S>, ExtractRest<S, true>, ExtractRest<S, false>>
```

### `Laziness`
- `NONE` = `0`
- `LAZY` = `1`
- `QUOTED` = `2`

## utils

### `Tuple`
```ts
N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never
```

### `Writable`
```ts
{ -readonly [P in keyof T]: T[P] }
```

### `DropFirst`
```ts
T extends [any, ...(infer Rest)] ? Rest : []
```

### `Identifier`
```ts
string | symbol
```

## vm

### `Command`
Data for the command
```ts
[opcode: OpcodeFunction<any, T>, immediateArgs: any[]]
```

### `StackCount`
**Properties:**
- `name: Identifier | undefined`
- `location: Location | undefined`
- `count: number`
- `tail: boolean`

### `OpcodeFunction`
Function that implements an opcode for the VM by pushing instructions or pushing and popping data.
```ts
(vm: U, args: T) => void
```

### `GetArgParams`
```ts
Parameters<T>[1] extends infer T extends any[] ? T : [void]
```
