export class Importer {
    constructor(public lazyLoad = true) { }
}

export interface SourceTracker {
    readonly code: string;
    readonly tags: Record<number, string[]>;
}
