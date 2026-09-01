import { JebVM } from "@r47onfire/jeb";
import { installParserMachinery, Parser } from "../parser";
import { Importer, SourceTracker } from "./importer";
import { installModuleLoadMachinery, Module } from "./module";

export class BackolonVM extends JebVM {
    /** Current parser context - null if not parsing */
    parser: Parser | null = null;
    constructor(public importer: Importer = new Importer) {
        super();
        this.copyableState.push("parser" as any);
        installParserMachinery(this);
        installModuleLoadMachinery(this);
    }
    modules: Record<string, Module> = {};
    sources: Record<string, SourceTracker> = {};
}
