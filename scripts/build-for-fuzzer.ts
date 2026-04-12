import { build } from "./build-common";
import plugin from "../src/esbuildPlugin";

await build({
    platform: "node",
    format: "cjs",
    entryPoints: { "backolon": "src/index.ts" },
    outExtension: { ".js": ".cjs" },
    outdir: "dist/",
    plugins: [plugin],
});
console.log("Build for fuzzer OK");
