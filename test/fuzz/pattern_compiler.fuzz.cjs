const {
    compilePattern,
    parsePattern,
    parse,
    BackolonError
} = require("../../dist/backolon.cjs");
module.exports.fuzz = function fuzz(src) {
    try {
        compilePattern(parsePattern(parse(src.toString(), new URL("about:fuzzer")).c));
    } catch (e) {
        if (!(e instanceof BackolonError)) throw e;
    }
}
