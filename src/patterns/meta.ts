import { LocationTrace, RuntimeError } from "../errors";
import { boxOperatorSymbol, Thing, ThingType } from "../objects/thing";
import { matchPattern } from "./match";

/*

pattern syntax:

<space> --> ZERO OR MORE spaces (space is optional but permitted)
<two spaces> --> ONE or more spaces (space is required)
<newline> --> newline literal
x --> wildcard capture of any element named x
x ... --> repeat x (lazy)
x ... [+] --> repeat x (greedy) where [+] is a square bracket containing +
(x) --> grouping (parenthesised pattern)
{x|y} --> alternation (either x or y)
[x (stuff)] --> capture name with subpattern
[x: roundblock] --> type match & capture
[=xyz] --> literal match (can be symbol, number, string)
number or string literal --> not allowed

*/

export function parsePattern(block: Thing[]): Thing<ThingType.sequence> {
    // 1. turn 3 separated dots into a single ellipsis (since operator characters are not autojoined by the tokenizer)
    block = nonoverlappingreplace(block, tripledot, p => [boxOperatorSymbol("...", p[0]!.loc)]);

    // 2. recurse into parenthesised sub-patterns
    block = nonoverlappingreplace(block, single_roundblock, b => [parsePattern(b[0]!.c)]);

    // 3. alternation syntax {a|b}
    block = nonoverlappingreplace(block, single_curlyblock, curlies => [
        alternatives(nonoverlappingreplace(curlies[0]!.c, alternation, option => {
            if (option[0]?.t === ThingType.operator && option[0]!.v === "|") option.shift();
            return [parsePattern(option)];
        }), "{", "|", "}")
    ]);

    // 4. capture / literal / type shorthand in square brackets
    block = nonoverlappingreplace(block, single_squareblock, sq => {
        const b = sq[0]!;
        var inner = nonoverlappingreplace(b.c, required_space, () => []);
        if (inner.length === 0) {
            throw new RuntimeError("empty []", b.loc);
        }
        // literal matcher: [=xyz]
        if (matchPattern(inner, square_literal).length) {
            return [matchvalue(inner[1]!)];
        }
        // capture forms start with a name; try patterns in order
        if (matchPattern(inner, square_only_name_invalid).length) {
            throw new Error("expected type or subpattern after capture group name")
        }
        if (matchPattern(inner, square_capture_by_type).length) {
            const name = inner[0] as Thing<ThingType.name>;
            const tok = inner[2]!;
            const ty = typeNameToThingType(tok.v, tok.loc);
            return [grouped(name, [matchtype(ty, "", tok.loc)], "[", "]", name.loc)];
        }
        if (matchPattern(inner, square_capture_subpattern).length) {
            const name = inner[0] as Thing<ThingType.name>;
            const pat = parsePattern((inner[1] as Thing<ThingType.roundblock>).c);
            return [grouped(name, pat.c, "[", "]", name.loc)];
        }
        if (matchPattern(inner, square_only_plus).length) {
            // pass through [+] markers for repeat code
            return [b];
        }
        throw new RuntimeError("could not parse control group block", b.loc);
    });

    // 5. handle repeat syntax: x ... (lazy) or x ... [+] (greedy)
    block = nonoverlappingreplace(block, repeat_pattern, matched => {
        const item = matched[0]!;
        let greedy = false, rest: Thing[] = [];
        // check if the match includes a squareblock (which would be [+] for greedy)
        if (matched.length > 3 && matched[matched.length - 1]!.t === ThingType.squareblock) {
            const sb = matched[matched.length - 1] as Thing<ThingType.squareblock>;
            // validate it's exactly [+]
            if (sb.c.length === 1 && sb.c[0]!.t === ThingType.operator && sb.c[0]!.v === "+") {
                greedy = true;
            } else {
                // Put the unmatched space and [] back
                rest = matched.slice(matched.findIndex(v => v.v === "...") + 1);
            }
        }
        return [repeat(greedy, [item], matched[2]?.v === "..." ? "" : " ", (matched.at(-2)?.v === "..." ? "" : " ") + (greedy ? "[+]" : ""), item.loc), ...rest];
    });

    // 6. spaces/newlines represent any amount of space
    //    match themselves literally.
    block = nonoverlappingreplace(block, required_space, spaces => {
        const s = spaces.map(p => p.v).join("");
        if (s === "\n") return [matchvalue(spaces[0]!)];
        const loc = spaces[0]!.loc;
        return s.length > 1 ? [
            repeat(true, [
                matchtype(ThingType.space, " ", loc)
            ], "")
        ] : [
            alternatives([
                repeat(true, [
                    matchtype(ThingType.space, " ", loc)
                ], " "),
                nothing,
            ], "", "", "", loc)
        ];
    });

    // 7. convert remaining names to single-element wildcards
    block = nonoverlappingreplace(block, single_wildcard, match => {
        const t = match[0]!;
        return [grouped(t as Thing<ThingType.name>, [dot()], "", "", t.loc)];
    });

    // 8. bail on everything else
    nonoverlappingreplace(block, other_invalid, tokens => {
        throw new RuntimeError("not valid here", tokens[0]!.loc);
    })

    return sequence(block, "(", ")", block[0]!.loc);
}

