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
