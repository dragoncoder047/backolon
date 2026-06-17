const formatTrace = (file: URL, line: number, col: number, message: string, sources: Record<string, string>): string => {
    const src = sources[file.href];
    var lineInfo = "";
    if (src) {
        const lines = src.split("\n");
        const relevantLine = lines[line];
        if (relevantLine && col < relevantLine.length) {
            const lineNumberString = line + 1 + "";
            lineInfo = `\n${lineNumberString} | ${relevantLine}\n${" ".repeat(lineNumberString.length)} | ${" ".repeat(col)}^`;
        }
    }
    return `${file.href}:${line + 1}:${col + 1}: ${message}${lineInfo}`;
}

/**
 * Base class for Backolon parse and runtime errors.
 */
export class BackolonError extends Error {
    constructor(message: string, public readonly src: URL, public readonly line: number, public readonly col: number) {
        super(message);
    }
    [Symbol.toStringTag] = () => "BackolonError";
    displayOn(sources: Record<string, string>): string {
        return formatTrace(this.src, this.line, this.col, "error: " + this.message, sources) + "\n";
    }
}
