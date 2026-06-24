set -exu

# build HTML, Javascript and CSS
pnpm build --minify
pnpm bun typedoc --options typedoc-backolon.json
pushd jeb
pnpm bun typedoc --options ../typedoc-jeb.json
popd
pnpm bun typedoc --options typedoc-json-only.json
pnpm bun run scripts/build-website.ts

# clean up
rm -f typedoc_output.json
