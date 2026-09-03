# Variables & Constants

## runtime

### `OP_do_import`
```ts
const OP_do_import: (vm: BackolonVM, __namedParameters: [parent: Module | null, main?: boolean]) => void
```

### `MODULE_NAME`
Special symbol identifier used to identify module names that can't be shadowed.
```ts
const MODULE_NAME: typeof MODULE_NAME
```

## plugin

### `default`
[ESBuild](https://esbuild.github.io) or [Bun](https://bun.com) plugin that loads `.bk`
files as their Backolon AST.
```ts
const default: BunPlugin
```
