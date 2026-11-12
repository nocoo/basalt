#!/usr/bin/env sh

# System0 pre-push: verify exactly the local OIDs from stdin. Deleted refs are
# skipped; every other ref gets a detached worktree, its own dependency check and
# G2, B1, L4 and P1. G1 scans that ref's pushed range.
set -e

zero=0000000000000000000000000000000000000000
command -v git >/dev/null 2>&1 || { echo "pre-push: git is required" >&2; exit 1; }
command -v bun >/dev/null 2>&1 || { echo "pre-push: bun is required" >&2; exit 1; }

repo=$(git rev-parse --show-toplevel)
tmp_root=$(mktemp -d "${TMPDIR:-/tmp}/basalt-push-XXXXXX")
worktrees="$tmp_root/worktrees"
mkdir -p "$worktrees"

cleanup() {
	status=$?
	trap - EXIT INT TERM HUP
	if [ -d "$worktrees" ]; then
		for path in "$worktrees"/*; do
			[ -e "$path" ] || continue
			git worktree remove --force "$path" >/dev/null 2>&1 || :
		done
	fi
	git worktree prune >/dev/null 2>&1 || :
	rm -rf "$tmp_root" || :
	exit "$status"
}
trap cleanup EXIT
trap "exit 130" INT
trap "exit 143" TERM
trap "exit 129" HUP

refs_file="$tmp_root/refs"
cat >"$refs_file"
if [ ! -s "$refs_file" ]; then
	echo "pre-push: no refs on stdin — run this hook through git push" >&2
	exit 1
fi

install_in() {
	if ! (cd "$1" && bun install --frozen-lockfile); then
		echo "pre-push: frozen install failed in $1" >&2
		echo "pre-push: the pushed lockfile is authoritative; use a reachable registry mirror and retry" >&2
		exit 1
	fi
}

link_tree() {
	from=$1
	to=$2
	mkdir -p "$to/node_modules"
	for entry in "$from/node_modules"/* "$from/node_modules"/.[!.]*; do
		[ -e "$entry" ] || continue
		name=${entry##*/}
		case $name in
		.vite | .vitest | .vite-temp | .cache | .tmp | .mf)
			mkdir -p "$to/node_modules/$name"
			;;
		.old_modules-*)
			;;
		*)
			ln -s "$entry" "$to/node_modules/$name"
			;;
		esac
	done
}

prepare_dependencies() {
	worktree=$1
	if (
		cd "$worktree" &&
		bun run scripts/quality/install-fingerprint.ts verify --installed="$repo" --target="$worktree"
	); then
		echo "▸ install fingerprint verified — reusing the installed tree"
		link_tree "$repo" "$worktree"
		if [ -d "$worktree/packages/basalt" ] && [ -d "$repo/packages/basalt/node_modules" ]; then
			link_tree "$repo/packages/basalt" "$worktree/packages/basalt"
		fi
	else
		echo "▸ install proof missing or stale — frozen install in the worktree"
		install_in "$worktree"
	fi
}

status=0
verified=
count=0
deleted=0

deadline=${GATE_HOOK_DEADLINE_MS:-0}

while read -r local_ref local_sha remote_ref remote_sha; do
	[ -n "$local_sha" ] || continue
	if [ "$local_sha" = "$zero" ]; then
		echo "▸ $remote_ref: deletion, no source checks"
		deleted=$((deleted + 1))
		continue
	fi

	if [ "$deadline" -gt 0 ] 2>/dev/null; then
		now_ms=$(( $(date +%s) * 1000 ))
		if [ "$now_ms" -ge "$deadline" ]; then
			echo "pre-push: hook deadline reached before $remote_ref" >&2
			exit 1
		fi
	fi

	commit=$(git rev-parse --verify "$local_sha^{commit}")
	if [ "$remote_sha" = "$zero" ]; then
		# A new ref has no remote to diff against, and `--not --remotes` would
		# skip commits that already exist on an unrelated remote. Scan the full
		# reachable history of the pushed commit instead.
		range="$commit"
	else
		range="$remote_sha..$commit"
	fi
	key="$commit|$range"
	case " $verified " in
	*" $key "*)
		echo "▸ $remote_ref: $commit already verified for this range"
		continue
		;;
	esac
	verified="$verified $key"
	count=$((count + 1))

	echo "▸ $remote_ref: $commit (G1 range $range)"
	worktree="$worktrees/$(printf '%s' "$commit" | cut -c1-12)-$(printf '%s' "$range" | cksum | cut -d' ' -f1)"
	git worktree add --detach "$worktree" "$commit" >/dev/null
	prepare_dependencies "$worktree"

	if ! (
		cd "$worktree"
		unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_PREFIX
		export GATE_GIT_ROOT="$repo"
		export XDG_CACHE_HOME="$tmp_root/cache"
		export XDG_STATE_HOME="$tmp_root/cache"
		mkdir -p "$XDG_CACHE_HOME"
		bun run scripts/quality/gate.ts --stage=pre-push --g1-range="$range"
	); then
		status=1
	fi
done <"$refs_file"

if [ "$count" -eq 0 ] && [ "$deleted" -eq 0 ]; then
	echo "pre-push: no source ref found in push input" >&2
	exit 1
fi

exit $status
