
/**
 * Source location information for Backolon parsing and runtime errors.
 */
export class LocationTrace {
    constructor(
        public line: number,
        public col: number,
        public file: URL) { }

}
/**
 * A sentinel location representing an unknown source.
 */
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
    return `${trace.file}:${trace.line + 1}:${trace.col + 1}: ${message}${lineInfo}`;
}

/**
 * A single note or stack frame attached to a Backolon error.
 */
export class ErrorNote {
    constructor(public readonly message: string, public readonly loc: LocationTrace) {
    }
    format(onSources: Record<string, string>) {
        return formatTrace(this.loc, this.message, onSources);
    }
}

/**
 * Base class for Backolon parse and runtime errors.
 */
export class BackolonError extends Error {
    constructor(message: string, public trace: LocationTrace = UNKNOWN_LOCATION) {
        super(message);
        this.name = this.constructor.name;
    }
    displayOn(sources: Record<string, string>): string {
        return formatTrace(this.trace, "error: " + this.message, sources) + "\n";
    }
}

function indentFrame(frame: string, indent: string): string {
    return frame.split("\n").map(line => indent + line).join("\n");
}
