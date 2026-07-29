# Types & Enums

## doc

### `DocNode`
Documentation tree markup node

* i = italics
* b = bold
* p = paragraph
* c = inline code
* u = unordered list (bullets)
* o = ordered list (numbers)
* l = list item
* r = reference to another function/macro
```ts
string | ["i", ...DocNode[]] | ["b", ...DocNode[]] | ["p", ...DocNode[]] | ["c", ...DocNode[]] | ["u", ...DocNode[]] | ["o", ...DocNode[]] | ["l", index: number | null, ...DocNode[]] | ["r", code: string] | ["r", display: string, group: string | undefined, path: string]
```

### `DocMetadata`
Documentation metadata tags, from header
**Properties:**
- `tag: string`
- `type: string` (optional)
- `name: DocNode` (optional)
- `default: string` (optional)
- `flags: string[]` (optional)
- `groups: DocMetadata[]` (optional)
- `description: DocNode[]` (optional)

### `DocMetadataParser`
Metadata parser that takes the lines on and after the tag and parses it into a DocMetadata
```ts
(lines: string[], tag: string) => Omit<DocMetadata, "groups">
```

### `Doc`
Parsed documentation data for something (e.g. builtin function, lambda)
**Properties:**
- `meta: DocMetadata[]` — Rendered header data
- `body: DocNode[]` — Rendered body documentation data. each outer list is a single paragraph

### `HasDocstring`
interface for a thing that has a docstring.
**Properties:**
- `doc: string`

## continuation

### `Windable`
Data holding a dynamic wind enter/exit handler pair
**Properties:**
- `enter: any`
- `exit: any`

## dispatch

### `Arity`
Used to specify the number of arguments that a function can be called with.
A single number means min = max = that number, and null means min = 0, max = Infinity.
```ts
{ min: number; max: number } | number | null
```

### `LValue`
Represents a slot that can be assigned to

### `AccessType`
- `VARIABLE` = `0`
- `FUNCTION` = `1`
- `PROPERTY` = `2`

## errors

### `StackTreeNode`
Tree node representing a compressed stack trace
```ts
Readonly<{ leaf: false; count: number; children: StackTreeNode[]; hash: number } | { leaf: true; name: string; hash: number }>
```

## linked_list

### `Linked`
Generic immutable linked stack or queue node (no length tracking)
**Properties:**
- `value: T`
- `next: Linked<T> | null`

### `LinkedList`
Immutable linked list, including `null` which is the empty list
```ts
LinkedListNode<T> | null
```

### `LinkedListNode`
Generic immutable linked list node (with length tracking)
**Properties:**
- `lengthHere: number`
- `value: T`
- `next: LinkedListNode<T> | null`

## math

### `BinaryFun`
A function taking two arguments
```ts
(a: any, b: any) => any
```

## overload

### `Operation`
Name of an operation that can be done on two values.

(in reality any string can be used; this is just so that typescript autocomplete
works on the commonly used ones)
```ts
keyof Operations
```

### `Operations`
Table of operations that can be done to number-like quantities
**Properties:**
- `add: OverloadTable`
- `sub: OverloadTable`
- `div: OverloadTable`
- `mul: OverloadTable`
- `mulAlt: OverloadTable`
- `mod: OverloadTable`
- `cmp: OverloadTable`
- `pow: OverloadTable`
- `bitAnd: OverloadTable`
- `bitOr: OverloadTable`
- `bitXor: OverloadTable`
- `bitNot: OverloadTable`

### `Type`
thing that can be used to match a type of an object. null = wildcard, matches anything
```ts
((args: any[]) => any) | keyof TypeMap | null
```

### `TypeFor`
Determines the type of the object given the type
```ts
T extends keyof TypeMap ? TypeMap[T] : T
```

## vm

### `Command`
Data for the command
```ts
[opcode: string, immediateArgs: any[]]
```

### `OpcodeFunction`
Function that implements an opcode for the VM by pushing instructions or pushing and popping data.
```ts
(vm: T, args: any[]) => void
```

### `StackCount`
Generic immutable linked stack or queue node (no length tracking)
**Properties:**
- `count: number`
- `isTailCalled: boolean`
- `value: string`
- `next: StackCount | null`
