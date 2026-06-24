import { Command, Continuation, DynamicWind, Env, JebVM, LinkedList, StackCount } from "@r47onfire/jeb";
import { Parser } from "../parser";
import { BackolonVM } from "./vm";

export class BackolonContinuation extends Continuation {
    constructor(
        env: Env,
        commands: LinkedList<Command>,
        data: LinkedList<any>,
        winders: DynamicWind,
        traceback: StackCount | null,
        public parser: Parser
    ) {
        super(env, commands, data, winders, traceback);
    }
    invoke(vm: JebVM, data: any): void {
        (vm as any as BackolonVM).parser = this.parser;
        super.invoke(vm, data);
    }
}
