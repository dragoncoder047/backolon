import plugin from "../src/esbuildPlugin";
import { build } from "./build-common";

await build({
    splitting: true,
    outdir: "dist/",
    entryPoints: {
        "backolon": "src/index.ts",
        "backolon-esbuild-plugin": "src/esbuildPlugin/index.ts",
    },
    minify: process.argv.includes('--minify'),
    external: ["node:fs", "node:path"],
    plugins: [plugin]
});
console.log("Build OK");
