#! /bin/zsh
set -exuo pipefail
pnpm jsfuzz "test/fuzz/$1.fuzz.cjs" "test/fuzz/inputs/$1" --only-ascii true
