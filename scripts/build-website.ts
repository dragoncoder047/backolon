import { stringify } from "lib0/json";
import plugin from "../src/plugin";
import { build } from "./build-common.js";
import { extractBackolonDocs } from "./doc-extract";


await build({
    splitting: true,
    minify: true,
    entrypoints: ["./website/repl.ts", "./website/docs.ts"],
    outdir: "./docs/js/",
    plugins: [
        plugin,
        {
            name: "DOCS_PLUGIN",
            setup(build) {
                build.onResolve({ filter: /^\$_DOCUMENTATION$/ }, _ => {
                    return { path: "documentation.json", namespace: "DOCS" };
                });

                build.onLoad({ filter: /./, namespace: "DOCS" }, async () => {
                    const extracted = extractBackolonDocs(await import("../dist/typedoc_output.json") as any);

                    // could add all of the file names to the watch list here, but we don't use esbuild's watch mode
                    // since this script is only run on demand or by nodemon, which is already watching all the files for changes
                    return {
                        contents: stringify(extracted, null, 4),
                        loader: "json"
                    };
                });
            }
        },
        {
            name: "SQUELCH_REQUIRE_JQUERY",
            setup(build) {
                build.onResolve({ filter: /^jquery$/ }, args => {
                    // args.importer is the file doing the require/import
                    if (args.importer && /jquery\.terminal/.test(args.importer)) {
                        return { external: true, path: "" };
                    }
                    // otherwise let esbuild resolve normally
                    return;
                });
            }
        }
    ],
});

console.log("JS Build OK");
