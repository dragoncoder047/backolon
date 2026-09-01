import { Module } from "./module";
import { BackolonVM } from "./vm";

/**
 * Object whose job it is to download or open the file
 * and then load its contents into a module object.
 */
export abstract class Loader {
    /**
     * Returns undefined if this loader can't load the URL.
     * Returns itself or another loader that will load the
     */
    abstract get(url: URL): Loader | undefined;
    /**
     * Called when this loader has been selected to load the given URL
     * into the given {@link Module}. Should push opcodes to do so.
     */
    abstract load(url: URL, module: Module, vm: BackolonVM, asMain: boolean): void;
}
