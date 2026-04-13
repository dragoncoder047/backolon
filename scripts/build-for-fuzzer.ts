import { build } from "./build-common";
import plugin from "../src/esbuildPlugin";

await build({
    platform: "node",
    minify: true, // Must minify for the fs imports to be eliminated
    format: "cjs",
    entryPoints: { "backolon": "src/index.ts" },
    outExtension: { ".js": ".cjs" },
    outdir: "dist/",
    plugins: [plugin],
});
console.log("Build for fuzzer OK");
