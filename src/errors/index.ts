import { max } from "lib0/math";

/**
 * Source location information for Backolon errors.
 */
export class Span {
    constructor(
        public readonly file: Readonly<URL>,
        public readonly start: number,
        public readonly end: number) { }

}
/**
 * A sentinel location representing an unknown source.
 */
export const UNKNOWN_LOCATION = new Span(new URL("about:unknown"), 0, 0);


const formatTrace = (loc: Span, message: string, getSource: (url: URL) => string): string => {
    const { file, start, end } = loc;
    const src = getSource(file);
    var lineInfo = "", line = -1, col = -1;
    if (src) {
        const lines = src.split("\n");
        for (
            line = 0, col = start;
            line < lines.length && col >= lines[line]!.length;
            col -= lines[line++]!.length);
        if (line < lines.length) {
            const relevantLine = lines[line]!;
            const lineNumberString = line + 1 + "";
            var spanLength = end - start;
            var suffix = "";
            if (spanLength > (relevantLine.length - col)) {
                spanLength = relevantLine.length - col;
                suffix = "...";
            }
            spanLength = max(spanLength, 1);
            lineInfo = `\n${lineNumberString} | ${relevantLine}\n${" ".repeat(lineNumberString.length)} | ${" ".repeat(col) + "^".repeat(spanLength) + suffix}`;
        }
    }
    return `${file.href}:${line + 1}:${col + 1}: ${message}${lineInfo}`;
}

/**
 * An error from Backolon code that contains the location in the source that caused the error.
 */
export class BackolonError extends Error {
    constructor(message: string, public readonly loc: Span) {
        super(message);
        this.name = this.constructor.name;
    }
    /**
     * Formats the error message nicely
     * @param getSource Function that returns the source code of the file at the given URL
     * @returns nicely formatted error message, with arrows pointing to the offending token
     */
    displayOn(getSource: (url: URL) => string): string {
        return formatTrace(this.loc, "error: " + this.message, getSource) + "\n";
    }
}
