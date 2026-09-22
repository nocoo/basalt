import type { Reporter, TestModule } from "vitest/node";

export default class SelectedRunReporter implements Reporter {
	onTestRunEnd(modules: readonly TestModule[]) {
		let skipped = 0;
		let focused = 0;
		for (const mod of modules) {
			for (const test of mod.children.allTests()) {
				const state = test.result().state;
				const mode = test.options.mode;
				if (state === "skipped" || mode === "skip" || mode === "todo") skipped += 1;
				if (mode === "only") focused += 1;
			}
		}
		if (skipped > 0)
			throw new Error(
				`Vitest skipped ${skipped} tests; skipped, focused, or missing dist-guard tests are not accepted (build the package first: bun run --cwd packages/basalt build)`,
			);
		if (focused > 0) throw new Error(`Vitest focused ${focused} tests`);
	}
}
