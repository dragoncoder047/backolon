# Functions

## auditHookTypes

### `makeSingleEventWatcher`
```ts
makeSingleEventWatcher<T>(event: T, cb: (args: JEBAuditEvents[T]) => void): (name: keyof JEBAuditEvents, args: unknown[]) => false | void
```
**Parameters:**
- `event: T`
- `cb: (args: JEBAuditEvents[T]) => void`
**Returns:** `(name: keyof JEBAuditEvents, args: unknown[]) => false | void`

## builtins

### `loadBuiltins`
Install the built-in functions and opcodes to the builtins scope of the given VM.

Usually you don't need to do this, since the JebVM constructor calls this automatically,
but it might be needed if the VM state gets corrupted, or you mess with JebVM#builtinsEnv directly.
```ts
loadBuiltins(vm: JebVM): void
```
**Parameters:**
- `vm: JebVM`

## define

### `makeJSFun`
Creates a builtin function.
```ts
makeJSFun<T>(name: string, signature: T, fn: (args: Record<ShorthandToLonghand<T>[number]["name"], any> & (ExtractRest<T, true> extends { name: N } ? { [x in PropertyKey]: any[] } : {}) & (ExtractRest<T, false> extends { name: N } ? { [x in PropertyKey]: Record<any, any> } : {}), vm: JebVM, location: Identifier | undefined) => any, doc: string): JSFun<CallableSignatureFromShorthand<T>>
```
**Parameters:**
- `name: string`
- `signature: T` — Defines the parameters of the function and how they should be interpreted
- `fn: (args: Record<ShorthandToLonghand<T>[number]["name"], any> & (ExtractRest<T, true> extends { name: N } ? { [x in PropertyKey]: any[] } : {}) & (ExtractRest<T, false> extends { name: N } ? { [x in PropertyKey]: Record<any, any> } : {}), vm: JebVM, location: Identifier | undefined) => any` — The function to implement the builtin. It should use the VM from the parameter, and **not**
close over the one that is passed to the `vm` parameter of `defineBuiltin` (since this builtin may be reused for a sub-VM for
e.g. an FFI callback).
- `doc: string`
**Returns:** `JSFun<CallableSignatureFromShorthand<T>>` — the builtin function, for referring to later

### `define`
Defines the object in the VM's builtins scope as a constant.
```ts
define(vm: JebVM, name: string, obj: any): void
```
**Parameters:**
- `vm: JebVM`
- `name: string`
- `obj: any`

### `makeOpcode`
Creates a new opcode for the VM.
```ts
makeOpcode<T>(fn: T, doc: string | null): T
```
**Parameters:**
- `fn: T` — The function to implement the opcode.
- `doc: string | null`
**Returns:** `T`

### `defineApplier`
Defines a new applier that can be used by the `jeb:apply` opcode to call something.
```ts
defineApplier<T, PO>(vm: JebVM, type: T, run: PO["run"], describe: PO["describe"], doc: string): void
```
**Parameters:**
- `vm: JebVM`
- `type: T`
- `run: PO["run"]` — Should push opcodes to take the arguments object from the top of the stack and pass them to whatever the implementation is.
It should not actually call that implementation as the arguments object is not actually on the stack at the point this is called.
- `describe: PO["describe"]` — Returns the metadata of the function, which includes the signature (see CallableSignature)
- `doc: string`

### `defineEvaluator`
Defines a new evaluator that can be used by the `jeb:eval` opcode to evaluate or unwrap something.
```ts
defineEvaluator<T>(vm: JebVM, type: T, fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: EvalFlags) => void, doc: string): void
```
**Parameters:**
- `vm: JebVM`
- `type: T`
- `fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: EvalFlags) => void`
- `doc: string`

### `defineAccessor`
Defines a new accessor that can be used by the `jeb:get` and `jeb:set` opcodes to look up or reassign a field on something.
```ts
defineAccessor<T>(vm: JebVM, type: T, fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: AccessFlags) => Reference, doc: string): void
```
**Parameters:**
- `vm: JebVM`
- `type: T`
- `fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: AccessFlags) => Reference`
- `doc: string`

### `defineUnwrapper`
Defines a new unwrapper to define how a special wrapper should be unwrapped.
```ts
defineUnwrapper<T>(vm: JebVM, type: T, fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: void) => void, doc: string): void
```
**Parameters:**
- `vm: JebVM`
- `type: T`
- `fn: (this: unknown, vm: JebVM, args: [TypeValue<T[number]>], flags: void) => void`
- `doc: string`

