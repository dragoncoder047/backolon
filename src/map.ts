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

const childComparator = (a: Thing, b: Thing) => a.children[0]!.hash! - b.children[0]!.hash!;
export function mapUpdateKeyMutating(map: Thing, key: Thing, item: Thing, opTrace?: LocationTrace): void {
    if (!isMap(map)) {
        throw new RuntimeError("Cannot insert into non-map", opTrace);
    }
    const pair = mapFindPair(map, key);
    if (!pair) {
        map.children.push(createNewKVPair(key, item, opTrace));
        map.children.sort(childComparator);
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
    return copyMapWithNewItems(map, index !== undefined ? map.children.with(index, newItem) : map.children.toSpliced(0, 0, newItem).sort(childComparator));
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
    if (targetKeyHash === null) {
        throw new RuntimeError("unhashable object", opTrace);
    }
    if (len === 0) return undefined;
    var left = 0, right = lm1
    for (; left <= right;) {
        const probe = left + ((right - left) >> 1);
        const currentKeyHash = items[probe]!.children[0]!.hash!;
        if (currentKeyHash === targetKeyHash) {
            // TODO: actually check equality of keys (hash collisions)
            return probe;
        }
        if (currentKeyHash < targetKeyHash) {
            left = probe + 1;
        } else {
            right = probe - 1;
        }
    }
    return undefined;
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
        map.value,
        map.srcPrefix,
        map.srcSuffix,
        map.srcJoiner,
        map.srcLocation,
        false);
}
