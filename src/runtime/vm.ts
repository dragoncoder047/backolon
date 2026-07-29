import { Arithmetic, Command, JebVM } from "@r47onfire/jeb";
import { installParserMachinery, Parser } from "../parser";
import { SourceTracker } from "./importer";
import { BackolonContinuation } from "./continuation";
import { Importer } from "./importer";
import { installModuleLoadMachinery, Module } from "./module";

export class BackolonVM extends JebVM {
    /** Current parser context */
    parser: Parser | null = null;
    /** Current parser context */
    parentParser: Parser | null = null;
    constructor(public importer: Importer = new Importer, math?: Arithmetic) {
        super(math);
        installParserMachinery(this);
        installModuleLoadMachinery(this);
    }
    modules: Record<string, Module> = {};
    sources: Record<string, SourceTracker> = {};
    addModule(name: URL, source: Module) {
        this.modules[name.href] = source;
    }
    setMain(name: URL) {
        throw false;
    }
    // Overridden, to include the parser state.
    override cc(...extraOps: Command[]) {
        return new BackolonContinuation(this, extraOps);
    }
}
