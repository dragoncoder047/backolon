import { javaHash } from "./utils";

export class LocationTrace {
    constructor(
        public line: number,
        public col: number,
        public file: URL,
        public source: [string, LocationTrace] | null = null) { }

}
export const UNKNOWN_LOCATION = new LocationTrace(0, 0, new URL("about:unknown"));
function formatTrace(trace: LocationTrace, message: string, sources: Record<string, string>): string {
    const src = sources[trace.file.href];
    var lineInfo = "";
    if (src) {
        const lines = src.split("\n");
        const relevantLine = lines[trace.line] || "";
        const lineNumberString = trace.line + 1 + "";
        lineInfo = `\n${lineNumberString} | ${relevantLine}\n${" ".repeat(lineNumberString.length)} | ${" ".repeat(trace.col)}^`;
    }
    return `${trace.file}:${trace.line + 1}:${trace.col + 1}: ${message}${lineInfo}${trace.source ? "\n" + formatTrace(trace.source[1], trace.source[0], sources) : ""}`;
}

export class ErrorNote {
    constructor(public message: string, public loc: LocationTrace) { }
}

export class BackolonError extends Error {
    constructor(message: string, public trace: LocationTrace = UNKNOWN_LOCATION, public notes: ErrorNote[] = []) {
        super(message);
        this.name = this.constructor.name;
    }
    displayOn(sources: Record<string, string>): string {
        return formatTrace(this.trace, "error: " + this.message, sources) + compressTraceback(this.notes.map(note => "\n" + formatTrace(note.loc, note.message, sources))) + "\n";
    }
    addNote(message: string, loc: LocationTrace) {
        this.notes.push(new ErrorNote(message, loc));
    }
}

export class ParseError extends BackolonError { }
export class RuntimeError extends BackolonError { }

function compressTraceback(lines: string[], minRep = 10): string {
    for (; ;) {
        const hashes = lines.map(line => javaHash(line));
        const best = findBestRepeat(lines, hashes, minRep);
        if (!best) return lines.join("");

        const start = best[0], size = best[1], count = best[2];
        lines = [
            ...lines.slice(0, start),
            "\n:",
            ...lines.slice(start, start + size).map(indentFrame),
            formatRepeatSummary(size, count),
            "\n:",
            ...lines.slice(start + size * count)
        ];
    }
}

function findBestRepeat(lines: string[], hashes: number[], minRep: number): [start: number, size: number, count: number] | null {
    const n = lines.length;
    var best: [start: number, size: number, count: number] | null = null;
    var bestSavings = 0;
    var bestAll = 0;

    for (var start = 0; start < n - 1; start++) {
        for (var size = 1; start + size * 2 <= n; size++) {
            const maxRepeats = Math.floor((n - start) / size);
            var count = 1;
            while (count + 1 <= maxRepeats && memcmp_blocks(lines, hashes, start, start + count * size, size)) {
                count += 1;
            }
            if (count < 2) continue;
            const totalStrings = count * size;
            if (totalStrings <= minRep) continue;

            const savings = totalStrings - (size + 1);
            if (savings > bestSavings || (savings === bestSavings && totalStrings > bestAll)) {
                bestSavings = savings;
                bestAll = totalStrings;
                best = [start, size, count];
            }
        }
    }

    return best;
}

function memcmp_blocks(lines: string[], hashes: number[], a: number, b: number, size: number): boolean {
    for (var k = 0; k < size; k++) {
        if (hashes[a + k] !== hashes[b + k] || lines[a + k] !== lines[b + k]) return false;
    }
    return true;
}

function indentFrame(frame: string): string {
    return frame.replace(/\n/g, "\n: ");
}

function formatRepeatSummary(size: number, count: number): string {
    const countPlural = size > 1 ? `${size} frames` : "frame";
    const timesPlural = count > 1 ? "s" : "";
    return `\n:--> previous ${countPlural} repeated ${count} time${timesPlural}`;
}

