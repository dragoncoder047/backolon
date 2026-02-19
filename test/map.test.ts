import { beforeEach, describe, expect, test } from "bun:test";
import { boxNumber, LocationTrace, mapDeleteKeyCopying, mapDeleteKeyMutating, mapGetKey, mapUpdateKeyCopying, mapUpdateKeyMutating, newEmptyMap, Thing, unparse } from "../src";
import { F } from "./astCheck";

const trace = new LocationTrace(1, 1, F);
let emptymap: Thing;
let map2: Thing;
beforeEach(() => {
    emptymap = newEmptyMap(trace);
    map2 = newEmptyMap(trace);
    for (var i = 0; i < 10; i++) {
        const v = i * 100;
        mapUpdateKeyMutating(map2, boxNumber(i, trace), boxNumber(v, trace));
    }
});

test("hash collision sanity check", () => {
    expect(
        new Set(Array.from({ length: 10 }, (_, i) => boxNumber(i, trace).hash)).size
    ).toBe(10);
});

describe("mutating methods", () => {
    test("can insert keys", () => {
        for (var i = 0; i < 10; i++) {
            const v = i * 100;
            mapUpdateKeyMutating(emptymap, boxNumber(i, trace), boxNumber(v, trace));
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(emptymap, boxNumber(j, trace));
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
    test("can update keys", () => {
        for (var i = 0; i < 10; i++) {
            const v = i * 1000;
            mapUpdateKeyMutating(map2, boxNumber(i, trace), boxNumber(v, trace));
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(map2, boxNumber(j, trace));
                expect(actual).toBeDefined();
                if (j > i) {
                    // Hasn't been updated yet.
                    expect(actual!.value).toBe(j * 100);
                } else {
                    expect(actual!.value).toBe(j * 1000);
                }
            }
        }
    });
    test("can delete keys", () => {
        for (var i = 0; i < 10; i++) {
            mapDeleteKeyMutating(map2, boxNumber(i, trace));
            expect(mapGetKey(map2, boxNumber(i, trace))).toBeUndefined();
        }
    });
});
describe("copying methods", () => {
    test("can insert keys", () => {
        let m = emptymap;
        let maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            const v = i * 100;
            m = mapUpdateKeyCopying(m, boxNumber(i, trace), boxNumber(v, trace));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j, trace));
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
    test("can update keys", () => {
        let m = map2;
        let maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            const v = i * 1000;
            m = mapUpdateKeyCopying(m, boxNumber(i, trace), boxNumber(v, trace));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j, trace));
                expect(actual).toBeDefined();
                if (j > i) {
                    // Hasn't been updated yet.
                    expect(actual!.value).toBe(j * 100);
                } else {
                    expect(actual!.value).toBe(j * 1000);
                }
            }
        }
    });
    test("can delete keys", () => {
        let m = map2;
        let maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            m = mapDeleteKeyCopying(m, boxNumber(i, trace));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j, trace));
                if (j > i) {
                    // Hasn't been deleted yet.
                    expect(actual).toBeDefined();
                    expect(actual!.value).toBe(j * 100);
                } else {
                    expect(actual).toBeUndefined();
                }
            }
        }
    });
});
