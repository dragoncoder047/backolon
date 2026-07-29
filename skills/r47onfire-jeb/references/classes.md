# Classes

## callable

### `BuiltinFunction`
Wrapper for a Javascript function that can be called by the JEB runtime.
The Javascript function has access to the VM so it can push opcodes to
implement more than just computation.
*implements `HasDocstring`*
```ts
constructor(name: string, arity: Arity, isSpecial: boolean, resultIsMacro: boolean, impl: (args: any[], vm: JebVM) => any, doc: string): BuiltinFunction
```
**Properties:**
- `name: string` — The name of the function as it should appear in a traceback.
- `arity: Arity`
- `isSpecial: boolean` — Whether the function's arguments should be evaluated (false) or passed unevaluated (true).
- `resultIsMacro: boolean` — Whether the return value should be evaluated again in the caller's scope.
- `impl: (args: any[], vm: JebVM) => any` — The javascript function implementation.

If the function returns the special value NOTHING, no
value will be pushed as the result of the function call. Otherwise, the
return value is pushed (even if it's `undefined`).
- `doc: string` — The docstring given - should define the allowable syntax(es) of the function
or macro and give a description of its behavior.

### `CallableClass`
Callable hack from stackoverflow.com/a/78553691. Subclasses of this
are actually instances of `Function`, so `typeof this === "function"`.
*extends `(Anonymous class)<this>`*
```ts
constructor(): CallableClass
```
**Methods:**
- `__call__(args: any[]): any` — Called when the object is invoked as a function (i.e. `this(...)`)
- `__new__(args: any[]): any` — Called when the object is invoked as a class constructor (i.e. `new this(...)`)

### `Lambda`
A Lambda is a callable function or macro implemented as JEB code instead of
a Javascript function.
*extends `CallableClass`*
*implements `HasDocstring`*
```ts
constructor(isMacro: boolean, isImplicit: boolean, name: string | undefined, args: string[], optArgs: [name: string, defaultExpression: any][], restArg: string | null, body: any, closureEnv: Env, doc: string): Lambda
```
**Properties:**
- `isMacro: boolean` — Whether the return value should be evaluated again in the caller's scope.
- `isImplicit: boolean` — Whether the lambda should be hidden from stack traces.
- `name: string | undefined` — The name of the function as it should appear in a traceback. Ignored if isImplicit=true
- `args: string[]` — The names of the required arguments.
- `optArgs: [name: string, defaultExpression: any][]` — The names of the optional arguments along with their default expressions.
If the default is needed, the expression for it will be evaluated in a dynamic
environment consisting of the
- `restArg: string | null` — The name of the rest argument at the end which will receive a list of
all arguments passed beyond the required and optional named arguments.
If null, there is no rest argument and the lambda has a maximum number of arguments.
- `body: any` — The body code that will be evaluated in the new scope with the argument values bound.
- `closureEnv: Env` — The environment that this lambda closes over.
- `doc: string` — The docstring given - should define the allowable syntax(es) of the function
or macro and give a description of its behavior.
**Methods:**
- `__call__(): never` — JEB lambdas are currently not callable via javascript.
- `__new__(): never` — JEB lambda are not class constructors.

## continuation

### `Continuation`
A continuation which holds all the VM state, and can restore it at any time
```ts
constructor(vm: JebVM, extraOps: Command[]): Continuation
```
**Properties:**
- `env: Env` — Closed-over environment
- `commands: LinkedList<Command>` — Closed-over command stack in progress
- `data: LinkedList<any>` — Closed-over data stack in progress
- `winders: DynamicWind` — Closed-over dynamic wind stack in progress
- `traceback: StackCount | null` — Closed-over traceback stack in progress
**Methods:**
- `invoke(vm: JebVM, data: any): void` — Call the continuation and restore the state of the VM

### `DynamicWind`
Node in a dynamic wind tree
```ts
constructor(vm: JebVM): DynamicWind
```
**Properties:**
- `handler: Windable | null`
- `envHere: Env` — current env at the point of the dynamic wind start
- `parent: DynamicWind | null`
- `commandsHere: LinkedList<Command>` — closed-over command stack
- `dataHere: LinkedList<any>` — closed-over data stack
**Methods:**
- `setHandler(handler: Windable): DynamicWind` — sets the handler after it has been processed
- `processJumpHere(vm: JebVM): void` — processes the jump here, and adds instructions to call the enter and exit handlers
- `restore(vm: JebVM): void` — Restores the dynamic wind state when an error occurs

## dispatch

### `Accessor`
Utility object that handles when an object of the specified type is indexed.
*extends `TypeDispatcher`*
```ts
constructor<T>(type: Type): Accessor<T>
```
*Inherits 2 properties from `TypeDispatcher` — see [`TypeDispatcher`](../typedispatcher.md)*
**Methods:**
- `access(object: TypeFor<T>, field: PropertyKey): LValue` — Called to create the LValue to implement the get and set operations.

### `Applier`
Utility object that handles when an object of the specified type is called.
*extends `TypeDispatcher`*
```ts
constructor<T>(type: Type): Applier<T>
```
*Inherits 2 properties from `TypeDispatcher` — see [`TypeDispatcher`](../typedispatcher.md)*
**Methods:**
- `apply(func: TypeFor<T>, alreadyEvaluated: boolean, tailcallHint: boolean, args: any[], vm: JebVM): void` — Performs the application
- `getNameOf(func: TypeFor<T>): string | undefined` — Gets the name of the function to appear in tracebacks, if undefined is returned it means it's a hidden callframe and won't show.
Note: the apply opcode uses this to determine whether to insert a `jeb:tb_pop` opcode, but it relies on this applier's apply
method to add the corresponding `jeb:tb_push` opcode.
- `getArity(func: TypeFor<T>): Arity` — Gets the minimum and maximum arguments for the function call, this is checked before apply is called.
- `getIsMacro(func: TypeFor<T>): boolean` — Returns true if the functor being called is a macro, and the result should be evaluated again in its caller's scope.

### `EnvVarLValue`
Represents a slot that can be assigned to
*implements `LValue`*
```ts
constructor(env: Env, name: string): EnvVarLValue
```
**Properties:**
- `env: Env`
- `name: string`
**Methods:**
- `get(vm: JebVM, type: AccessType): void` — Pushes the value currently in the slot to the top of the stack, or
throw an error if it's not readable.
- `set(vm: JebVM, value: any, type: AccessType, create: boolean, readonly: boolean): void` — Set the value of the slot to the provided value,
or throws an error if it's readonly. The stack should not be modified either way.
- `referenceError(vm: JebVM, type: AccessType): void`

### `Evaluator`
Utility object that handles when an object of the specified type is evaluated.
*extends `TypeDispatcher`*
```ts
constructor<T>(type: Type): Evaluator<T>
```
*Inherits 2 properties from `TypeDispatcher` — see [`TypeDispatcher`](../typedispatcher.md)*
**Methods:**
- `eval(object: TypeFor<T>, tailcallHint: boolean, vm: JebVM): void` — Called to push the opcodes needed to evaluate the object.

### `TypeDispatcher`
```ts
constructor(type: Type): TypeDispatcher
```
**Properties:**
- `type: Type` — The type that this dispatcher works with.
- `doc: string` — Documentation string for this dispatcher type

## env

### `Env`
Key-value store for managing an environment, with inheritance from parent environments.
```ts
constructor(bindings: Record<string, any>, parents: readonly Env[]): Env
```
**Properties:**
- `constants: Record<string, true>`
- `bindings: Record<string, any>`
- `parents: readonly Env[]`
**Methods:**
- `get(name: string): Result<any, void>` — Look up the value, and return its value (in an ok result)
or an err result if not found
- `add(name: string, value: any): void` — Defines the value in this scope (always succeeds)
- `addConst(name: string, value: any): void` — Defines the constant in this scope (always succeeds)
- `set(name: string, value: any): boolean | undefined` — Finds the scope in which this value is defined, and sets it there.
Returns true if it was set, false if it's a constant and can't be changed,
or undefined if it wasn't defined anywhere.
- `gensym(): string` — Generates a random symbol that isn't set anywhere already.
- `getVisibleNames(): string[]` — returns a list of all the names visible here (direct and inherited)

## overload

### `Arithmetic`
Represents an object that you can use to perform operations on any kind of number-like quantity,
such as a number or vector
```ts
constructor(): Arithmetic
```
**Methods:**
- `overload<T>(op: keyof Operations, types: T, handler: (args: TypeArrayValue<T>) => Result<any, string>): void` — Defines a new overload
- `call(op: keyof Operations, args: [any, ...any[]]): Result<any, string>` — Performs an operation

## vm

### `JebVM`
Base VM for running JEB code
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
- `builtinsEnv: Env` — Environment that all builtins live in
- `opcodeTable: Record<string, [impl: OpcodeFunction<this>, doc: string | null]>`
- `applyTable: Applier<any>[]`
- `evalTable: Evaluator<any>[]`
- `accessTable: Accessor<any>[]`
- `math: Arithmetic`
**Methods:**
- `pushData(value: any): void`
- `popNData(n: number): any[]`
- `popData(): any`
- `peekData(): any`
- `pushCommand(name: string, args: any[]): void`
- `step(): boolean` — Runs one opcode.
- `start(code: any): void` — Starts running the code
- `reset(): void` — Silently stops running the code, by resetting all stacks state back to the initial empty state.
Does not clear the global or builtins env.
- `checkRecursion(length: number): void` — If the recursionDepth is larger than the given length, adds an error to the command stack
to signal to the running program that it's recursing too much
- `tracebackArray(): StackTreeNode[]` — Returns the names of the functions in the call stack, with innermost first
- `tracebackPush(func: string, tailcallHint: boolean): void` — Adds a function call entry to the traceback stack
- `tracebackPop(): void` — Drops all the tail-call entries off the stack, and then one more
- `newDynamicWind(): DynamicWind`
- `createEnv(parents: Env[]): Env`
- `cc(extraOps: Command[]): Continuation` — Returns the current continuation at this state.
- `fatalError(type: string, message: string): never`
