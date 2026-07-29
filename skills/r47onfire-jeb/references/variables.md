# Variables & Constants

## doc

### `EmptyTag`
Parser for a blank tag that only serves as a flag and carries no content.
```ts
const EmptyTag: DocMetadataParser
```

### `ParamTag`
Parser for a param tag (pretty common) with the form `{type} name - description` or `{type} [name=default] - description`
```ts
const ParamTag: DocMetadataParser
```

### `ReturnsTag`
Parser for a returns tag (pretty common) with the form `{type} - description`
```ts
const ReturnsTag: DocMetadataParser
```

### `ThrowsTag`
Parser for a throws tag for throwing errors
```ts
const ThrowsTag: DocMetadataParser
```

### `OpcodeParsers`
Metadata parsers used for the JEB stack machine opcode docstrings
```ts
const OpcodeParsers: Record<string, DocMetadataParser>
```

### `FuncOrMacroTag`
Metadata parser for the func or macro tags
```ts
const FuncOrMacroTag: DocMetadataParser
```

### `FunctionOrMacroParsers`
Metadata parsers used for the high(er)-level JEB function or macro docstrings
```ts
const FunctionOrMacroParsers: Record<string, DocMetadataParser>
```

### `ApplierParsers`
Metadata parsers used for the Applier docstring
```ts
const ApplierParsers: Record<string, DocMetadataParser>
```

### `EvaluatorParsers`
Metadata parsers used for the Evaluator docstring
```ts
const EvaluatorParsers: Record<string, DocMetadataParser>
```

### `AccessorParsers`
Metadata parsers used for the Accessor docstring
```ts
const AccessorParsers: Record<string, DocMetadataParser>
```

## builtins

### `NOTHING`
Special symbol that means "this function is a macro and pushed opcodes
which implement the return value, don't push my return value" for built-in functions,
which normally treat `undefined` as a valid return value and push it to the stack.
```ts
const NOTHING: unique symbol
```
