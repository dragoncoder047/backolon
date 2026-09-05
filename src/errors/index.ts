import { JEBError } from "@r47onfire/jeb";
import { max } from "lib0/math";

/**
 * An error from Backolon code that contains the location in the source that caused the error.
 */
export class BackolonError extends JEBError {
    get tag() { return "bk:error" }
}

/**
 * Error raised when the module is not found (404, network down, ENOENT, etc).
 */
export class NoModuleError extends BackolonError {
    get tag() { return "bk:no_module" }
}

// what is this
const formatTrace = (file: URL, start: number, end: number, message: string, getSource: (url: URL) => string): string => {
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