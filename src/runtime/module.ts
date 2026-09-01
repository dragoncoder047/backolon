import { VariableReference } from "@r47onfire/jeb";
import { Parselet } from "../parser/parselet";
import { Constraint } from "../parser/sort";
import { BackolonVM } from "./vm";

export const enum ModuleLoadState {
    UNLOADED,
    LOADING,
    LOADED,
}

export abstract class Module {
    /** The saved parselets list at the end of the module body. */
    parselets: Parselet[] = [];
    constraints: Constraint<Parselet>[] = [];
    /** The named exports for the module */
    exports: Record<string, VariableReference> = {};
    /**
     * This is used to detect and throw a "circular import!" error when
     * attempting to do something (access properties, etc) of a module
     * when it's not finished loading, as well as to avoid calling {@link load}
     * when the module is already loaded.
     */
    abstract readonly loadState: ModuleLoadState;
    /**
     * Should install the opcodes to load and/or execute the module code to initialize the module.
     * The stack should remain unchanged after this.
     *
     * Will only be called if {@link loadState} is {@link ModuleLoadState.UNLOADED|UNLOADED}.
     */
    abstract load(vm: BackolonVM): void;
}

export class NativeModule extends Module {
    /** Native modules are always loaded, since they don't have to call into Backolon code to load */
    readonly loadState = ModuleLoadState.LOADED;
    /** Does nothing, since native modules are always loaded. */
    load() { }
    constructor(init: (m: NativeModule) => void) {
        super();
        init(this);
    }
}

export const installModuleLoadMachinery = (vm: BackolonVM) => {
    /*
    Need opcodes:
    * begin module
    * save parser
    * reset parser
    * end module
    * install-module-parselets
    */
}
