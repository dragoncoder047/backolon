import { Arithmetic, Command, JebVM, llPushArray } from "@r47onfire/jeb";
import { installParserMachinery, Parser } from "../parser";
import { BackolonContinuation } from "./continuation";

export class BackolonVM extends JebVM {
    // Current parser
    parser!: Parser;
    // Stack of modules being imported
    constructor(math?: Arithmetic) {
        super(math);
        installParserMachinery(this);
    }
    run(code: string, src: URL) {
        throw "todo";
    }
    // Overridden to include the parser state.
    override cc(...extraOps: Command[]) {
        return new BackolonContinuation(
            this.currentEnv,
            llPushArray(this.commandStack, extraOps),
            this.dataStack,
            this.curDynamicWind,
            this.tracebackStack,
            this.parser,
        );
    }
}
