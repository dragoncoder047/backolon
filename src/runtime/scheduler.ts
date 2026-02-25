import JSONCrush from "jsoncrush";
import { is } from "lib0/function";
import { NamespaceResolver, Resurrect } from "resurrect-esm";
import { LocationTrace } from "../errors";
import { Thing } from "../objects/thing";
import { parse } from "../parser/parse";
import { Task } from "./task";

export class Scheduler {
    tasks: Task[] = [];
    private _serializer: Resurrect;

    constructor(customNames: ConstructorParameters<typeof NamespaceResolver>[0] = {}) {
        this._serializer = new Resurrect({ resolver: new NamespaceResolver({ ...customNames, Task, Thing, LocationTrace }) });
    }
    startTask(task: Task): void;
    startTask(priority: number, code: string, filename: URL): Task;
    startTask(priority: number, code: Thing): Task;
    startTask(priority: number | Task, code?: string | Thing, filename?: URL): Task | undefined {
        if (is(priority, Task)) {
            this.tasks.push(priority);
            this._sortTasks();
        }
        else {
            if (typeof code === "string") code = parse(code, filename);
            const task = new Task(priority);
            task.start(code!);
            this.tasks.push(task);
            this._sortTasks();
            return task;
        }
    }
    private _sortTasks() {
        this.tasks.sort((t1, t2) => t1.priority - t2.priority);
    }
    serializeTasks(): string {
        return encodeURIComponent(JSONCrush.crush(this._serializer.stringify(this.tasks)));
    }
    loadFromSerialized(str: string): void {
        this.tasks.push(...this._serializer.resurrect(JSONCrush.uncrush(decodeURIComponent(str))));
    }
}
