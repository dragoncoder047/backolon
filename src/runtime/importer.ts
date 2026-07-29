export class Importer {
    constructor(public lazyLoad = true) { }
}

export interface SourceTracker {
    readonly src: Readonly<URL>;
    readonly code: string;
    readonly tags: Record<number, string[]>;
}
