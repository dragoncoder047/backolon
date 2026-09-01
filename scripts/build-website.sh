set -exu

# build HTML, Javascript and CSS
bun run build --minify
bun typedoc --options typedoc-backolon.json
pushd jeb
bun typedoc --options ../typedoc-jeb.json
popd
bun run scripts/build-website.ts
