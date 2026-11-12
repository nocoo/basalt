import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
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
 * Tracks the process groups this gate owns so a supervisor can terminate the
 * whole tree. One file per group id keeps concurrent slots race free.
 */
export class PgidRegistry {
	private readonly directory: string | undefined;

	constructor(directory = process.env.GATE_PGID_REGISTRY) {
		this.directory = directory;
		if (this.directory) mkdirSync(this.directory, { recursive: true });
	}

	add(pgid: number): void {
		if (!this.directory) return;
		writeFileSync(join(this.directory, String(pgid)), "");
	}

	remove(pgid: number): void {
		if (!this.directory) return;
		rmSync(join(this.directory, String(pgid)), { force: true });
	}

	static list(directory = process.env.GATE_PGID_REGISTRY): number[] {
		if (!directory) return [];
		try {
			return readdirSync(directory)
				.map((name) => Number.parseInt(name, 10))
				.filter((value) => Number.isFinite(value) && value > 0);
		} catch {
			return [];
		}
	}
}

export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
