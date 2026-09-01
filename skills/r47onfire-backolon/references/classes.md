# Classes

## errors

### `BackolonError`
An error from Backolon code that contains the location in the source that caused the error.
*extends `JEBError`*
```ts
constructor(message: string, context: Record<string, any> & ErrorOptions, traceback?: StackTreeNode[]): BackolonError
```

## runtime

### `Importer`
```ts
constructor(loaders: Loader[]): Importer
```
**Properties:**
- `loaders: Loader[]`
**Methods:**
- `loadModule(vm: BackolonVM, parent: Module | null, url: URL, asMain: boolean): void` — Pushes the required opcodes to the stack to load the module at the
given URL and leave the Module on the stack.

### `Loader`
Object whose job it is to download or open the file
and then load its contents into a module object.
```ts
constructor(): Loader
```
**Methods:**
- `get(url: URL): Loader | undefined` — Returns undefined if this loader can't load the URL.
Returns itself or another loader that will load the
- `load(url: URL, module: Module, vm: BackolonVM, asMain: boolean): void` — Called when this loader has been selected to load the given URL
into the given Module. Should push opcodes to do so.

### `BackolonVM`
*extends `JebVM`*
```ts
constructor(importer: Importer): BackolonVM
```
**Properties:**
- `parser: Parser | null` — Current parser context - null if not parsing
- `importer: Importer`
- `modules: Record<string, Module>` — Module cache
- `sources: Record<string, SourceTracker>` — Mapping of URL to source tracker
- `spans: Record<string, Span>` — Mapping of location ID (for the JEB `at` identifier function) to the actual Span
**Methods:**
- `getState(): BackolonVMState`
- `restoreState(state: BackolonVMState): void`
- `start(url: URL): void` — Starts running the main module
