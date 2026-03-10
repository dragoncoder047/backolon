import { LocationTrace } from "../errors";
import { mapUpdateKeyMutating, newEmptyMap } from "../objects/map";
import { boxList, boxNumber, boxNameSymbol, CheckedType, isBlock, Thing, ThingType } from "../objects/thing";
import { parse } from "../parser/parse";
import { parsePattern } from "../patterns/meta";
import { newEnv } from "../runtime/env";
import { parseSignature } from "../runtime/functor";
import { NativeFunctionDetails } from "../runtime/scheduler";

export function define_native_handle(
    inEnv: Thing<ThingType.env> | null,
    inFuncs: Record<string, NativeFunctionDetails>,
    name: string,
    signature: string,
    body: NativeFunctionDetails["impl"],
    loc = BUILTINS_LOC,
) {
    inFuncs[name] = {
        params: parseSignature(parse(signature, loc.file).c),
        impl: body,
    };
    if (inEnv) {
        mapUpdateKeyMutating(inEnv.c[1], boxNameSymbol(name), new Thing(ThingType.nativefunc, [], name, "", "", "", loc));
    }
}

export function define_pattern(
    inEnv: Thing<ThingType.env>,
    inFuncs: Record<string, NativeFunctionDetails>,
    pattern: string,
    when: CheckedType<typeof isBlock>[],
    handlerName: string,
    handlerBody?: NativeFunctionDetails["impl"],
    loc = BUILTINS_LOC
) {
    if (handlerBody) {
        define_native_handle(inEnv, inFuncs, handlerName, "_:map", handlerBody, loc);
    }
    inEnv.c[2].c.push(new Thing(ThingType.triple, [
        parsePattern(parse(pattern, loc.file).c),
        new Thing(ThingType.nativefunc, [], handlerName, "", "", "", loc),
        boxList(when.map(m => boxNumber(m, loc)), loc),
    ], null, "", "", "", loc))
}

function createBuiltins(): { b: Thing<ThingType.env>, f: Record<string, NativeFunctionDetails> } {
    const builtinsEnv = newEnv(newEmptyMap(BUILTINS_LOC), boxList([], BUILTINS_LOC), BUILTINS_LOC);
    const builtinFunctions: Record<string, NativeFunctionDetails> = {};
    return { b: builtinsEnv, f: builtinFunctions };
}


const BUILTINS_LOC = new LocationTrace(0, 0, new URL("backolon:builtins"));
export const { b: BUILTIN_ENV, f: BUILTIN_FUNCTIONS } = createBuiltins();
