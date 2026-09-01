import { isinstance } from "@r47onfire/game-math";
import { JEBError, JEBStateError, JEBTypeError, makeOpcode, peekData, popData, pushData } from "@r47onfire/jeb";
import { BackolonError } from "../errors";
import { Loader } from "./loader";
import { Module } from "./module";
import { BackolonVM } from "./vm";

export class Importer {
    constructor(
        public loaders: Loader[],
    ) { }
    /**
     * Pushes the required opcodes to the stack to load the module at the
     * given URL and leave the {@link Module} on the stack.
     */
    loadModule(vm: BackolonVM, parent: Module | null, url: URL, asMain: boolean) {
        const m = vm.modules[url.href];
        if (m) {
            if (asMain) {
                throw new JEBStateError("tried to run already-imported module as main");
            }
            if (m.parent) {
                // TODO: use error notes with cycle participants
                var m2: Module | null | boolean = parent, culprits: string[] = [];
                while (isinstance(m2, Module) && m2 !== m) {
                    culprits.push(m2.id.href);
                    m2 = m2.parent;
                }
                throw new JEBStateError(`circular import of module ${url.href} (<- ${culprits.join(" <- ")})`);
            }
            pushData(vm, m);
            return;
        }
        for (var loader of this.loaders) {
            const g = loader.get(url);
            if (g) {
                const module = vm.modules[url.href] = new Module(url, parent);
                vm.pushCommand(OP_cleanup_module, url);
                g.load(url, module, vm, asMain);
                return;
            }
        }
        throw new JEBTypeError(`don't know how to load module from ${url.href}`);
    }
}

export interface SourceTracker {
    readonly src: Readonly<URL>;
    readonly code: string;
    readonly tags: Record<number, string[]>;
}

export const OP_do_import = makeOpcode((vm: BackolonVM, { 0: parent, 1: asMain }: [parent: Module | null, main?: boolean]) => {
    const url = popData(vm);
    if (!isinstance(url, URL)) {
        throw new BackolonError("Module import source must be an absolute URL");
    }
    vm.importer.loadModule(vm, parent, url, asMain ?? false);
}, null);

const OP_cleanup_module = makeOpcode((vm, { 0: url }: [URL]) => {
    const module = peekData(vm);
    if (!isinstance(module, Module)) {
        throw new JEBError(`Loader didn't properly load ${url.href}!!`)
    }
    module.parent = null;
}, null);
