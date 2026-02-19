import { isMap } from "./map";
import { Thing, ThingType } from "./thing";

export interface UnparseContext {
    pre(thing: Thing): string;
    join(thing: Thing, parts: string[]): string;
    post(thing: Thing): string;
}

const DEFAULT_UNPARSE_CONTEXT: UnparseContext = {
    pre: thing => thing.srcPrefix,
    join(thing, parts) {
        if (isMap(thing) && parts.length === 0) return ":"; // empty map = [:], vs empty list = []
        return parts.join(thing.srcJoiner);
    },
    post: thing => thing.srcSuffix
}

export function unparse(thing: Thing, context: UnparseContext = DEFAULT_UNPARSE_CONTEXT): string {
    return context.pre(thing) + context.join(thing, thing.children.map(c => unparse(c, context))) + context.post(thing);
}
