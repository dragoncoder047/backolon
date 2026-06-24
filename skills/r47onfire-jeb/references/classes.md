# Classes

## callable

### `BuiltinFunction`
*implements `HasDocstring`*
```ts
constructor(name: string, arity: number | { min: number; max: number } | null, isSpecial: boolean, resultIsMacro: boolean, impl: (args: any[], vm: JebVM) => any, doc: string): BuiltinFunction
```
**Properties:**
- `name: string`
- `arity: number | { min: number; max: number } | null`
- `isSpecial: boolean`
- `resultIsMacro: boolean`
- `impl: (args: any[], vm: JebVM) => any`
- `doc: string`

### `Lambda`
*extends `CallableClass`*
*implements `HasDocstring`*
```ts
constructor(isMacro: boolean, isImplicit: boolean, name: string | undefined, args: string[], optArgs: [string, any][], restArg: string | null, body: any, closureEnv: Env, doc: string): Lambda
```
**Properties:**
- `isMacro: boolean`
- `isImplicit: boolean`
- `name: string | undefined`
- `args: string[]`
- `optArgs: [string, any][]`
- `restArg: string | null`
- `body: any`
- `closureEnv: Env`
- `doc: string`
**Methods:**
- `__call__(): void`
- `__new__(): void`
- `bind(thisArg: any, argv: any[]): Lambda`

## continuation

### `Continuation`
```ts
constructor(env: any, commands: LinkedList<Command>, data: LinkedList<any>, winders: DynamicWind, traceback: StackCount | null): Continuation
```
**Properties:**
- `env: any`
- `commands: LinkedList<Command>`
- `data: LinkedList<any>`
- `winders: DynamicWind`
- `traceback: StackCount | null`
**Methods:**
- `invoke(vm: JebVM, data: any): void`

### `DynamicWind`
```ts
constructor(envHere: Env, parent: DynamicWind | null, handler: Windable | null, commandsHere: LinkedList<Command>, dataHere: LinkedList<any>): DynamicWind
```
**Properties:**
- `envHere: Env`
- `parent: DynamicWind | null`
- `handler: Windable | null`
- `commandsHere: LinkedList<Command>`
- `dataHere: LinkedList<any>`
**Methods:**
- `setHandler(handler: Windable): DynamicWind`
- `processJumpHere(vm: JebVM): void`
- `restore(vm: JebVM): void`

## env

### `Env`
Key-value store for managing an environment, with inheritance from parent environments.
```ts
constructor(bindings: Record<string, any>, parents: readonly Env[]): Env
```
**Properties:**
- `bindings: Record<string, any>`
- `parents: readonly Env[]`
**Methods:**
- `get(name: string): Result<any, void>` — Look up the value, and return its value (in an ok result)
or an err result if not found
- `define(name: string, value: any): void` — Defines the value in this scope
- `set(name: string, value: any): boolean` — Finds the scope in which this value is defined, and sets it there.
Returns true if it was set, or false if it wasn't found.
- `gensym(): string` — Generates a random symbol that isn't set anywhere already.
- `getVisibleNames(): string[]`

## overload

### `Arithmetic`
Represents an object that you can use to perform operations on any kind of number-like quantity,
such as a number or vector
```ts
constructor(): Arithmetic
```
**Methods:**
- `overload<T>(op: keyof Operations, types: T, handler: (args: TypeArrayValue<T>) => Result<any, string>): void`
- `call(op: keyof Operations, args: [any, ...any[]]): Result<any, string>`

## vm

### `Applier`
```ts
constructor<T>(type: Type): Applier<T>
```
**Properties:**
- `type: Type` — The type that this applier works with.
**Methods:**
- `apply(func: TypeFor<T>, alreadyEvaluated: boolean, tailcallHint: boolean, args: any[], vm: JebVM): void` — Performs the application
- `getNameOf(func: TypeFor<T>): string | undefined` — Gets the name of the function to appear in tracebacks, if undefined is returned it means it's a hidden callframe and won't show.
Note: the apply opcode uses this to determine whether to insert a `jeb:tb_pop` opcode, but it relies on this applier's apply
method to add the corresponding `jeb:tb_push` opcode.
- `getArity(func: TypeFor<T>): number | { min: number; max: number } | null` — Gets the minimum and maximum arguments for the function call, this is checked before apply is called.
A single number means min = max = that number, and null means min = 0, max = Infinity.
- `getIsMacro(func: TypeFor<T>): boolean` — Returns true if the functor being called is a macro, and the result should be evaluated again in its caller's scope.

### `JebVM`
```ts
constructor(math: Arithmetic): JebVM
```
**Properties:**
- `currentEnv: Env` — current environment
- `commandStack: LinkedList<Command>` — stack of commands to execute
- `dataStack: LinkedList<any>` — stack of values
- `curDynamicWind: DynamicWind` — current dynamic wind stack (linked list / tree)
- `paused: boolean` — whether the VM is paused
- `tracebackStack: StackCount | null` — callstack entries
- `builtinsEnv: Env`
- `globalEnv: Env`
- `opcodeTable: Record<string, OpcodeFunction<this>>`
- `applyTable: Applier<any>[]`
- `math: Arithmetic`
**Methods:**
- `pushData(value: any): void`
- `popNData(n: number): any[]`
- `popData(): any`
- `peekData(): any`
- `pushCommand(name: string, args: any[]): void`
- `getVar(name: string): Result<any, void>`
- `setVar(name: string, value: any): boolean`
- `defineVar(name: string, value: any): void`
- `step(): boolean`
- `start(code: any): void`
- `reset(): void`
- `checkRecursion(length: number): void`
- `tracebackArray(): string[]`
- `tracebackPush(func: string, tailcallHint: boolean): void`
- `tracebackPop(): void`
- `newDynamicWind(): DynamicWind`
- `createEnv(parents: Env[]): Env`
- `cc(extraOps: Command[]): Continuation` — Returns the current continuation at this state.
- `fatalError(type: string, message: string): never`
