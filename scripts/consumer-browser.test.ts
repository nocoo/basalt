import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	assertBrowserCleaned,
	assertNoPageFaults,
	assertPinnedChromium,
	attachPageFaults,
	closeChromium,
	combineErrors,
	createBrowserProfileDir,
	launchPinnedChromium,
	missingChromiumError,
	PLAYWRIGHT_INSTALL_COMMAND,
	playwrightChromiumExecutable,
	settleWithCleanup,
	withChromiumPage,
} from "./consumer-browser";
import { listPidsMatching, processAlive } from "./consumer-http";

describe("consumer browser helpers", () => {
	it("diagnoses a missing pinned Chromium with the install command", () => {
		const error = missingChromiumError("/tmp/missing-chromium");
		expect(error.message).toContain("/tmp/missing-chromium");
		expect(error.message).toContain(PLAYWRIGHT_INSTALL_COMMAND);
	});

	it("refuses a system Chrome executable override", () => {
		const previous = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
		process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH =
			"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
		try {
			expect(() => playwrightChromiumExecutable()).toThrow(/not allowed/);
		} finally {
			if (previous === undefined) {
				delete process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
			} else {
				process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH = previous;
			}
		}
	});

	it("uses the pinned Playwright Chromium executable", () => {
		const executablePath = assertPinnedChromium();
		expect(executablePath).toContain("ms-playwright");
		expect(executablePath).not.toContain("Google Chrome.app");
	});

	it("preserves a lone error and aggregates proof plus cleanup failures", () => {
		const proof = new Error("proof-fail");
		expect(combineErrors(proof, null)).toBe(proof);
		expect(combineErrors(null, proof)).toBe(proof);
		expect(combineErrors(proof, new Error("cleanup-fail")).toString()).toMatch(
			/proof-fail[\s\S]*cleanup-fail/,
		);
	});

	it("keeps the original proof error when cleanup succeeds", async () => {
		const proof = new Error("proof-fail");
		await expect(
			settleWithCleanup(
				async () => {
					throw proof;
				},
				async () => {},
			),
		).rejects.toBe(proof);
	});

	it("reports cleanup failure after a successful proof", async () => {
		await expect(
			settleWithCleanup(
				async () => "ok",
				async () => {
					throw new Error("cleanup-fail");
				},
			),
		).rejects.toThrow(/cleanup-fail/);
	});

	it("aggregates proof and cleanup errors", async () => {
		await expect(
			settleWithCleanup(
				async () => {
					throw new Error("proof-fail");
				},
				async () => {
					throw new Error("cleanup-fail");
				},
			),
		).rejects.toThrow(/proof-fail[\s\S]*cleanup-fail/);
	});

	it("rejects any collected console or page error", () => {
		expect(() => assertNoPageFaults([])).not.toThrow();
		expect(() =>
			assertNoPageFaults([{ kind: "console.error", text: "basalt-console-fail" }]),
		).toThrow(/basalt-console-fail/);
		expect(() => assertNoPageFaults([{ kind: "pageerror", text: "basalt-page-fail" }])).toThrow(
			/basalt-page-fail/,
		);
	});

	it("fails the error gate on a real console.error", async () => {
		const profileDir = createBrowserProfileDir();
		await expect(
			withChromiumPage(profileDir, async (page) => {
				const faults = attachPageFaults(page);
				await page.goto("data:text/html,<script>console.error('basalt-console-fail')</script>");
				assertNoPageFaults(faults);
			}),
		).rejects.toThrow(/basalt-console-fail/);
		expect(existsSync(profileDir)).toBe(false);
		expect(listPidsMatching(profileDir)).toEqual([]);
	});

	it("fails the error gate on a real pageerror", async () => {
		const profileDir = createBrowserProfileDir();
		await expect(
			withChromiumPage(profileDir, async (page) => {
				const faults = attachPageFaults(page);
				await page.goto("data:text/html,<script>throw new Error('basalt-page-fail')</script>");
				assertNoPageFaults(faults);
			}),
		).rejects.toThrow(/basalt-page-fail/);
		expect(existsSync(profileDir)).toBe(false);
		expect(listPidsMatching(profileDir)).toEqual([]);
	});

	it("cleans Chromium pid and profile after a failed proof", async () => {
		const profileDir = createBrowserProfileDir();
		let livePid: number | undefined;
		await expect(
			withChromiumPage(profileDir, async () => {
				const pids = listPidsMatching(profileDir);
				expect(pids.length).toBeGreaterThan(0);
				livePid = pids[0];
				throw new Error("forced-fail");
			}),
		).rejects.toThrow(/forced-fail/);
		expect(existsSync(profileDir)).toBe(false);
		expect(listPidsMatching(profileDir)).toEqual([]);
		expect(livePid).toEqual(expect.any(Number));
		expect(processAlive(livePid as number)).toBe(false);
	});

	it("reports context.close failure after killing leftovers and deleting the profile", async () => {
		const profileDir = createBrowserProfileDir();
		const context = await launchPinnedChromium(profileDir);
		const originalClose = context.close.bind(context);
		context.close = async () => {
			await originalClose();
			throw new Error("close-failed");
		};
		await expect(closeChromium(context, profileDir)).rejects.toThrow(/close-failed/);
		expect(existsSync(profileDir)).toBe(false);
		expect(listPidsMatching(profileDir)).toEqual([]);
	});

	it("fails browser cleanup when the profile still exists", () => {
		const leftover = join(tmpdir(), `basalt-pw-leftover-${Date.now()}`);
		mkdirSync(leftover);
		try {
			expect(() => assertBrowserCleaned(leftover)).toThrow(/still exists/);
		} finally {
			rmSync(leftover, { recursive: true, force: true });
		}
	});
});
