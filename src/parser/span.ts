import { max } from "lib0/math";

/** Source location information for a token.*/
export class Span {
    constructor(
        /** URL uniquely identifying the source that this span is from. */
        public readonly file: Readonly<URL>,
        /** Source index at which this span starts. (not line or column.) */
        public readonly start: number,
        /** Source index at which this span ends. */
        public readonly end: number) { }
}

const formatTrace = ({ file, start, end }: Span, message: string, getSource: (url: URL) => string): string => {
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