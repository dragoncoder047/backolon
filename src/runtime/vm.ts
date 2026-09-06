import { JebVM, pushCommand, pushData } from "@r47onfire/jeb";
import { Parser } from "../parser";
import { Span } from "../parser/span";
import { Importer, OP_do_import, SourceTracker } from "./importer";
import { Module, MODULE_NAME } from "./module";

interface BackolonVMState {
    moduleLoad: [string, parent: Module | null][];
    parser: Parser | null;
}

export class BackolonVM extends JebVM<BackolonVM> {
    /** Current parser context - null if not parsing */
    parser: Parser | null = null;
    constructor(public importer: Importer) {
        super();
    }
    override getState(): BackolonVMState {
        return {
            moduleLoad: Object.entries(this.modules ?? {}).map(({ 0: name, 1: mod }) => [name, mod.parent] as const),
            parser: this.parser,
        }
    }
    override restoreState(state: BackolonVMState) {
        state.moduleLoad.forEach(({ 0: name, 1: parent }) => this.modules[name]!.parent = parent);
        this.parser = state.parser;
    }
    /** Module cache */
    modules: Record<string, Module> = {};
    /** Mapping of URL to source tracker */
    sources: Record<string, SourceTracker> = {};
    /** Mapping of module name to a list of location IDs (for the JEB `at` identifier function) to the actual {@link Span} */
    maps: Record<string, Span[]> = {};
    /**
     * Starts running the main module
     * @param url URL of the main module
     */
    override start(url: URL) {
        pushCommand(this, OP_do_import, null, true);
        pushData(this, url);
    }
    override getCurrentFile() {
        return this.currentEnv.get(MODULE_NAME).or(undefined);
    }
    registerSpan(span: Span) {
        return (this.maps[span.file.href] ??= []).push(span) - 1;
    }
}
