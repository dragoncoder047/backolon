import { Env, VariableReference } from "@r47onfire/jeb";
import { Parselet } from "../parser/parselet";
import { Constraint } from "../parser/sort";

export class Module {
    /** The saved parselets list at the end of the module body. */
    parselets: Parselet[] = [];
    constraints: Constraint<Parselet>[] = [];
    /** The named exports for the module */
    exports: Record<string, VariableReference> = {};
    /**
     * This is used to detect and throw a "circular import!" error when
     * attempting to do something (access properties, etc) of a module
     * when it's not finished loading, as well as to avoid loading it when
     * it's already loaded
     */
    parent: Module | null;
    constructor(public global: Env, public id: URL, parent: Module | null) {
        this.parent = parent;
    }
}

/**
 * Special symbol identifier used to identify module names that can't be shadowed.
 */
export const MODULE_NAME = Symbol("__name__");

