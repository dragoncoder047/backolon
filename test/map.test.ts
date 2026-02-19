import { beforeEach, describe, expect, test } from "bun:test";
import { boxNumber, LocationTrace, mapGetKey, mapUpdateKeyMutating, newEmptyMap, Thing, unparse } from "../src";
import { F } from "./astCheck";

const trace = new LocationTrace(1, 1, F);
let map: Thing;
beforeEach(() => {
    map = newEmptyMap(trace);
});

describe("mutating methods", () => {
    test("can update keys", () => {
        for (var i = 0; i < 10; i++) {
            const v = i * 100;
            mapUpdateKeyMutating(map, boxNumber(i, trace), boxNumber(v, trace));
            console.log(unparse(map));
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(map, boxNumber(j, trace));
                if (j > i) {
                    // Hasn't been added yet.
                    expect(actual).toBeUndefined();
                } else {
                    expect(actual).toBeDefined();
                    expect(actual!.value).toBe(j * 100);
                }
            }
        }
    });
});
