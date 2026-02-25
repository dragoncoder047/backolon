import { test } from "bun:test";
import { Scheduler } from "../src";
import { F } from "./astCheck";

test("a", () => {
    const s = new Scheduler;
    s.startTask(1, "a + 1", F);
    s.startTask(2, "a + 2", F);
    s.startTask(3, "a + 3", F);
    console.log(s.serializeTasks());
});
