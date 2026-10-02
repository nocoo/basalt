import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, webkit } from "playwright";
import { build } from "vite";
import { showcaseBuildConfig } from "./catalog-page-status-build";
import { assertNoPageFaults, attachPageFaults } from "./consumer-browser";
import { allocatePort, startHttpServer, stopChild } from "./consumer-http";
import { assertMobileLayouts } from "./showcase-mobile-layouts";

const root = mkdtempSync(join(tmpdir(), "basalt-mobile-layouts-"));
try {
	await build({
		...showcaseBuildConfig(),
		logLevel: "warn",
		build: { outDir: join(root, "dist"), emptyOutDir: true },
	});
	const port = await allocatePort();
	const url = `http://127.0.0.1:${port}`;
	const { child } = await startHttpServer({
		cwd: process.cwd(),
		command: "node",
		args: [
			resolve("node_modules/vite/bin/vite.js"),
			"preview",
			"--host",
			"127.0.0.1",
			"--port",
			String(port),
			"--strictPort",
			"--outDir",
			join(root, "dist"),
		],
		url,
	});
	try {
		for (const engine of [chromium, webkit]) {
			if (!existsSync(engine.executablePath()))
				throw new Error(`Install pinned ${engine.name()} with playwright install ${engine.name()}`);
			const browser = await engine.launch();
			try {
				const page = await browser.newPage();
				const faults = attachPageFaults(page);
				const evidence = await assertMobileLayouts(page, url);
				assertNoPageFaults(faults);
				console.log(
					JSON.stringify({
						engine: engine.name(),
						version: browser.version(),
						evidence,
						physicalIPhone: "manual verification required",
					}),
				);
			} finally {
				await browser.close();
			}
		}
	} finally {
		await stopChild(child);
	}
} finally {
	rmSync(root, { recursive: true, force: true });
}
