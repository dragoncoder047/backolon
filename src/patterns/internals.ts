import { imul } from "lib0/math";
import { map } from "lib0/object";
import { RuntimeError } from "../errors";
import { javaHash } from "../utils";
import { extractSymbolName, isValuePattern, Thing, ThingType, typecheck } from "../objects/thing";
import { rotate32 } from "../utils";


const x23 = (a: number, b: number) => imul((a + 0x1a2b3c4d) ^ b, rotate32(b, 23));

export class NFASubstate {
    public readonly _hash: number;
    constructor(
        /** start index */
        public readonly s: number,
        /** path state */
        public readonly p: readonly (readonly [Thing, number])[],
        /** binding spans */
        public readonly b: Record<string, readonly [number, number | null]> = {},
        /** complete */
        public readonly x: boolean = false,
        /** atomic binding names */
        public readonly ab: string[] = [],
        /** binding source symbols */
        public readonly bs: Record<string, Thing<ThingType.sym_name>> = {},
    ) {
        var hash = p.map(p => p[0].h! ^ rotate32(p[1], 19)).reduce(x23, 0) ^ rotate32(s, 22);
        hash ^= map(b, (val, key) => rotate32(javaHash(key) + val[0] ^ (val[1] ?? 0x12345678), 29)).reduce(x23, 0);
        this._hash = hash;
    }

    a(input: Thing | null, inputIndex: number, isAtEnd: boolean): NFASubstate[] {
        // Handle atomic commands (no children)
        const { _thing: cmd, _index: pIndex } = this.c(1);
        const { _thing: cmd2, _index: pIndex2 } = this.c(2);
        const nonPatternError = (src: Thing): never => {
            throw new RuntimeError("Non-pattern in pattern!!", src.loc);
        }
        if (cmd === null) {
            // We fell off the end of the group. Go back up one.
            if (this.p.length === 1) {
                // No parent = we're done.
                return [
                    this.d(),
                ];
            }
            const exit = () => this.u(1, null, pIndex2 + 1);
            const loop = () => this.u(0, null, 0);
            switch (cmd2!.t) {
                case ThingType.pat_opt:
                case ThingType.pat_seq:
                case ThingType.pat_alt:
                    return [exit()];
                case ThingType.pat_rep:
                    return cmd2!.v ? [
                        // Greedy
                        loop(),
                        exit(),
                    ] : [
                        // Not greedy
                        exit(),
                        loop(),
                    ];
                case ThingType.pat_group:
                    return [
                        this.u(1, null, pIndex2 + 1, cmd2!.c[0]! as any, inputIndex, true),
                    ]
                case ThingType.pat_anchor:
                case ThingType.pat_m_val:
                case ThingType.pat_m_type:
                    throw new RuntimeError("Atomic command reached compound command exit code!!", cmd2!.loc);
                default:
                    nonPatternError(cmd2!);
                    throw 1; // TS is stupid
            }
        }
        const next = () => (
            cmd2 !== null && typecheck(ThingType.pat_alt)(cmd2)
                ? this.u(1, null, pIndex2 + 1) // Alternatives jump out always
                : this.u(0, null, pIndex + 1) // otherwise just go to the next one
        );
        const enter = () => this.u(0, cmd, 0);
        const firstChild = cmd.c[0]!;
        const secondChild = cmd.c[1]!;
        switch (cmd.t) {
            case ThingType.pat_opt:
                return cmd.v ? [enter(), next()] : [next(), enter()];
            case ThingType.pat_seq:
            case ThingType.pat_rep:
                return [enter()];
            case ThingType.pat_alt:
                return cmd.c.map((_, i) =>
                    this.u(0, cmd, i));
            case ThingType.pat_anchor:
                return (cmd.v ? (inputIndex === 0) : isAtEnd) ? [next()] : [];
            case ThingType.pat_group:
                return [this.u(0, cmd, 1, firstChild as any, inputIndex, false, cmd.c.length === 2 && isValuePattern(secondChild))];
            case ThingType.pat_m_val:
                if (input === null) return [this];
                if (!typecheck(firstChild.t as ThingType)(input) || input.h !== firstChild.h) return [];
                return [next()];
            case ThingType.pat_m_type:
                if (input === null) return [this];
                if (!typecheck(cmd.v as ThingType)(input)) return [];
                return [next()];
            default:
                nonPatternError(cmd);
                throw 1; // Typescript is stupid
        }
    }
    c(index: number): { _thing: Thing | null, _index: number } {
        const cur = this.p.at(-index)!;
        return { _thing: cur?.[0].c[cur?.[1]] ?? null, _index: cur?.[1] };
    }

    u(popElements: number, push: Thing | null, newIndex: number, binding: Thing<ThingType.sym_name> | null = null, bindingIndex = 0, bindingIsSecond = false, newAtomic = false): NFASubstate {
        const newPath = this.p.slice();
        for (; popElements > 0; popElements--) newPath.pop();
        if (push) newPath.push([push, newIndex]);
        else newPath.push(newPath.pop()!.with(1, newIndex) as [Thing, number]);
        var bindings = this.b;
        var sources = this.bs;
        var atomics = this.ab;
        if (binding) {
            const name = extractSymbolName(binding);
            bindings = { ...bindings };
            if (bindingIsSecond) {
                bindings[name] = bindings[name]!.with(1, bindingIndex) as any;
            } else {
                sources = { ...sources };
                bindings[name] = [bindingIndex, null];
                sources[name] = binding;
            }
            if (newAtomic) {
                atomics = atomics.toSpliced(Infinity, 0, name!);
            }
        }
        return new NFASubstate(this.s, newPath, bindings, false, atomics, sources);
    }
    d(): NFASubstate {
        return new NFASubstate(this.s, [], this.b, true, this.ab, this.bs);
    }
}
