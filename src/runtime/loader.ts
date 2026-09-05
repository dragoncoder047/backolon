import { Continuation, JEBStateError, OP_apply, OP_eval, OP_set_env, pushCommand, pushData } from "@r47onfire/jeb";
import { Span } from "../parser/span";
import { Importer, SourceTracker } from "./importer";
import { JSONModule, JSONSourceMap } from "./jsmod";
import { Module } from "./module";
import { BackolonVM } from "./vm";

/**
 * Object whose job it is to download or open the file
 * and then load its contents into a module object.
 */
export abstract class Loader {
    /**
     * Returns undefined if this loader can't load the URL.
     * Returns itself or another loader that will load the module
     * via its {@link load} implementation.
     */
    abstract match(url: URL): Loader | undefined;
    /**
     * Called when this loader has been selected to load the given URL
     * into the given {@link Module}. Should push opcodes to do so.
     */
    abstract load(vm: BackolonVM, url: URL, module: Module, importer: Importer): Promise<void>;
}

/**
 * Loader that handles loading the Javascript modules via `import()`.
 */
export class JavascriptModuleLoader extends Loader {
    match(url: URL): Loader | undefined {
        if (url.pathname.endsWith(".js")) return this;
    }
    async load(vm: BackolonVM, url: URL, module: Module, importer: Importer) {
        await (await importer.getImport(url)).setup(module, url.searchParams, vm);
    }
}

/**
 * Loader that handles loading compiled / pre-parsed JSON modules
 */
export class JSONModuleLoader extends Loader {
    match(url: URL): Loader | undefined {
        if (url.pathname.endsWith(".bk.json")) return this;
    }
    async load(vm: BackolonVM, url: URL, module: Module, importer: Importer) {
        const { code, sourceMap } = await importer.getJSON(url) as JSONModule;
        pushCommand(vm as any, OP_set_env, vm.currentEnv);
        pushCommand(vm as any, OP_eval, undefined);
        pushData(vm, code);
        vm.currentEnv = module.global;
        if (sourceMap) {
            (importer.getJSON(new URL(sourceMap, url)) as Promise<JSONSourceMap>).then(({ mappings, contents }) => {
                vm.maps[url.href] = mappings.map(({ 0: start, 1: end }) => new Span(url, start, end));
                vm.sources[url.href] = new SourceTracker(url, contents, {});
            });
        }
    }
}

/**
 * Loader that handles loading Backolon source code
 */
export class BackolonSourceModuleLoader extends Loader {
    match(url: URL): Loader | undefined {
        if (url.pathname.endsWith(".bk")) return this;
    }
    async load(vm: BackolonVM, url: URL, module: Module, importer: Importer) {
        const text = await importer.getText(url);
        pushData(vm, new Continuation(vm, []));
        pushCommand(vm, OP_apply, [module], undefined, true, true);
        throw new Error("need to load " + JSON.stringify(text));
    }
}
