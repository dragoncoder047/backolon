# Functions

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

### `alias`
Copies the value of a builtin value to the new name in the builtins scope.
```ts
alias(vm: JebVM, srcName: string, dstName: string): void
```
**Parameters:**
- `vm: JebVM`
- `srcName: string` — Source (should already be defined)
- `dstName: string` — Target (will be defined to be the same as the source's value)

### `defineAccessor`
Defines a new accessor that can be used by the `jeb:get` and `jeb:set` opcodes to look up or reassign a field on something.
```ts
defineAccessor(vm: JebVM, apply: Accessor<any>): void
```
**Parameters:**
- `vm: JebVM`
- `apply: Accessor<any>`

### `defineApplier`
Defines a new applier that can be used by the `jeb:apply` opcode to call something.
```ts
defineApplier(vm: JebVM, apply: Applier<any>): void
```
**Parameters:**
- `vm: JebVM`
- `apply: Applier<any>`

### `defineBuiltin`
Defines a builtin function in the VM's builtins scope as a constant.
```ts
defineBuiltin<T>(vm: T, name: string, arity: Arity, isSpecial: boolean, resultIsMacro: boolean, fn: (args: any[], vm: T) => any, doc: string): void
```
**Parameters:**
- `vm: T`
- `name: string`
- `arity: Arity` — The allowable number of arguments to the function.
If an object, specifies the min and max.
If a number, min and max are the same.
If null, min = 0 and max = Infinity.
- `isSpecial: boolean`
- `resultIsMacro: boolean`
- `fn: (args: any[], vm: T) => any` — The function to implement the builtin. It should use the VM from the parameter, and **not**
close over the one that is passed to the `vm` parameter of `defineBuiltin` (since this builtin may be reused for a sub-VM for
e.g. an FFI callback).
- `doc: string`

### `defineEvaluator`
Defines a new applier that can be used by the `jeb:eval` opcode to evaluate or unwrap something.
```ts
defineEvaluator(vm: JebVM, apply: Evaluator<any>): void
```
**Parameters:**
- `vm: JebVM`
- `apply: Evaluator<any>`

### `defineOpcode`
Defines a new opcode for the VM.
```ts
defineOpcode<T>(vm: T, name: string, fn: OpcodeFunction<T>, doc: string | null): void
```
**Parameters:**
- `vm: T`
- `name: string`
- `fn: OpcodeFunction<T>` — The function to implement the opcode. It should use the VM from the parameter, and **not**
close over the one that is passed to the `vm` parameter of `defineOpcode` (since this opcode may be reused for a sub-VM for
e.g. an FFI callback).
- `doc: string | null`

### `implicitBegin`
Sets up instructions to run all of the arguments in order and the result is the value of the last one.
```ts
implicitBegin(vm: JebVM, args: any[]): symbol
```
**Parameters:**
- `vm: JebVM` — VM to evaluate in
- `args: any[]` — List of things to evaluate
**Returns:** `symbol` — - NOTHING

## dispatch

### `findDispatcherForObject`
```ts
findDispatcherForObject<T>(table: T[], object: any): T | undefined
```
**Parameters:**
- `table: T[]` — List of dispatchers
- `object: any` — Object to be dispatched on
**Returns:** `T | undefined` — The best match dispatcher, or undefined if none match

## errors

### `compressStackTree`
```ts
compressStackTree(nodes: StackTreeNode[]): StackTreeNode[]
```
**Parameters:**
- `nodes: StackTreeNode[]`
**Returns:** `StackTreeNode[]`

### `createStackInnerNode`
```ts
createStackInnerNode(count: number, children: StackTreeNode[]): StackTreeNode
```
**Parameters:**
- `count: number`
- `children: StackTreeNode[]`
**Returns:** `StackTreeNode`

### `createStackLeafNode`
```ts
createStackLeafNode(name: string): StackTreeNode
```
**Parameters:**
- `name: string`
**Returns:** `StackTreeNode`

### `jsError`
Formats the stack nicely and then throws the error
```ts
jsError(type: string, message: string, stackTree: StackTreeNode[]): never
```
**Parameters:**
- `type: string` — type string for the error
- `message: string` — message of the error
- `stackTree: StackTreeNode[]` — The compressed stack tree from the VM
**Returns:** `never`

### `resultToError`
Runs the function, and if it returns a Err result, queues the error to be
caught by JEB code and returns NOTHING, otherwise if it's an Ok
just returns the result.
```ts
resultToError<T>(vm: JebVM, kind: string, result: Result<T, any>): typeof NOTHING | T
```
**Parameters:**
- `vm: JebVM` — VM we're running in
- `kind: string` — Kind of JEB error an Err causes
- `result: Result<T, any>` — The result to look at
**Returns:** `typeof NOTHING | T` — The result of the function or NOTHING if the function threw
```
defineBuiltin(vm, "test", null, false, false,
    (vm, args) => resultToError(vm, "test:testError",
        doSomethingThatReturnsAResult(vm, args[0])));
```

## linked_list

### `llLength`
Returns the length of the linked list quickly (since linked list
nodes know their own length by way of being immutable)
```ts
llLength(ll: LinkedList<any>): number
```
**Parameters:**
- `ll: LinkedList<any>`
**Returns:** `number`

### `llPop`
Takes the top item off the linked list, and returns the item as well as the rest of the list
```ts
llPop<T>(ll: T): [value: T["value"], rest: T | null]
```
**Parameters:**
- `ll: T`
**Returns:** `[value: T["value"], rest: T | null]` — an object with value = the top item value, and rest = the 2nd and subsequent items list

### `llPopN`
Pops N items off the linked list and returns them in an array, as well as the rest of the linked list.
If the list is shorter than the requested amount, the returned array will have all the items, and the rest will be null.
```ts
llPopN<T>(ll: T | null, popAmount: number): [values: T["value"][], rest: T | null]
```
**Parameters:**
- `ll: T | null`
- `popAmount: number` — number of items to pop
**Returns:** `[values: T["value"][], rest: T | null]` — an object with values = the array of values, and rest = the 2nd and subsequent items list

### `llPush`
Returns a new linked list with the value added to the top
```ts
llPush<T>(top: LinkedList<T>, value: T): LinkedListNode<T>
```
**Parameters:**
- `top: LinkedList<T>`
- `value: T`
**Returns:** `LinkedListNode<T>`

### `llPushArray`
Prepends the new items to the list in reverse order, so that the first item of the array is the new first item of the linked list, and returns the new linked list.
```ts
llPushArray<T>(ll: LinkedList<T>, moreValues: T[]): LinkedList<T>
```
**Parameters:**
- `ll: LinkedList<T>`
- `moreValues: T[]`
**Returns:** `LinkedList<T>`
```js
// Convert the array to a linked list by pushing it to null:
const linkedArray = llPushArray(null, [1, 2, 3]);
// linkedArray == {data: 1, next: {data: 2, next: {data: 3, next: null}}};

## math

### `numberOp`
Wraps a numeric function to automatically work with both numbers and bigints and automatically upcast
or downcast as needed to keep precision okay (divsion needs to be handled separately; bigint/bigint will still round)
```ts
numberOp(cb: BinaryFun): (a: number | bigint, b: number | bigint) => number | bigint
```
**Parameters:**
- `cb: BinaryFun` — The function that will be called as either `(a: number, b: number) => number` or `(a: bigint, b: bigint) => bigint` (the types are all `any` due to typescript shenanigans)
**Returns:** `(a: number | bigint, b: number | bigint) => number | bigint` — the wrapped function that can be called with any number or bigint combination

## overload

### `theTypeName`
```ts
theTypeName(type: Type): string | undefined
```
**Parameters:**
- `type: Type`
**Returns:** `string | undefined`

### `typeMatches`
Matches the object's type to the given specifier
```ts
typeMatches(obj: any, type: Type): number
```
**Parameters:**
- `obj: any` — The object to check
- `type: Type` — The type specifier
**Returns:** `number` — Score of the match, higher is a closer match, 0 is no match

### `typeOf`
```ts
typeOf(x: any): Type
```
**Parameters:**
- `x: any`
**Returns:** `Type`
