import { BuildConfig } from "bun";

export async function build(options: BuildConfig) {
    await Bun.build({
        sourcemap: true,
        target: "browser",
        format: "esm",
        define: { TEST: "false" },
        ...options,
    });
}
