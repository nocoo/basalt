import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function killProcessGroup(pgid: number, signal: NodeJS.Signals = "SIGTERM"): boolean {
	try {
		process.kill(-pgid, signal);
		return true;
	} catch {
		return false;
	}
}

export function killProcess(pid: number, signal: NodeJS.Signals = "SIGTERM"): boolean {
	try {
		process.kill(pid, signal);
		return true;
	} catch {
		return false;
	}
}

/**
 * The owner of the process groups a command starts. The gate sets it per step
 * so a step timeout only kills the groups that step created.
 */
export function currentOwner(): string {
	return process.env.GATE_PROCESS_OWNER ?? "";
}

/**
 * Tracks the process groups this gate owns so a supervisor can terminate the
 * whole tree. One file per group id keeps concurrent slots race free; the file
 * content records the owner of the group.
 */
export class PgidRegistry {
	readonly directory: string | undefined;

	constructor(directory = process.env.GATE_PGID_REGISTRY) {
		this.directory = directory;
		if (this.directory) mkdirSync(this.directory, { recursive: true });
	}

	add(pgid: number, owner = currentOwner()): void {
		if (!this.directory || !Number.isFinite(pgid) || pgid <= 0) return;
		writeFileSync(join(this.directory, String(pgid)), owner);
	}

	remove(pgid: number): void {
		if (!this.directory) return;
		rmSync(join(this.directory, String(pgid)), { force: true });
	}

	listOwned(owner: string): number[] {
		return PgidRegistry.list(this.directory, owner);
	}

	static list(directory = process.env.GATE_PGID_REGISTRY, owner?: string): number[] {
		if (!directory) return [];
		let names: string[] = [];
		try {
			names = readdirSync(directory);
		} catch {
			return [];
		}
		const pgids: number[] = [];
		for (const name of names) {
			const pgid = Number.parseInt(name, 10);
			if (!Number.isFinite(pgid) || pgid <= 0) continue;
			if (owner !== undefined) {
				let content = "";
				try {
					content = readFileSync(join(directory, name), "utf8");
				} catch {
					continue;
				}
				if (content !== owner) continue;
			}
			pgids.push(pgid);
		}
		return pgids;
	}
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