## doc

### `firstLineRegex`
Creates a DocMetadataParser that asserts that there is tag content, and that the first line matches the given regex.
The regex match is passed to the callback, and all remaining lines (including the rest of the first line if the
regex didn't match all of it) are passed to parseParagraphs to form the tag description.
```ts
firstLineRegex(regex: RegExp, process: (match: RegExpExecArray) => Omit<DocMetadata, "tag" | "groups" | "description">): DocMetadataParser
```
**Parameters:**
- `regex: RegExp` — Regex to match on the first line. It should be anchored to the start using `^`.
- `process: (match: RegExpExecArray) => Omit<DocMetadata, "tag" | "groups" | "description">` — The callback that will be called on a successful match and return the partial DocMetadata.
**Returns:** `DocMetadataParser` — The new parser

### `deprecateTag`
Wraps the parser to print a warning (`console.warn()`) that the tag name is not recommended or deprecated.
The behavior is the same as the given parser (the parameters are just passed directly).
```ts
deprecateTag(newName: string, parser: DocMetadataParser): DocMetadataParser
```
**Parameters:**
- `newName: string` — The preferred name that should be used instead
- `parser: DocMetadataParser` — The implementation of the parser
**Returns:** `DocMetadataParser` — the wrapped parser

### `parseDoc`
Parse the documentation string into Doc data
```ts
parseDoc(docstring: string, parsers: Record<string, DocMetadataParser>): Doc | undefined
```
**Parameters:**
- `docstring: string`
- `parsers: Record<string, DocMetadataParser>`
**Returns:** `Doc | undefined` — the doc data, or undefined if it didn't parse right

### `parseParagraphs`
Parses the lines and creates ordered and unordered lists for groups
of lines with bullets or number and creates paragraphs for all other lines
```ts
parseParagraphs(lines: string[]): DocNode[]
```
**Parameters:**
- `lines: string[]`
**Returns:** `DocNode[]`

### `parseHeaderAndSummary`
Parses the hiearchal metadata tags from the lines and returns the tree of DocMetadata nodes
as well as all the lines that were untagged or tagged with `""` as the global summary
```ts
parseHeaderAndSummary(lines: string[], parsers: Record<string, DocMetadataParser>): [DocMetadata[], string[]]
```
**Parameters:**
- `lines: string[]`
- `parsers: Record<string, DocMetadataParser>`
**Returns:** `[DocMetadata[], string[]]`

### `parseInline`
```ts
parseInline(s: string): DocNode[]
```
**Parameters:**
- `s: string`
**Returns:** `DocNode[]`

## env

### `gensym`
Returns a new unique symbol with a unique number description (to differentiate it in printouts).
```ts
gensym(s: string): symbol
```
**Parameters:**
- `s: string` — default: `"$gensym"`
**Returns:** `symbol`

## errors

### `createStackLeafNode`
```ts
createStackLeafNode(name: Identifier | undefined, location: Identifier | undefined): StackTreeNode
```
**Parameters:**
- `name: Identifier | undefined`
- `location: Identifier | undefined`
**Returns:** `StackTreeNode`

### `createStackInnerNode`
```ts
createStackInnerNode(count: number, children: StackTreeNode[]): StackTreeNode
```
**Parameters:**
- `count: number`
- `children: StackTreeNode[]`
**Returns:** `StackTreeNode`

### `compressStackTree`
```ts
compressStackTree(nodes: StackTreeNode[]): StackTreeNode[]
```
**Parameters:**
- `nodes: StackTreeNode[]`
**Returns:** `StackTreeNode[]`

### `formatStackTraceCompact`
Formats a stack tree as a compact string representation
```ts
formatStackTraceCompact(nodes: StackTreeNode[]): string
```
**Parameters:**
- `nodes: StackTreeNode[]` — The compressed stack tree nodes
**Returns:** `string` — A formatted string like "foo &lt;- bar &lt;- (baz * 3) &lt;- qux"

### `wrapThrowToError`
Runs the function, and if it throws an error that isn't a JEBError,
wraps it in the given error type and re-throws it, otherwise returns the function result.
```ts
wrapThrowToError<T>(kind: (message: string, options: { cause: any }) => JEBError, f: () => T): T
```
**Parameters:**
- `kind: (message: string, options: { cause: any }) => JEBError` — Kind of JEB error a thrown error causes
- `f: () => T` — The function to catch errors from
**Returns:** `T` — The result of the function or NOTHING if the function threw
```
defineBuiltin(vm, "test", null, false, false,
    (vm, args) => wrapThrowToError(vm, "test:testError",
        () => doSomethingThatMayThrow(vm, args[0])));
```

### `checkNothingOrPush`
Pushes the value to the VM's data stack, but only if the value is not NOTHING.
```ts
checkNothingOrPush(vm: JebVM, value: any): void
```
**Parameters:**
- `vm: JebVM` — VM we're running in
- `value: any` — Value to check

## implicitBegin

### `implicitBegin`
Sets up instructions to run all of the arguments in order and the result is the value of the last one.
```ts
implicitBegin(vm: JebVM, args: any[]): symbol
```
**Parameters:**
- `vm: JebVM` — VM to evaluate in
- `args: any[]` — List of things to evaluate
**Returns:** `symbol` — - NOTHING

## math

### `numberOp`
Wraps a numeric function to automatically work with both numbers and bigints and automatically upcast
or downcast as needed to keep precision okay (divsion needs to be handled separately; bigint/bigint will still round)
```ts
numberOp(cb: BinaryFun): (a: number | bigint, b: number | bigint) => number | bigint
```
**Parameters:**
- `cb: BinaryFun` — The function that will be called as either `(a: number, b: number) =&gt; number` or `(a: bigint, b: bigint) =&gt; bigint` (the types are all `any` due to typescript shenanigans)
**Returns:** `(a: number | bigint, b: number | bigint) => number | bigint` — the wrapped function that can be called with any number or bigint combination

## protocol

### `typeMatches`
Matches the object's type to the given specifier
```ts
typeMatches(obj: any, type: Type): number
```
**Parameters:**
- `obj: any` — The object to check
- `type: Type` — The type specifier
**Returns:** `number` — Score of the match, higher is a closer match, 0 is no match

### `theTypeName`
```ts
theTypeName(type: Type): string
```
**Parameters:**
- `type: Type`
**Returns:** `string`

### `typeOf`
```ts
typeOf(x: any): Type
```
**Parameters:**
- `x: any`
**Returns:** `Type`

### `getProtocolHandler`
```ts
getProtocolHandler(protocols: Partial<JEBProtocols>, fast: boolean, name: PropertyKey, args: any[]): BaseProtocolObj<any, any[], {}, any> | DescribedProtocolObj<any, any[], {}, any, any> | undefined
```
**Parameters:**
- `protocols: Partial<JEBProtocols>`
- `fast: boolean`
- `name: PropertyKey`
- `args: any[]`
**Returns:** `BaseProtocolObj<any, any[], {}, any> | DescribedProtocolObj<any, any[], {}, any, any> | undefined`

## signature

### `createSignature`
```ts
createSignature<S>(signature: S): CallableSignatureFromShorthand<S>
```
**Parameters:**
- `signature: S`
**Returns:** `CallableSignatureFromShorthand<S>`

## utils

### `isIdentifier`
```ts
isIdentifier(x: unknown): x is Identifier
```
**Parameters:**
- `x: unknown`
**Returns:** `x is Identifier`

## vm

### `pushData`
```ts
pushData(vm: JebVM, data: any): void
```
**Parameters:**
- `vm: JebVM`
- `data: any`

### `pushCommand`
```ts
pushCommand<T>(vm: JebVM, cmd: T, args: GetArgParams<T>): void
```
**Parameters:**
- `vm: JebVM`
- `cmd: T`
- `args: GetArgParams<T>`

### `popData`
```ts
popData(vm: JebVM): any
```
**Parameters:**
- `vm: JebVM`
**Returns:** `any`

### `popNData`
```ts
popNData(vm: JebVM, n: number): any[]
```
**Parameters:**
- `vm: JebVM`
- `n: number`
**Returns:** `any[]`

### `peekData`
```ts
peekData(vm: JebVM): any
```
**Parameters:**
- `vm: JebVM`
**Returns:** `any`

## initializers

### `__initializer`
```ts
__initializer(f: (x: JebVM) => void): void
```
**Parameters:**
- `f: (x: JebVM) => void`
