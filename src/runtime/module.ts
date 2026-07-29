import { EnvVarLValue, LinkedList, llPopN, llPushArray } from "@r47onfire/jeb";
import { Parselet, parseletComparator } from "../parser/parselet";
import { BackolonVM } from "./vm";

export const enum ModuleLoadState {
    UNLOADED,
    LOADING,
    LOADED,
}

export abstract class Module {
    /** The saved parselets list at the end of the module body. */
    parselets: LinkedList<Parselet> = null;
    /** The named exports for the module */
    exports: Record<string, EnvVarLValue> = {};
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
        // Ensure they're sorted
        this.parselets = llPushArray(null, llPopN(this.parselets, Infinity)[0].sort(parseletComparator));
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
