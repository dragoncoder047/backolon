import { isArray } from "lib0/array";
import { LocationTrace } from "../errors";
import { mapUpdateKeyMutating, newEmptyMap } from "../objects/map";
import { boxList, boxNil, Thing, ThingType } from "../objects/thing";
import { MatchResult } from "../patterns/match";

export function newEnv(newVars: Thing<ThingType.map>, newPatterns: Thing<ThingType.list>, callsite: LocationTrace, parent: Thing<ThingType.nil | ThingType.env> = boxNil(callsite)): Thing<ThingType.env> {
    return new Thing(ThingType.env, [parent, newVars, newPatterns], null, "", "", "", callsite);
}

export function flatToVarMap(result: MatchResult, location: LocationTrace): Thing<ThingType.map> {
    const map = newEmptyMap(location);
    for (var [name, value] of result.bindings) {
        if (isArray(value)) value = boxList(value, value[0]!.loc);
        mapUpdateKeyMutating(map, name, value)
    }
    return map;
}
