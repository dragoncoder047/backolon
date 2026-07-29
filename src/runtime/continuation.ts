import { Command, Continuation, JebVM } from "@r47onfire/jeb";
import { Parser } from "../parser";
import { BackolonVM } from "./vm";

export class BackolonContinuation extends Continuation {
    parser: Parser | null;
    parentParser: Parser | null;
    constructor(vm: BackolonVM, extraOps: Command[]) {
        super(vm as any, extraOps);
        this.parser = vm.parser;
        this.parentParser = vm.parentParser;
    }
    invoke(vm: JebVM, data: any): void {
        super.invoke(vm, data);
        (vm as any as BackolonVM).parser = this.parser;
        (vm as any as BackolonVM).parentParser = this.parentParser;
    }
}
