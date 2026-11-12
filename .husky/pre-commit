#!/usr/bin/env sh

# System0 pre-commit: S1, S2, S3 (workflow changes only), G1 and L1 against the
# exported Git index, never the working tree.
set -e

command -v git >/dev/null 2>&1 || { echo "pre-commit: git is required" >&2; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "pre-commit: bun is required" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo "pre-commit: node is required" >&2; exit 1; }

snapshot=
cleanup() {
	status=$?
	trap - EXIT INT TERM HUP
	if [ -n "$snapshot" ]; then
		rm -rf "$snapshot" || :
		snapshot=
	fi
	exit "$status"
}
trap cleanup EXIT
trap "exit 130" INT
trap "exit 143" TERM
trap "exit 129" HUP

repo=$(git rev-parse --show-toplevel)
GATE_STAGED_FILES=$(git diff --cached --name-only)
export GATE_STAGED_FILES

snapshot=$(mktemp -d "${TMPDIR:-/tmp}/basalt-index-XXXXXX")
snapshot=$(cd "$snapshot" && pwd -P)
git checkout-index --all --prefix="$snapshot/"

for manifest in package.json bun.lock packages/basalt/package.json vitest.config.ts biome.json tsconfig.app.json tsconfig.node.json; do
	if [ ! -f "$snapshot/$manifest" ] || ! cmp -s "$snapshot/$manifest" "$repo/$manifest"; then
		echo "pre-commit: staged $manifest must match the installed worktree copy (run bun install)" >&2
		exit 1
	fi
done

link_modules() {
	src=$1
	dst=$2
	mkdir -p "$dst"
	for entry in "$src"/* "$src"/.[!.]*; do
		[ -e "$entry" ] || continue
		name=${entry##*/}
		case $name in
		.vite | .vitest | .vite-temp | .cache | .tmp | .mf)
			mkdir -p "$dst/$name"
			;;
		.old_modules-*)
			;;
		*)
			ln -s "$entry" "$dst/$name"
			;;
		esac
	done
}

if [ ! -d "$repo/node_modules" ] || [ ! -d "$repo/packages/basalt/node_modules" ]; then
	echo "pre-commit: installed node_modules (root and packages/basalt) are required" >&2
	exit 1
fi
link_modules "$repo/node_modules" "$snapshot/node_modules"
link_modules "$repo/packages/basalt/node_modules" "$snapshot/packages/basalt/node_modules"
mkdir -p "$snapshot/.cache"

unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_PREFIX
unset GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES
export XDG_CACHE_HOME="$snapshot/.cache"
export XDG_STATE_HOME="$snapshot/.cache"
export GATE_GIT_ROOT="$repo"
export GATE_SNAPSHOT_ROOT="$snapshot"
PATH="$snapshot/node_modules/.bin:$PATH"
export PATH

cd "$snapshot"
bun run scripts/quality/gate.ts --stage=pre-commit
