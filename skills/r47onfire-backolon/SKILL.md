---
description: homoiconic scripting language
license: AGPL-3.0-only
name: r47onfire-backolon
---

# @r47onfire/backolon

homoiconic scripting language

## Quick Reference

**errors:** `BackolonError` (An error from Backolon code that contains the location in the source that caused the error)
**runtime:** `Importer`, `Loader` (Object whose job it is to download or open the file
and then load its contents into a module object), `BackolonVM`, `SourceTracker`, `Module`
**parser:** `Parser`, `Parselet`, `Span` (Source location information for a token)
**plugin:** `default` ([ESBuild](https://esbuild)

## References

Load these on demand — do NOT read all at once:

- When using a class → read `references/classes.md` for properties, methods, and inheritance
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`

## Links

- [Repository](https://github.com/r47onfire/backolon)
- Author: dragoncoder047