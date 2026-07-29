import { test } from "bun:test";
import { BackolonVM } from "../src";

test("smoke test", () => {
    const vm = new BackolonVM();
    vm.addModule(new URL("about:test"), "print 1");
    vm.setMain(new URL("about:test"));
    while (!vm.step());
});
