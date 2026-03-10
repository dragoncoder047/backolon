import { isArray } from "lib0/array";
import { Thing, ThingType, typecheck } from "../objects/thing";

export interface UnparseContext {
    pre(thing: Thing): string;
    join(thing: Thing, parts: string[]): string;
    post(thing: Thing): string;
}

const DEFAULT_UNPARSE_CONTEXT: UnparseContext = {
    pre: thing => thing.s0,
    join(thing, parts) {
        if (typecheck(ThingType.paramdescriptor)(thing) && isArray(thing.sj)) return parts.map((e, i) => e + (thing.sj[i] ?? "")).join("");
        if (typecheck(ThingType.map)(thing) && parts.length === 0) return ":"; // empty map = [:], vs empty list = []
        return parts.join(thing.sj);
    },
    post: thing => thing.s1
}

export function unparse(thing: Thing, context: UnparseContext = DEFAULT_UNPARSE_CONTEXT): string {
    return context.pre(thing) + context.join(thing, thing.c.map(c => unparse(c as any, context))) + context.post(thing);
}
