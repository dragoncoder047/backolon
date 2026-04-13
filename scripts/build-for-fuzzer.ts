import { build } from "./build-common";
import plugin from "../src/plugin";

await build({
    target: "node",
    minify: true, // Must minify for the fs imports to be eliminated
    format: "cjs",
    entrypoints: ["src/index.ts"],
    naming: "[name].cjs",
    plugins: [plugin],
});
console.log("Build for fuzzer OK");
