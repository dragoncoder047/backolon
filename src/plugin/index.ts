import { BunPlugin } from "bun";
import { stringify } from "lib0/json";
import { compress } from "lz-string";
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { NamespaceResolver, Resurrect } from "resurrect-esm";
import { LocationTrace } from "../errors";
import { tokenize } from "../tokenizer";

/**
 * [ESBuild](https://esbuild.github.io) or [Bun](https://bun.com) plugin that loads `.bk`
 * files as their Backolon AST (the result of calling {@link tokenize} on their contents).
 */
const plugin: BunPlugin = {
    name: "esbuild-plugin-backolon",
    setup(build) {
        build.onLoad({ filter: /\.bk$/ }, args => {
            const javascript = convertAST(args.path);
            return {
                contents: javascript,
                loader: "js"
            }
        });
    },
};
export default plugin;

function convertAST(file: string) {
    const text = readFileSync(file, "utf8");
    const parsed = tokenize(text, new URL("frozen://" + relative(process.cwd(), file)));
    const stringified = new Resurrect({
        cleanup: true,
        resolver: new NamespaceResolver({
            LocationTrace,
        }),
    }).stringify(parsed);
    return `import { Resurrect, NamespaceResolver } from "resurrect-esm";
import { decompress } from "lz-string";
import { Thing, LocationTrace } from "@r47onfire/backolon";

/*

${text.replaceAll("*/", "*)")}

*/
export const source = /* @__PURE__ */ decompress(${stringify(compress(text))});

export const ast = /* @__PURE__ */ new Resurrect({
    cleanup: true,
    resolver: new NamespaceResolver({
        Thing,
        LocationTrace,
    }),
}).resurrect(decompress(${stringify(compress(stringified))}));
export default ast;
`
}
