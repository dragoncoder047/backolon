# Types & Enums

## errors

### `Span`
Source location information for Backolon errors.
**Properties:**
- `file: Readonly<URL>` — URL uniquely identifying the source that this span is from.
- `start: number` — Source index at which this span starts. (not line or column.)
- `end: number` — Source index at which this span ends.

## parser

### `Parser`
**Properties:**
- `source: SourceTracker`
- `index: number`
- `parselets: LinkedList<Parselet>` — The parselet list is always ascending precedence order
- `skipErrors: boolean`

### `Parselet`
**Properties:**
- `prefix: RegExp` — It must have the sticky (y) flag.
- `parse: any` — This is a JEB callable (builtin, lambda, etc) that implements the parse
handler of the parselet.

The signature is always (skip, discard, current token, left, first)

For a prefix position, left is undefined, and first is true.

For an infix position, left is the left-side expression, and first is false.

In either case the parse function must return a chunk of JEB code that implements the
parse result, call `skip()` to mark what it has parsed as insignificant (`skip`
is a continuation which doesn't return), or call `discard()`
which goes to the next token.
- `precedence: number`

## runtime

### `BackolonContinuation`
**Properties:**
- `parser: Parser | null`
- `parentParser: Parser | null`

### `SourceTracker`
**Properties:**
- `src: Readonly<URL>`
- `code: string`
- `tags: Record<number, string[]>`

### `Module`
**Properties:**
- `parselets: LinkedList<Parselet>` — The saved parselets list at the end of the module body.
- `exports: Record<string, EnvVarLValue>` — The named exports for the module
- `loadState: ModuleLoadState` — This is used to detect and throw a "circular import!" error when
attempting to do something (access properties, etc) of a module
when it's not finished loading, as well as to avoid calling load
when the module is already loaded.

### `ModuleLoadState`
- `UNLOADED` = `0`
- `LOADING` = `1`
- `LOADED` = `2`
