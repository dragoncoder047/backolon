---
description: homoiconic scripting language
license: AGPL-3.0-only
name: r47onfire-backolon
---

# @r47onfire/backolon

homoiconic scripting language

## Quick Reference

**errors:** `BackolonError` (An error from Backolon code that contains the location in the source that caused the error), `NoModuleError` (Error raised when the module is not found (404, network down, ENOENT, etc))
**parser:** `Token`, `Parser`, `Parselet`, `Span` (Source location information for a token)
**runtime:** `Finder`, `Importer`, `SourceTracker`, `Loader` (Object whose job it is to download or open the file
and then load its contents into a module object), `JavascriptModuleLoader` (Loader that handles loading the Javascript modules via `import()`), `JSONModuleLoader` (Loader that handles loading compiled / pre-parsed JSON mo...), `BackolonSourceModuleLoader` (Loader that handles loading Backolon source code), `Module`, `Resolver`, `IndexResolver`, `BackolonVM`, `JSModule` (Interface for what a Javascript module needs to comply with
to be able to be imported), `JSONModule` (Interface for a JSON module object), `JSONSourceMap` (Not a sourcemap-V3 since there is only one file source and the mappings don't
have any concept of "compiled line/pos"), `OP_do_import`, `MODULE_NAME` (Special symbol identifier used to identify module names that can't be shadowed)
**plugin:** `default` ([ESBuild](https://esbuild)

## References

Load these on demand — do NOT read all at once:

- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/r47onfire/backolon)
- Author: dragoncoder047