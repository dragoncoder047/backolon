# Classes

## `BackolonError`
Base class for Backolon parse and runtime errors.
```ts
constructor(message: string, trace: LocationTrace): BackolonError
```
**Properties:**
- `trace: LocationTrace` — 
**Methods:**
- `displayOn(sources: Record<string, string>): string` — 

## `LocationTrace`
Source location information for Backolon parsing and runtime errors.
```ts
constructor(line: number, col: number, file: URL): LocationTrace
```
**Properties:**
- `line: number` — 
- `col: number` — 
- `file: URL` — 
