import { NativeModule, symbol_x } from ".";
import { matchPattern, RuntimeError } from "..";
import { mapGetKey, mapUpdateKeyMutating, newEmptyMap } from "../objects/map";
import { boxApply, boxList, boxNativeFunc, boxRoundBlock, boxSquareBlock, Thing, ThingType, typecheck, typeNameOf } from "../objects/thing";
import { p } from "../patterns/meta";
import { BUILTINS_LOC } from "../runtime/functor";

export function collections(mod: NativeModule) {
    const BUILTIN_LIST = boxNativeFunc("__builtin_list", BUILTINS_LOC);
    const BUILTIN_DICT = boxNativeFunc("__builtin_dict", BUILTINS_LOC);
    const BUILTIN_CONCAT = boxNativeFunc("__builtin_concat", BUILTINS_LOC);
    mod.defsyntax("[x:squareblock]", -1e50, false, null, "__rewrite_squareblock", (task, state) => {
        const arg = state.argv[0]! as Thing<ThingType.map>;
        const loc = arg.loc;
        const block = mapGetKey(arg, symbol_x)!;
        if (matchPattern(block.c, empty_list_pattern, false).length > 0) {
            task.out(boxApply(BUILTIN_LIST, [], loc));
            return;
        }
        if (matchPattern(block.c, empty_map_pattern, false).length > 0) {
            task.out(boxApply(BUILTIN_DICT, [], loc));
            return;
        }
        const split = matchPattern(block.c, split_on_comma, false)[0];
        if (!split) {
            throw new RuntimeError("Unknown error parsing collection literal", loc);
        }
        const first = split.bindings[0]![1];
        const rest = split.bindings[1]?.[1];
        const split2 = matchPattern(first as any[], split_on_colon, false)[0];
        var first_el;
        if (split2) {
            const key = split2.bindings[0]![1] as any[];
            const keyB = boxRoundBlock(key, key[0]!.loc);
            const value = split2.bindings[1]![1] as any[];
            const valueB = boxRoundBlock(value, value[0]!.loc);
            first_el = boxApply(BUILTIN_DICT, [keyB, valueB], valueB.loc);
        } else {
            const firstB = boxRoundBlock(first as any[], (first as any[])[0].loc);
            first_el = boxApply(BUILTIN_LIST, [firstB], firstB.loc);
        }
        if (rest) {
            const loc = (rest as any[])[0].loc;
            const restB = boxRoundBlock([boxSquareBlock(rest as any[], loc)], loc);
            task.out(boxApply(BUILTIN_CONCAT, [first_el, restB], restB.loc));
        } else {
            task.out(first_el);
        }
    });
    mod.defun("__builtin_list", "items...", (task, state) => {
        task.out(boxList(state.argv.slice(), state.value.loc));
    });
    mod.defun("__builtin_dict", "items...", (task, state) => {
        const loc = state.value.loc;
        const m = newEmptyMap(loc);
        const argv = state.argv;
        const len = argv.length;
        if ((len & 1) !== 0) throw new RuntimeError("odd number of arguments", loc);
        for (var i = 0; i < len; i += 2) {
            const key = argv[i]!;
            const value = argv[i + 1]!;
            mapUpdateKeyMutating(m, key, value, key.loc);
        }
        task.out(m);
    });
    mod.defun("__builtin_concat", "head:[list map] tail:[list map]", (task, state) => {
        const head = state.argv[0]! as Thing<ThingType.map> | Thing<ThingType.list>;
        const tail = state.argv[1]! as Thing<ThingType.map> | Thing<ThingType.list>;
        if (head.t !== tail.t) {
            throw new RuntimeError(`can only concatenate list+list or map+map, but got ${typeNameOf(head.t)}+${typeNameOf(tail.t)}`, tail.loc);
        }
        if (typecheck(ThingType.list)(head)) {
            task.out(boxList([...head.c, ...tail.c], head.loc));
        } else {
            const m2 = newEmptyMap(head.loc);
            for (var i = 0; i < head.c.length; i++) {
                mapUpdateKeyMutating(m2, head.c[i]!.c[0], head.c[i]!.c[1], state.value.loc);
            }
            for (i = 0; i < tail.c.length; i++) {
                mapUpdateKeyMutating(m2, tail.c[i]!.c[0]!, tail.c[i]!.c[1]!, state.value.loc);
            }
            task.out(m2);
        }
    });
}

const empty_list_pattern = p("[^] [$]");
const empty_map_pattern = p("[^] : [$]");
const split_on_comma = p("[^] x... {, y...|} [$]");
const split_on_colon = p("[^] x... : y... [$]");
