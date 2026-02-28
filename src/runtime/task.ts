import { Thing } from "../objects/thing";

interface StackEntry {

}

export class Task {
    suspended = false;
    completed = true;
    stack: StackEntry[] = [];
    constructor(public priority: number) { }
    start(code: Thing) {
        if (!this.completed) throw new Error("tried to reuse an in-use task");
        this.completed = false;
        // TODO
    }
    step(): boolean {
        if (this.suspended) return false;
    }
    _evalTop() {
        /*
        block:
            try to match all patterns in scope
            if one matches: call the pattern impl and splice back in, go back to the step 1
            if no more match: call the block's elements in order, return the last one

        symbol:
            look it up, error if not found

        apply:
            eval the function form
            evaluate params that need evaluating
            call
            deal with result
        */
    }
}
