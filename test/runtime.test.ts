import { test } from "bun:test";
import { boxList, newEmptyMap, newEnv, Scheduler } from "../src";
import { F, L } from "./astCheck";

test("a", () => {
    const s = new Scheduler({}, newEnv(newEmptyMap(), boxList([]), L));
    const t = s.startTask(1, "a + 1", null, F);
    s.stepUntilSuspended();

});
