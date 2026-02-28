import { imul } from "lib0/math";
import { RuntimeError } from "../errors";
import { extractSymbolName, isValuePattern, Thing, ThingType } from "../objects/thing";
import { rotate32 } from "../utils";


const x23 = (a: number, b: number) => imul((a + 0x1a2b3c4d) ^ b, rotate32(b, 23));

export class NFASubstate<T> {
    public readonly _hash: number;
    constructor(
        public readonly _startIndex: number,
        public readonly _data: T,
        public readonly _path: readonly (readonly [Thing, number])[],
        public readonly _bindingSpans: Record<string, readonly [number, number | null]> = {},
        public readonly _complete: boolean = false,
        public readonly _atomicBindings: string[] = [],
    ) {
        var hash = _path.map(p => p[0].hash! ^ rotate32(p[1], 19)).reduce(x23, 0) ^ rotate32(_startIndex, 22);
        // Uncomment if backreferences are added
        // hash ^= Object.entries(bindings).map(b => rotate32(javaHash(b[0]) + b[1][0] ^ (b[1][1] ?? 0x12345678), 29)).reduce(x23, 0);
        this._hash = hash;
    }

    _step(input: Thing | null, inputIndex: number, isAtEnd: boolean): NFASubstate<T>[] {
        // Handle atomic commands (no children)
        const { _thing: cmd, _index: pIndex } = this._current(1);
        const { _thing: cmd2, _index: pIndex2 } = this._current(2);
        if (cmd === null) {
            // We fell off the end of the group. Go back up one.
            if (this._path.length === 1) {
                // No parent = we're done.
                return [
                    this._toCompleted(),
                ];
            }
            const exit = () => this._toUpdated(1, null, pIndex2 + 1);
            const loop = () => this._toUpdated(0, null, 0);
            switch (cmd2!.type) {
                case ThingType.pattern_optional:
                case ThingType.pattern_sequence:
                case ThingType.pattern_alternatives:
                    return [exit()];
                case ThingType.pattern_repeat:
                    return cmd2!.value ? [
                        // Greedy
                        loop(),
                        exit(),
                    ] : [
                        // Not greedy
                        exit(),
                        loop(),
                    ];
                case ThingType.pattern_capture:
                    return [
                        this._toUpdated(1, null, pIndex2 + 1, extractSymbolName(cmd2!.children[0]!), inputIndex, true),
                    ]
                case ThingType.pattern_anchor:
                case ThingType.pattern_match_value:
                case ThingType.pattern_match_type:
                    throw new RuntimeError("Atomic command reached compound command exit code!!", cmd2!.srcLocation);
                default:
                    throw new RuntimeError("Non-pattern in pattern!!", cmd2!.srcLocation);
            }
        }
        const next = () => (
            cmd2 !== null && cmd2.type === ThingType.pattern_alternatives
                ? this._toUpdated(1, null, pIndex2 + 1) // Alternatives jump out always
                : this._toUpdated(0, null, pIndex + 1) // otherwise just go to the next one
        );
        const enter = () => this._toUpdated(0, cmd, 0);
        const firstChild = cmd.children[0]!;
        const secondChild = cmd.children[1]!;
        switch (cmd.type) {
            case ThingType.pattern_optional:
                return cmd.value ? [enter(), next()] : [next(), enter()];
            case ThingType.pattern_sequence:
            case ThingType.pattern_repeat:
                return [enter()];
            case ThingType.pattern_alternatives:
                return cmd.children.map((_, i) =>
                    this._toUpdated(0, cmd, i));
            case ThingType.pattern_anchor:
                return (cmd.value ? (inputIndex === 0) : isAtEnd) ? [next()] : [];
            case ThingType.pattern_capture:
                return [this._toUpdated(0, cmd, 1, extractSymbolName(firstChild), inputIndex, false, cmd.children.length === 2 && isValuePattern(secondChild.type))];
            case ThingType.pattern_match_value:
                if (input === null) return [this];
                if (input.type !== firstChild.type || input.hash !== firstChild.hash) return [];
                return [next()];
            case ThingType.pattern_match_type:
                if (input === null) return [this];
                if (input.type !== cmd.value) return [];
                return [next()];
            default:
                throw new RuntimeError("Non-pattern in pattern!!", cmd.srcLocation);
        }
    }
    _current(index: number): { _thing: Thing | null, _index: number } {
        const cur = this._path.at(-index)!;
        return { _thing: cur?.[0].children[cur?.[1]] ?? null, _index: cur?.[1] };
    }

    _toUpdated(popElements: number, push: Thing | null, newIndex: number, binding: string | null = null, bindingIndex = 0, bindingIsSecond = false, newAtomic = false): NFASubstate<T> {
        const newPath = this._path.slice();
        for (; popElements > 0; popElements--) newPath.pop();
        if (push) newPath.push([push, newIndex]);
        else newPath.push(newPath.pop()!.with(1, newIndex) as [Thing, number]);
        var bindings = this._bindingSpans;
        if (binding) {
            bindings = { ...bindings };
            if (bindingIsSecond) {
                bindings[binding] = bindings[binding]!.with(1, bindingIndex) as any;
            } else {
                bindings[binding] = [bindingIndex, null];
            }
        }
        var atomics = this._atomicBindings;
        if (newAtomic) {
            atomics = atomics.toSpliced(Infinity, 0, binding!);
        }
        return new NFASubstate(this._startIndex, this._data, newPath, bindings, false, atomics);
    }
    _toCompleted(): NFASubstate<T> {
        return new NFASubstate(this._startIndex, this._data, [], this._bindingSpans, true, this._atomicBindings);
    }
}
