import { JEBError } from "@r47onfire/jeb";
import { Span } from "../parser/span";

/**
 * An error from Backolon code that contains the location in the source that caused the error.
 */
export class BackolonError extends JEBError {
    get tag() { return "bk:error" }
}

/**
 * Error raised when the module is not found (404, network down, ENOENT, etc).
 */
export class NoModuleError extends BackolonError {
    get tag() { return "bk:no_module" }
}
