const { Scheduler, BUILTIN_ENV, BUILTIN_FUNCTIONS, BackolonError } = require("../../dist/backolon.cjs");
module.exports.fuzz = function fuzz(src) {
    // if (!/^[\x32-\x7F]*$/.test(src.toString())) return;
    const s = new Scheduler(BUILTIN_FUNCTIONS, BUILTIN_ENV);
    try {
        s.startTask(1, src.toString(), null, new URL("about:fuzzer"));
        s.stepUntilSuspended();
    } catch (e) {
        if (!(e instanceof BackolonError)) throw e;
    }
}
