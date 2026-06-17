# Functions

## `tokenize`
Tokenize Backolon source text into a list of tokens. No further grouping is done;
parens like "(" are kept as "paren" tokens.
```ts
tokenize(source: string, filename: URL): Token[]
```
**Parameters:**
- `source: string` — 
- `filename: URL` — default: `UNKNOWN_LOCATION.file` — 
**Returns:** `Token[]`
