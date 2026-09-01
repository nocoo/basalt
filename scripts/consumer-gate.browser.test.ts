import { existsSync, mkdtempSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { expect, it } from "vitest";
import {
	assertNoPageFaults,
	attachPageFaults,
	createBrowserProfileDir,
	settleWithCleanup,
	withChromiumPage,
} from "./consumer-browser";
import { assertHttpClosed, cleanupConsumerGate } from "./consumer-gate";
import { allocatePort, listPidsMatching, processAlive, startHttpServer } from "./consumer-http";

it("cleans server pid, port, profile, and temp when browser proof fails on that server", async () => {
	const tempRoot = realpathSync(mkdtempSync(join(tmpdir(), "basalt-gate-c-fail-")));
	const unique = basename(tempRoot);
	const profileDir = createBrowserProfileDir();
	const port = await allocatePort();
	const url = `http://127.0.0.1:${port}/`;
	const html = "<!doctype html><script>console.error('basalt-console-fail')</script>";
	const started = await startHttpServer({
		cwd: process.cwd(),
		command: "node",
		args: [
			"-e",
			`require("http").createServer((_, res) => { res.writeHead(200, { "content-type": "text/html" }); res.end(${JSON.stringify(html)}); }).listen(${port}, "127.0.0.1"); // ${tempRoot}`,
		],
		url,
		timeoutMs: 5000,
		needles: [tempRoot, unique],
	});
	await expect(
		settleWithCleanup(
			async () =>
				withChromiumPage(profileDir, async (page) => {
					const faults = attachPageFaults(page);
					await page.goto(url);
					assertNoPageFaults(faults);
				}),
			async () => {
				await cleanupConsumerGate({
					profileDir,
					child: started.child,
					nextUrl: url,
					tempRoot,
				});
			},
		),
	).rejects.toThrow(/basalt-console-fail/);
	expect(existsSync(tempRoot)).toBe(false);
	expect(existsSync(profileDir)).toBe(false);
	expect(listPidsMatching(unique)).toEqual([]);
	expect(listPidsMatching(profileDir)).toEqual([]);
	expect(processAlive(started.child.pid as number)).toBe(false);
	await expect(assertHttpClosed(url)).resolves.toBeUndefined();
});
