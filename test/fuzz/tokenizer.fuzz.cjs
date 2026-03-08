const tokenize = require("../../dist/backolon.cjs").tokenize;
module.exports.fuzz = function fuzz(src) {
    tokenize(src.toString());
}
