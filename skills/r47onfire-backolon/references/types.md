# Types & Enums

## parser

### `Parser`
**Properties:**
- `source: SourceTracker`
- `index: number`
- `parselets: Parselet[]`
- `constraints: Constraint<Parselet>[]`
- `skipErrors: boolean`

### `Parselet`
**Properties:**
- `prefix: RegExp` — It always has the sticky (y) flag.
- `parse: any` — This is a JEB callable (builtin, lambda, etc) that implements the parse
handler of the parselet.

The signature is always (context, left, token)

For a prefix position, left is undefined, and context.first is true.

For an infix position, left is the left-side expression, and context.first is false.

In either case the parse function must return a chunk of JEB code that implements the
parse result, call `skip()` to mark what it has parsed as insignificant (`skip`
is a continuation which doesn't return), or call `discard()`
which goes to the next token.

### `Span`
Source location information for a token.
**Properties:**
- `file: Readonly<URL>` — URL uniquely identifying the source that this span is from.
- `start: number` — Source index at which this span starts. (not line or column.)
- `end: number` — Source index at which this span ends.

## runtime

### `SourceTracker`
**Properties:**
- `src: Readonly<URL>`
- `code: string`
- `tags: Record<number, string[]>`

### `Module`
**Properties:**
- `parselets: Parselet[]` — The saved parselets list at the end of the module body.
- `constraints: Constraint<Parselet>[]`
- `exports: Record<string, VariableReference>` — The named exports for the module
- `parent: true | Module | null` — This is used to detect and throw a "circular import!" error when
attempting to do something (access properties, etc) of a module
when it's not finished loading, as well as to avoid loading it when
it's already loaded
- `id: URL`
