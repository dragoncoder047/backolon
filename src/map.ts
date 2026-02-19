import { max, min } from "lib0/math";
import { LocationTrace, RuntimeError } from "./errors";
import { CollectionType, Thing, ThingType } from "./thing";

export function newEmptyMap(srcLocation: LocationTrace): Thing {
    return new Thing(
        ThingType.collection,
        CollectionType.map,
        [],
        null,
        "[",
        "]",
        ", ",
        srcLocation,
        false)
}

export function mapGetKey(map: Thing, key: Thing): Thing | undefined {
    const pair = mapFindPair(map, key);
    if (pair) return pair.children[1];
}

export function isMap(x: Thing): boolean {
    return x.type === ThingType.collection
}

export function mapUpdateKeyMutating(map: Thing, key: Thing, item: Thing, opTrace?: LocationTrace): void {
    if (!isMap(map)) {
        throw new RuntimeError("Cannot insert into non-map", opTrace);
    }
    const pair = mapFindPair(map, key);
    if (!pair) {
        map.children.push(createNewKVPair(key, item, opTrace));
        map.children.sort((a, b) => a.hash! - b.hash!);
    } else {
        pair.children[1] = item;
    }
}

export function mapUpdateKeyCopying(map: Thing, key: Thing, item: Thing, opTrace?: LocationTrace): Thing {
    if (!isMap(map)) {
        throw new RuntimeError("Cannot insert into non-map", opTrace);
    }
    const index = mapFindPairIndex(map, key);
    const newItem = createNewKVPair(key, item, opTrace);
    return copyMapWithNewItems(map, index !== undefined ? map.children.with(index, newItem) : map.children.toSpliced(0, 0, newItem).sort((a, b) => a.hash! - b.hash!));
}

export function mapDeleteKeyMutating(map: Thing, key: Thing, opTrace?: LocationTrace): void {
    if (!isMap(map)) {
        throw new RuntimeError("Cannot delete from non-map", opTrace);
    }
    const index = mapFindPairIndex(map, key);
    if (index !== undefined) map.children.splice(index, 1);
}

export function mapDeleteKeyCopying(map: Thing, key: Thing, opTrace?: LocationTrace): Thing {
    if (!isMap(map)) {
        throw new RuntimeError("Cannot delete from non-map", opTrace);
    }
    const index = mapFindPairIndex(map, key);
    return index !== undefined ? copyMapWithNewItems(map, map.children.toSpliced(index, 1)) : map;
}

function mapFindPairIndex(map: Thing, key: Thing, opTrace?: LocationTrace): number | undefined {
    const items = map.children;
    const len = items.length;
    const lm1 = len - 1;
    const targetKeyHash = key.hash;
    console.log("Finding key with hash", targetKeyHash, "in map with keys", items.map(i => i.children[0]));
    if (targetKeyHash === null) {
        throw new RuntimeError("unhashable object", opTrace);
    }
    if (len === 0) return undefined;
    var probe = len >> 1;
    var step = len >> 2 || 1;
    for (; step > 0; step >>= 1) {
        console.log("Probing index", probe);
        const currentKeyHash = items[probe]!.children[0]!.hash!;
        if (currentKeyHash === targetKeyHash) break;
        probe = currentKeyHash < targetKeyHash ? min(lm1, probe + step) : max(0, probe - step);
    }
    return items[probe]!.children[0]!.hash === targetKeyHash ? probe : undefined;
}

function mapFindPair(map: Thing, key: Thing, opTrace?: LocationTrace): Thing | undefined {
    const index = mapFindPairIndex(map, key, opTrace);
    if (index !== undefined) return map.children[index];
}

function createNewKVPair(key: Thing, value: Thing, opTrace?: LocationTrace): Thing {
    return new Thing(ThingType.collection, CollectionType.kv_pair, [key, value], null, "", "", ": ", opTrace ?? key.srcLocation, true, false);
}

function copyMapWithNewItems(map: Thing, newItems: Thing[]): Thing {
    return new Thing(
        map.type,
        map.subtype,
        newItems,
        null,
        map.srcPrefix,
        map.srcSuffix,
        map.srcJoiner,
        map.srcLocation,
        false);
}
