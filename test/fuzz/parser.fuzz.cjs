const { parse, BackolonError } = require("../../dist/backolon.cjs");
module.exports.fuzz = function fuzz(src) {
    try {
        parse(src.toString());
    } catch (e) {
        if (!(e instanceof BackolonError)) throw e;
    }
}
