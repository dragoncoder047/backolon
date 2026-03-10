import { last } from "lib0/array";
import { stringify } from "lib0/json";
import { RuntimeError } from "../errors";
import { mapUpdateKeyMutating, newEmptyMap } from "../objects/map";
import { boxNil, boxNumber, isSymbol, Thing, ThingType, typecheck } from "../objects/thing";
import { parse } from "../parser/parse";
import { unparse } from "../parser/unparse";
import { metapattern_location, nonoverlappingreplace, parsePattern, removed_whitespace, typeNameToThingType } from "../patterns/meta";
import { type Scheduler } from "./scheduler";


function parameterInfo<T>(scheduler: Scheduler, fn: Thing, index: number, getter: (name: Thing<ThingType.name> | undefined, lazy: boolean, default_?: Thing, type?: ThingType) => T): T {
    var descriptor: Thing<ThingType.paramdescriptor> | Thing<ThingType.name>;
    if (typecheck(ThingType.func)(fn)) {
        descriptor = (fn.c[0].c as Thing<ThingType.paramdescriptor | ThingType.name>[])[index]! as any;
    }
    else if (typecheck(ThingType.nativefunc)(fn)) {
        descriptor = scheduler.getParamDescriptor(fn.v, index);
    }
    else if (typecheck(ThingType.boundmethod)(fn)) {
        return parameterInfo(scheduler, fn.c[1], index, getter);
    }
    else {
        return getter(undefined, true);
    }
    if (isSymbol(descriptor)) return getter(descriptor as any, false);
    return getter(descriptor.c[0] as any, descriptor.v as boolean, descriptor.c[2], descriptor.c[1].v ?? undefined);
}

export function isLazyParamIndex(scheduler: Scheduler, fn: Thing, index: number): boolean {
    return parameterInfo(scheduler, fn, index, (_, l) => l);
}

export function getParamName(scheduler: Scheduler, fn: Thing, index: number): Thing<ThingType.name> {
    return parameterInfo(scheduler, fn, index, x => x)!;
}

export function wrapImplicitBlock(obj: Thing, env: Thing<ThingType.env | ThingType.nil>) {
    return new Thing(ThingType.implicitfunc, [obj], env, "", "", "", obj.loc);
}

export function checkargs(min: number, max: number, argv: Thing[], f: Thing) {
    const len = argv.length;
    if (len < min) {
        throw new RuntimeError(`not enough arguments to function call (minimum is ${min})`, (last(argv) ?? f).loc);
    }
    if (len > max) {
        throw new RuntimeError(`too many arguments to function call (max is ${max})`, argv[max]!.loc);
    }
}

export function parametersToVars(paramsDef: Thing<ThingType.roundblock>, realArgs: Thing[], callsite: Thing): Thing<ThingType.map> {
    const bits = paramsDef.c;
    const firstOpt = bits.findIndex(e => typecheck(ThingType.paramdescriptor)(e) && e.c[2] !== undefined);
    checkargs(firstOpt, bits.length, realArgs, callsite);
    const map = newEmptyMap(callsite.loc);
    for (var i = 0; i < bits.length; i++) {
        const item = bits[i]! as Thing<ThingType.name> | Thing<ThingType.paramdescriptor>;
        const { a: name, b: default_, c: type } =
            isSymbol(item) ? {
                a: item,
                b: null,
                c: [],
            } : {
                a: item.c[0]!,
                b: item.c[2]!,
                c: item.c[1]!.c.map(c => (c as Thing<ThingType.number>).v),
            };
        const arg = realArgs[i]!;
        if (arg === undefined && default_ !== null) {
            mapUpdateKeyMutating(map, name, default_);
            continue;
        }
        if (type.length > 0 && !typecheck(...type)(arg)) {
            throw new RuntimeError(`Wrong type to argument ${i} of function call`, arg.loc);
        }
        mapUpdateKeyMutating(map, name, arg);
    }
    return map;
}

export function parseSignature(block: readonly Thing[]): (Thing<ThingType.name> | Thing<ThingType.paramdescriptor>)[] {
    const result: any[] = [];
    for (var item of nonoverlappingreplace(block, signaturePattern, match => {
        var items = removed_whitespace(match) as any[];
        var lazy = false, lazystr = "";
        if (typecheck(ThingType.operator)(items[0]!)) {
            lazy = true;
            lazystr = "@";
            items = items.toSpliced(0, 1);
        }
        const loc = items[0].loc;
        const to_type = (item: Thing) => boxNumber(typeNameToThingType(item.v, item.loc), item.loc, item.v);
        const nil = boxNil(loc);
        switch (items.length) {
            case 1:
                result.push(lazy
                    ? new Thing(ThingType.paramdescriptor, [items[0], nil, nil], lazy, lazystr, "", "", loc)
                    : items[0]);
                break;
            case 5:
                result.push(new Thing(ThingType.paramdescriptor, [items[0], to_type(items[2]), items[4]], lazy, lazystr, "", [":", "="] as any, loc));
                break;
            case 3:
                const isType = items[1].v === ":";
                result.push(
                    isType
                        ? new Thing(ThingType.paramdescriptor, [items[0], to_type(items[2]), nil], lazy, lazystr, "", ":", loc)
                        : new Thing(ThingType.paramdescriptor, [items[0], nil, items[2]], lazy, lazystr, "", "=", loc)
                )
                break;
            default:
                throw "unreachable";
        }
        return [];
    })) {
        throw new RuntimeError(`unexpected ${stringify(unparse(item).slice(0, 20))}`, item.loc);
    }
    return result;
}

const signaturePattern = parsePattern(parse("{[=@]|}[p:name]{ [=:] [t:name]|}{ [==] d|} ", metapattern_location.file).c);
