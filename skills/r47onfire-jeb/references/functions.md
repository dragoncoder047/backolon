# Functions

## builtins

### `loadBuiltins`
```ts
loadBuiltins(vm: JebVM): void
```
**Parameters:**
- `vm: JebVM`

### `alias`
```ts
alias(vm: JebVM, name1: string, name2: string): void
```
**Parameters:**
- `vm: JebVM`
- `name1: string`
- `name2: string`

### `defineApplier`
```ts
defineApplier(vm: JebVM, apply: Applier<any>): void
```
**Parameters:**
- `vm: JebVM`
- `apply: Applier<any>`

### `defineBuiltin`
```ts
defineBuiltin<T>(vm: T, name: string, arity: number | { min: number; max: number } | null, isSpecial: boolean, resultIsMacro: boolean, fn: (args: any[], vm: T) => any, doc: string): void
```
**Parameters:**
- `vm: T`
- `name: string`
- `arity: number | { min: number; max: number } | null` — The allowable number of arguments to the function.
If an object, specifies the min and max.
If a number, min and max are the same.
If null, min = 0 and max = Infinity.
- `isSpecial: boolean`
- `resultIsMacro: boolean`
- `fn: (args: any[], vm: T) => any` — The function to implement the builtin. It should use the VM from the parameter, and **not**
close over the one that is passed to the `vm` parameter of `defineBuiltin` (since this builtin may be reused for a sub-VM for
e.g. an FFI callback).
- `doc: string`

### `defineOpcode`
```ts
defineOpcode<T>(vm: T, name: string, fn: OpcodeFunction<T>): void
```
**Parameters:**
- `vm: T`
- `name: string`
- `fn: OpcodeFunction<T>` — The function to implement the opcode. It should use the VM from the parameter, and **not**
close over the one that is passed to the `vm` parameter of `defineOpcode` (since this opcode may be reused for a sub-VM for
e.g. an FFI callback).

### `implicitBegin`
```ts
implicitBegin(vm: JebVM, args: any): void
```
**Parameters:**
- `vm: JebVM`
- `args: any`

## doc

### `parseDoc`
```ts
parseDoc(docstring: string): Doc
```
**Parameters:**
- `docstring: string`
**Returns:** `Doc`

## errors

### `jsError`
```ts
jsError(type: string, message: string, stack: string[]): never
```
**Parameters:**
- `type: string`
- `message: string`
- `stack: string[]`
**Returns:** `never`

### `resultToError`
```ts
resultToError<T>(vm: JebVM, kind: string, result: Result<T, any>): typeof NOTHING | T
```
**Parameters:**
- `vm: JebVM`
- `kind: string`
- `result: Result<T, any>`
**Returns:** `typeof NOTHING | T`

## linked_list

### `llLength`
```ts
llLength(ll: LinkedList<any>): number
```
**Parameters:**
- `ll: LinkedList<any>`
**Returns:** `number`

### `llPop`
```ts
llPop<T>(ll: T): { value: T["value"]; rest: T | null }
```
**Parameters:**
- `ll: T`
**Returns:** `{ value: T["value"]; rest: T | null }`

### `llPopN`
```ts
llPopN<T>(ll: T, popAmount: number, reverse: boolean): { values: T["value"][]; rest: T | null }
```
**Parameters:**
- `ll: T`
- `popAmount: number`
- `reverse: boolean` — default: `true`
**Returns:** `{ values: T["value"][]; rest: T | null }`

### `llPush`
```ts
llPush<T>(top: LinkedList<T>, value: T): LinkedListNode<T>
```
**Parameters:**
- `top: LinkedList<T>`
- `value: T`
**Returns:** `LinkedListNode<T>`

### `llPushArray`
```ts
llPushArray<T>(ll: LinkedList<T>, moreValues: T[]): LinkedList<T>
```
**Parameters:**
- `ll: LinkedList<T>`
- `moreValues: T[]`
**Returns:** `LinkedList<T>`

### `llToArray`
```ts
llToArray<T>(ll: T | null): T["value"][]
```
**Parameters:**
- `ll: T | null`
**Returns:** `T["value"][]`

## math

### `numberOp`
```ts
numberOp(cb: BinaryFun): (a: number | bigint, b: number | bigint) => number | bigint
```
**Parameters:**
- `cb: BinaryFun`
**Returns:** `(a: number | bigint, b: number | bigint) => number | bigint`

## overload

### `typeMatches`
```ts
typeMatches(obj: any, type: Type): number
```
**Parameters:**
- `obj: any`
- `type: Type`
**Returns:** `number`