function nonoverlappingreplace(block: Thing[], pattern: Thing, replace: (slice: Thing[], bindings: [Thing, Thing | Thing[]][]) => Thing[]): Thing[] {
    const dotmatches = matchPattern(block, pattern, true);
    for (var last = 0, shrinkage = 0, i = 0; i < dotmatches.length; i++) {
        const { span, bindings } = dotmatches[i]!, start = span[0], end = span[1];
        if (start < last) continue;
        const replaceWith = replace(block.slice(start - shrinkage, end - shrinkage), bindings);
        block = block.toSpliced(start - shrinkage, end - start, ...replaceWith);
        shrinkage += end - start - replaceWith.length;
        last = end;
    }
    return block;
}

const metapattern = new LocationTrace(0, 0, new URL("about:metapattern"));

const matchtype = (t: ThingType, src: string, loc = metapattern) => new Thing(ThingType.matchtype, [], t, src, "", "", loc);
const matchvalue = (o: Thing) => new Thing(ThingType.matchvalue, [o], null, "", "", "", metapattern);
const sequence = (o: Thing[], start: string, end = "", loc = o[0]?.loc ?? metapattern) => new Thing(ThingType.sequence, o, null, start, end, "", loc);
const alternatives = (o: Thing[], start: string, join: string, end = "", loc = o[0]?.loc ?? metapattern) => new Thing(ThingType.alternatives, o, null, start, end, join, loc);
const repeat = (g: boolean, o: Thing[], start: string, end = "", loc = o[0]?.loc ?? metapattern) => new Thing(ThingType.repeat, o, g, start, end, "", loc);
const anchor = (start: boolean, src: string, loc = metapattern) => new Thing(ThingType.anchor, [], start, src, "", "", loc);
const entire = (o: Thing[], start: string, end = "", loc = o[0]?.loc ?? metapattern) => sequence([anchor(true, start, loc), ...o, anchor(false, end, loc)], "", "", loc);
const grouped = (name: Thing<ThingType.name>, body: Thing[], start: string, end = "", loc = name.loc) => new Thing(ThingType.group, [name, ...body], null, start, end, "", loc);
const dot = (loc = metapattern) => new Thing(ThingType.matchany, [], null, "", "", "", loc);

const operator = (s: string) => boxOperatorSymbol(s, metapattern);

const singledot = matchvalue(operator("."));
const tripledot = sequence([singledot, singledot, singledot], "...");
const nothing = sequence([], "");
const required_space = repeat(true, [alternatives([matchtype(ThingType.space, ""), matchtype(ThingType.newline, "")], "", "")], "");
const optional_space = alternatives([required_space, nothing], "", "")
const block = (b: ThingType) => sequence([matchtype(b, "")], "");
const single_roundblock = block(ThingType.roundblock)
const single_curlyblock = block(ThingType.curlyblock);
const single_squareblock = block(ThingType.squareblock);
const alternation = sequence([alternatives([anchor(true, ""), matchvalue(operator("|"))], "", ""), repeat(false, [dot()], "")], "");

// metapatterns used inside square brackets
const square_literal = entire([matchvalue(operator("=")), dot()], "");
const square_only_name_invalid = entire([matchtype(ThingType.name, "")], "");
const square_only_plus = entire([matchvalue(operator("+"))], "");
const square_capture_by_type = entire([
    matchtype(ThingType.name, ""),
    matchvalue(operator(":")),
    matchtype(ThingType.name, ""),
], "");
const square_capture_subpattern = sequence([
    anchor(true, ""),
    matchtype(ThingType.name, ""),
], "");

// repeat pattern: item ... [suffix] where suffix is optional and [+] means greedy
// allows spaces/newlines between item and ... and between ... and suffix
const repeat_pattern = sequence([
    dot(),
    optional_space,
    matchvalue(operator("...")),
    alternatives([
        sequence([optional_space, matchtype(ThingType.squareblock, "")], ""),
        nothing
    ], "", "")
], "");

// token-level patterns for step 7: match individual raw tokens to convert them to patterns
const single_wildcard = sequence([matchtype(ThingType.name, "")], "");
const other_invalid = alternatives([matchtype(ThingType.operator, ""), matchtype(ThingType.number, ""), matchtype(ThingType.string, "")], "", "");

// convert a textual type name into the corresponding ThingType used by
// matchtype patterns. Throws if the name is unknown.
function typeNameToThingType(name: string, loc: LocationTrace): ThingType {
    const t = ThingType[name as any] as any as ThingType | undefined;
    if (t === undefined) {
        throw new RuntimeError("Unknown type " + name, loc);
    }
    return t;
    // switch (name) {
    //     case "nil": return ThingType.nil;
    //     case "number": return ThingType.number;
    //     case "string": return ThingType.string;
    //     case "name": return ThingType.name;
    //     case "operator": return ThingType.operator;
    //     case "space": return ThingType.space;
    //     case "roundblock": return ThingType.roundblock;
    //     case "squareblock": return ThingType.squareblock;
    //     case "curlyblock": return ThingType.curlyblock;
    //     case "topblock": return ThingType.topblock;
    //     case "stringblock": return ThingType.stringblock;
    //     default: 
    // }
}
