import { Module } from "./module";
import { BackolonVM } from "./vm";

/**
 * Interface for what a Javascript module needs to comply with
 * to be able to be imported.
 */
export interface JSModule {
    setup(module: Module, query: URLSearchParams, vm: BackolonVM): Promise<void>;
}

/** Interface for a JSON module object */
export interface JSONModule {
    code: any[];
    sourceMap?: string;
}

/**
 * Not a sourcemap-V3 since there is only one file source and the mappings don't
 * have any concept of "compiled line/pos".
 */
export interface JSONSourceMap {
    contents: string;
    mappings: [start: number, end: number][];
}
