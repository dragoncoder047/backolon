import { beforeEach, describe, expect, test } from "bun:test";
import { boxNil, boxNumber, mapDeleteKeyCopying, mapDeleteKeyMutating, mapGetKey, mapUpdateKeyCopying, mapUpdateKeyMutating, newEmptyMap, RuntimeError, Thing, ThingType } from "../src";
import { L } from "./astCheck";

var emptymap: Thing;
var map2: Thing;
beforeEach(() => {
    emptymap = newEmptyMap();
    map2 = newEmptyMap();
    for (var i = 0; i < 10; i++) {
        const v = i * 100;
        mapUpdateKeyMutating(map2, boxNumber(i), boxNumber(v));
    }
});

test("hash collision sanity check", () => {
    expect(
        new Set(Array.from({ length: 10 }, (_, i) => boxNumber(i).hash)).size
    ).toBe(10);
});

describe("mutating methods", () => {
    test("can insert keys", () => {
        for (var i = 0; i < 10; i++) {
            const v = i * 100;
            mapUpdateKeyMutating(emptymap, boxNumber(i), boxNumber(v));
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(emptymap, boxNumber(j));
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
            mapUpdateKeyMutating(map2, boxNumber(i), boxNumber(v));
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(map2, boxNumber(j));
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
            mapDeleteKeyMutating(map2, boxNumber(i));
            expect(mapGetKey(map2, boxNumber(i))).toBeUndefined();
        }
    });
    test("delete nonexistent key does nothing", () => {
        const before = [...map2.children];
        mapDeleteKeyMutating(map2, boxNumber(1000000));
        expect(map2.children).toEqual(before);
    });
});
describe("copying methods", () => {
    test("can insert keys", () => {
        var m = emptymap;
        var maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            const v = i * 100;
            m = mapUpdateKeyCopying(m, boxNumber(i), boxNumber(v));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j));
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
        var m = map2;
        var maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            const v = i * 1000;
            m = mapUpdateKeyCopying(m, boxNumber(i), boxNumber(v));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j));
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
        var m = map2;
        var maps: Thing[] = [];
        for (var i = 0; i < 10; i++) {
            m = mapDeleteKeyCopying(m, boxNumber(i));
            maps.push(m);
        }
        // verify that old maps are unchanged
        for (var i = 0; i < 10; i++) {
            const m = maps[i]!;
            for (var j = 0; j < 10; j++) {
                const actual = mapGetKey(m, boxNumber(j));
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
    test("delete nonexistent key returns original map", () => {
        expect(mapDeleteKeyCopying(map2, boxNumber(1000000))).toBe(map2);
    });
});
describe("throws errors when expected", () => {
    test("throws when trying to add/search/delete to non-map", () => {
        expect(() => mapUpdateKeyCopying(boxNil(), boxNil(), boxNil())).toThrow(new RuntimeError("Cannot insert into non-map"));
        expect(() => mapGetKey(boxNil(), boxNil())).toThrow(new RuntimeError("Cannot search non-map"));
        expect(() => mapDeleteKeyCopying(boxNil(), boxNil())).toThrow(new RuntimeError("Cannot delete from non-map"));

    });
    test("trying to add/search/delete unhashable object", () => {
        expect(() => mapUpdateKeyCopying(map2, new Thing("custom", [], null, "", "", "", L, false), boxNil())).toThrow(new RuntimeError("unhashable object"));
        expect(() => mapGetKey(map2, new Thing("custom", [], null, "", "", "", L, false))).toThrow(new RuntimeError("unhashable object"));
        expect(() => mapDeleteKeyCopying(map2, new Thing("custom", [], null, "", "", "", L, false))).toThrow(new RuntimeError("unhashable object"));
    })
});
describe("map inheritance", () => {
    test("maps can inherit from other maps", () => {
        const parent = newEmptyMap();
        mapUpdateKeyMutating(parent, boxNumber(1), boxNumber(100));
        const child = newEmptyMap(parent);
        expect(mapGetKey(child, boxNumber(1), true)).toEqual(boxNumber(100));
    });
    test("child maps can override parent keys", () => {
        const parent = newEmptyMap();
        mapUpdateKeyMutating(parent, boxNumber(1), boxNumber(100));
        const child = newEmptyMap(parent);
        mapUpdateKeyMutating(child, boxNumber(1), boxNumber(200));
        expect(mapGetKey(child, boxNumber(1), true)).toEqual(boxNumber(200));
    });
    test("child maps can have their own keys", () => {
        const parent = newEmptyMap();
        mapUpdateKeyMutating(parent, boxNumber(1), boxNumber(100));
        const child = newEmptyMap(parent);
        mapUpdateKeyMutating(child, boxNumber(2), boxNumber(200));
        expect(mapGetKey(child, boxNumber(1), true)).toEqual(boxNumber(100));
        expect(mapGetKey(child, boxNumber(2), true)).toEqual(boxNumber(200));
    });
});
