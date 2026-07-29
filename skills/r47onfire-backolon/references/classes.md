# Classes

## errors

### `BackolonError`
An error from Backolon code that contains the location in the source that caused the error.
*extends `Error`*
```ts
constructor(message: string, loc: Span): BackolonError
```
**Properties:**
- `loc: Span`
**Methods:**
- `displayOn(getSource: (url: URL) => string): string` — Formats the error message nicely

## runtime

### `Importer`
```ts
constructor(lazyLoad: boolean): Importer
```
**Properties:**
- `lazyLoad: boolean`

### `NativeModule`
*extends `Module`*
```ts
constructor(init: (m: NativeModule) => void): NativeModule
```
**Properties:**
- `loadState: LOADED` — Native modules are always loaded, since they don't have to call into Backolon code to load
- `parselets: LinkedList<Parselet>` — The saved parselets list at the end of the module body.
- `exports: Record<string, EnvVarLValue>` — The named exports for the module
**Methods:**
- `load(): void` — Does nothing, since native modules are always loaded.

### `BackolonVM`
*extends `JebVM`*
```ts
constructor(importer: Importer, math?: Arithmetic): BackolonVM
```
**Properties:**
- `parser: Parser | null` — Current parser context
- `parentParser: Parser | null` — Current parser context
- `importer: Importer`
- `modules: Record<string, Module>`
- `sources: Record<string, SourceTracker>`
**Methods:**
- `addModule(name: URL, source: Module): void`
- `setMain(name: URL): void`
- `cc(extraOps: Command[]): BackolonContinuation` — Returns the current continuation at this state.
