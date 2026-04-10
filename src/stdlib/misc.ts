import { boxNil, ThingType, typecheck } from "../objects/thing";
import { DEFAULT_UNPARSER } from "../parser/unparse";
import { NativeModule } from "./module";

/**
 * @file
 * @module Builtins
 */

export function misc(mod: NativeModule) {
    /**
     * Prints values to whatever is configured as the print hook (usually stdout or similar)
     * @backolon
     * @category I/O
     * @function print
     * @param {any} values...
     * @returns {nil}
     * @example
     * ```backolon
     * print "hello" "," " world" "!"
     * ```
     */
    mod.defun("print", "values...", (task, state) => {
        if (!task.scheduler.printHook) {
            throw new Error("Can't use print without a print hook defined");
        }
        task.scheduler.printHook(state.argv.map(arg => typecheck(ThingType.string)(arg) ? arg.v : DEFAULT_UNPARSER.unparse(arg)).join(" "));
        task.out(boxNil());
    });
}
