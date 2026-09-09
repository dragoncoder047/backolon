import { JEBStateError, Location } from "@r47onfire/jeb";
import { SourceTracker } from "../runtime/importer";
import { BackolonVM } from "../runtime/vm";
import { Parselet } from "./parselet";
import { Constraint, sortByConstraints } from "./sort";
import { Span } from "./span";

export class Token {
    constructor(
        readonly text: string,
        readonly location: Location,
    ) { }
}

export class Parser {
    constructor(
        readonly source: SourceTracker,
        readonly index: number,
        readonly parselets: Parselet[],
        readonly constraints: readonly Constraint<Parselet>[],
        readonly skipErrors: boolean,
    ) { }
    #clean = false;
    #precedenceOf!: Map<Parselet, number>;
    addParselet(parselet: Parselet): Parser {
        return new Parser(this.source, this.index, this.parselets.concat(parselet), this.constraints, this.skipErrors);
    }
    addConstraint(constraint: Constraint<Parselet>): Parser {
        return new Parser(this.source, this.index, this.parselets, this.constraints.concat(constraint), this.skipErrors);
    }
    sort() {
        if (this.#clean) return;
        this.#precedenceOf = sortByConstraints(this.parselets, this.constraints);
        this.#clean = true;
    }
    #assertClean() {
        if (!this.#clean) throw new JEBStateError("Cannot parse right now");
    }
    test(regex: RegExp) {
        regex.lastIndex = this.index;
        return regex.exec(this.source.code);
    }
    peek(vm: BackolonVM, minPrecedence: number, startPrecedence: number = this.parselets.length - 1): [parselet: Parselet, token: Token] | undefined {
        this.#assertClean();
        const { parselets, source, index } = this;
        // TODO: find longest match in specified range and go with that one instead of first match of highest precedence
        for (var i = startPrecedence; i >= minPrecedence; i--) {
            const p = parselets[i]!;
            const match = this.test(p.prefix);
            if (match) {
                const text = match[0];
                return [p, new Token(text, vm.registerSpan(new Span(source.src, index, index + text.length)))];
            }
        }
    }
}


/*

sys.parser control functions not given in context:
    test(regex) = test if regex matches but don't advance
    eat(regex) = get token at current position or undefined if it doesn't match
    tag(span, tag) = syntax highlighting tagging
    save() = save parser state
    restore(saved) = restore parser state

parseExpression(minPrecedence, orEqual) {

    let left = undefined
    let first = true
    let curParent = getParentParselet()

    while (first || peekPrecedence() > minPrecedence) {
        let savedPosition = parserPosition()
        findloop: for (each registered parselet greater than minPrecedence) {
            resetParserPosition(savedPosition)
            if (parselet matches && parselet.precedence (orEqual ? >= : >) minPrecedence) {
                setParentParselet(parselet)
                left = call parselet.parse(context{skip = () => continue findloop, discard = () => break findloop, first, ...}, left, token)
                break findloop
            }
        } else { // nothing matched
            die("failed to parse")
        }
        first = false
    }
    setParentParselet(curParent)

    return left
};


*/
