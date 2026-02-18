# Backolon

A little programming language I came up with.

## Features

* **Homoiconic.** Define new syntactic macros to extends the language.
* **Pattern-matching based.** There are no predefined operator syntaxes.
* **Keywordless.** `return`, `break`, `continue`, `while`, `if`, ... they're all just variables and can be passed around and reassigned.
* **Stateful.** The virtual machine state can be stopped and serialized at any point, and restored exactly.
* **Concrete.** The result of a parse operation still has all the information required to exactly reconstruct the source.
