# Types & Enums

## continuation

### `Windable`
**Properties:**
- `enter: any`
- `exit: any`

## doc

### `Doc`
**Properties:**
- `headerData: HeaderForm[]`
- `headers: DocNode[]`
- `body: DocNode[][]`

### `DocNode`
```ts
string | [DocNodeType, ...DocNode[]]
```

### `DocNodeType`
```ts
"i" | "b" | "p" | "code" | "ref"
```

### `HasDocstring`
**Properties:**
- `doc: string`

## linked_list

### `Linked`
**Properties:**
- `value: T`
- `next: Linked<T> | null`

### `LinkedList`
```ts
LinkedListNode<T> | null
```

## overload

### `Operation`
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
- `mod: OverloadTable`
- `cmp: OverloadTable`
- `pow: OverloadTable`
- `bitAnd: OverloadTable`
- `bitOr: OverloadTable`
- `bitXor: OverloadTable`
- `bitNot: OverloadTable`

## vm

### `Command`
```ts
[string, ...any[]]
```

### `OpcodeFunction`
```ts
(vm: T, args: any[]) => void
```

### `StackCount`
**Properties:**
- `count: number`
- `isTailCalled: boolean`
- `value: string`
- `next: StackCount | null`
