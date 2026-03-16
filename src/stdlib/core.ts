import { stringify } from "lib0/json";
import { define_builtin_function, define_builtin_variable, define_pattern } from ".";
import { ErrorNote, LocationTrace, RuntimeError } from "../errors";
import { mapGetKey, mapUpdateKeyMutating } from "../objects/map";
import { boxApply, boxNameSymbol, boxNativeFunc, boxNil, boxNumber, boxRoundBlock, Thing, ThingType, typecheck, typeNameOf } from "../objects/thing";
import { unparse } from "../parser/unparse";
import { removed_whitespace } from "../patterns/meta";
import { NativeFunctionDetails } from "../runtime/scheduler";
import type { StackEntry, Task } from "../runtime/task";

const x = boxNameSymbol("x"), y = boxNameSymbol("y");

export function initCoreSyntax(env: Thing<ThingType.env>, functions: Record<string, NativeFunctionDetails>) {
    define_builtin_variable(env, "nil", boxNil());
    define_builtin_variable(env, "false", boxNumber(0, undefined, "false"));
    define_builtin_variable(env, "true", boxNumber(1, undefined, "true"));
    const STANDARD_BLOCKS = [ThingType.roundblock, ThingType.topblock] as any;
    // MARK: blocks and logical lines
    define_pattern(env, functions, "[^]{x...|}  {\n|;}  {y...|}[$]", Infinity, false, STANDARD_BLOCKS, "__rewrite_sequence", (task, state) => {
        const groups: Thing<ThingType.map> = state.argv[0]! as any;
        var first = mapGetKey(groups, x);
        var second = mapGetKey(groups, y);
        if (first) {
            first = boxRoundBlock(first.c!, first.loc);
            if (second) {
                second = boxRoundBlock(second.c!, second.loc);
                task.out(boxApply(boxNativeFunc("__sequence", first.loc), second ? [first, second] : [first], first.loc));
            } else {
                // effectively just strip the trailing line terminator
                task.out(first);
            }
        } else {
            // we get here if there are a sequence of consecutive newlines or semicolons.
            task.out(boxNil(groups.loc));
        }
    });
    define_builtin_function(env, functions, "__sequence", "@first @rest", (task, state) => {
        const first = state.argv[0]!;
        const second = state.argv[1]!;
        task.updateCookie(1, 0);
        if (state.index === 0) {
            task.enter(boxApply(first, [], first.loc), state.env);
        } else if (second) {
            task.out(); // tail call
            task.enter(boxApply(second, [], second.loc), state.env);
        }
    });
    // MARK: Apply
    // This MUST be lowest (last) precedence otherwise it will override everything else!
    define_pattern(env, functions, "[^]x  y...[$]", Infinity, false, STANDARD_BLOCKS, "__rewrite_apply", (task, state) => {
        const groups: Thing<ThingType.map> = state.argv[0]! as any;
        const fun = mapGetKey(groups, x)!;
        const args = removed_whitespace(mapGetKey(groups, y)!.c);
        task.out(boxApply(fun, args, fun.loc));
    });
    // MARK: variable management
    define_pattern(env, functions, "[=let] x {= y|}", -1000, false, STANDARD_BLOCKS, "__rewrite_declaration", (task, state) => {
        const groups: Thing<ThingType.map> = state.argv[0]! as any;
        const name = mapGetKey(groups, x)!;
        const value = mapGetKey(groups, y);
        task.out(boxApply(boxNativeFunc("__declare", state.value.loc), value ? [name, value] : [name], state.value.loc));
    });
    const binding_helper = (cb: (state: StackEntry, name: Thing<ThingType.name>, initialValue: Thing, loc: LocationTrace) => void): ((task: Task, state: StackEntry) => void) => {
        return (task, state) => {
            const name = state.argv[0]!;
            const initialValue = state.argv[1]!;
            const loc = name.loc;
            if (!typecheck(ThingType.name)(name)) {
                throw new RuntimeError(`cannot assign to ${typeNameOf(name.t)}`, loc);
            }
            task.out(initialValue);
            task.dip(1, state => cb(state, name, initialValue, loc));
        }
    }
    define_builtin_function(env, functions, "__declare", "@name! value=nil", binding_helper((state, name, initialValue, loc) => {
        if (mapGetKey(state.env.c[1]!, name) !== undefined) {
            throw new RuntimeError(`variable ${name.v} already exists in this scope`, loc);
        }
        mapUpdateKeyMutating(state.env.c[1]!, name, initialValue);
    }));
    define_pattern(env, functions, "x = y", -1000, true, STANDARD_BLOCKS, "__rewrite_assign", (task, state) => {
        const groups: Thing<ThingType.map> = state.argv[0]! as any;
        const name = mapGetKey(groups, x)!;
        const value = mapGetKey(groups, y)!;
        task.out(boxApply(boxNativeFunc("__assign", state.value.loc), [name, value], state.value.loc));
    });
    define_builtin_function(env, functions, "__assign", "@name! value", binding_helper((state, name, value, loc) => {
        for (var env = state.env; env && typecheck(ThingType.env)(env); env = env.c[0]) {
            const vars = env.c[1];
            if (mapGetKey(vars, name, loc) !== undefined) {
                mapUpdateKeyMutating(vars, name, value, loc);
                return;
            }
        }
        throw new RuntimeError(`undefined: ${stringify(name.v)}`, loc, [new ErrorNote(`note: add "let" to declare ${stringify(name.v)} to be in this scope`, loc)]);
    }));
    // MARK: builtin function names
    define_builtin_function(env, functions, "print", "values...", (task, state) => {
        console.log(state.argv.map(arg => typecheck(ThingType.string)(arg) ? arg.v : unparse(arg)).join(" "));
        task.out(boxNil());
    });
}
