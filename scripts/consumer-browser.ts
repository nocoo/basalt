import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type BrowserContext, chromium, type Page } from "playwright";
import { listPidsMatching, processAlive } from "./consumer-http";

export const PLAYWRIGHT_INSTALL_COMMAND = "bun run playwright:install";
export const NEXT_TOAST_MESSAGE = "basalt-toast-ok";
export const NEXT_TOAST_HOST = "[data-basalt-toast-host]";

export type ToastHostEvidence = {
	hostFound: boolean;
	ownCount: number;
	count: number;
	inBody: boolean;
	inRoot: boolean;
	visible: boolean;
};

export type PageFault = {
	kind: "console.error" | "pageerror";
	text: string;
};

export type HydrationEvidence = {
	url: string;
	marker: true;
	hydrated: true;
	buttonChanged: true;
	themeBefore: { className: string; mode: string };
	themeAfter: { className: string; mode: string };
	toastPortal: true;
	profileDir: string;
	executablePath: string;
	browserVersion: string;
};

export function missingChromiumError(executablePath: string) {
	return new Error(
		`Playwright Chromium is missing at ${executablePath}. Install the pinned browser with: ${PLAYWRIGHT_INSTALL_COMMAND}`,
	);
}

export function playwrightChromiumExecutable() {
	if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
		throw new Error(
			"PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is not allowed; use the pinned Playwright Chromium",
		);
	}
	return chromium.executablePath();
}

export function assertPinnedChromium() {
	const executablePath = playwrightChromiumExecutable();
	if (!existsSync(executablePath)) {
		throw missingChromiumError(executablePath);
	}
	return executablePath;
}

export function attachPageFaults(page: Page): PageFault[] {
	const faults: PageFault[] = [];
	page.on("console", (message) => {
		if (message.type() === "error") {
			const location = message.location();
			const where = location.url ? ` ${location.url}` : "";
			faults.push({ kind: "console.error", text: `${message.text()}${where}` });
		}
	});
	page.on("pageerror", (error) => {
		faults.push({ kind: "pageerror", text: error.message });
	});
	return faults;
}

export function assertNoPageFaults(faults: PageFault[]) {
	if (faults.length > 0) {
		throw new Error(
			`browser errors: ${faults.map((fault) => `${fault.kind}: ${fault.text}`).join("\n")}`,
		);
	}
}

export function combineErrors(primary: unknown, extra: unknown): unknown {
	if (extra == null) {
		return primary;
	}
	if (primary == null) {
		return extra;
	}
	const first = primary instanceof Error ? primary.message : String(primary);
	const second = extra instanceof Error ? extra.message : String(extra);
	return new Error(`${first}\n${second}`);
}

export async function settleWithCleanup<T>(
	proof: () => Promise<T>,
	cleanup: () => Promise<void>,
): Promise<T> {
	let proofError: unknown;
	let cleanupError: unknown;
	let result: T | undefined;
	try {
		result = await proof();
	} catch (error) {
		proofError = error;
	} finally {
		try {
			await cleanup();
		} catch (error) {
			cleanupError = error;
		}
	}
	if (cleanupError != null) {
		throw combineErrors(proofError, cleanupError);
	}
	if (proofError) {
		throw proofError;
	}
	return result as T;
}

export function createBrowserProfileDir() {
	return mkdtempSync(join(tmpdir(), "basalt-pw-"));
}

export function assertBrowserCleaned(profileDir: string, pid?: number) {
	if (pid !== undefined && processAlive(pid)) {
		throw new Error(`Chromium PID ${pid} still alive`);
	}
	if (existsSync(profileDir)) {
		throw new Error(`Playwright profile still exists: ${profileDir}`);
	}
	const leftover = listPidsMatching(profileDir);
	if (leftover.length > 0) {
		throw new Error(`leftover Chromium ${leftover.join(", ")} for ${profileDir}`);
	}
}

async function waitForPidsGone(profileDir: string, timeoutMs: number) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (listPidsMatching(profileDir).length === 0) {
			return;
		}
		await new Promise((resolve) => setTimeout(resolve, 50));
	}
}

export async function closeChromium(context: BrowserContext | undefined, profileDir: string) {
	let closeError: unknown;
	try {
		await context?.close();
	} catch (error) {
		closeError = error;
	}
	await waitForPidsGone(profileDir, 3000);
	for (const pid of listPidsMatching(profileDir)) {
		try {
			process.kill(pid, "SIGKILL");
		} catch {
			// already gone
		}
	}
	await waitForPidsGone(profileDir, 2000);
	let profileError: unknown;
	try {
		rmSync(profileDir, { recursive: true, force: true });
		assertBrowserCleaned(profileDir);
	} catch (error) {
		profileError = error;
	}
	if (closeError != null || profileError != null) {
		throw combineErrors(closeError, profileError);
	}
}

export async function launchPinnedChromium(profileDir: string) {
	const executablePath = assertPinnedChromium();
	return chromium.launchPersistentContext(profileDir, {
		headless: true,
		executablePath,
	});
}

export async function withChromiumPage<T>(
	profileDir: string,
	fn: (page: Page, context: BrowserContext) => Promise<T>,
): Promise<T> {
	let context: BrowserContext | undefined;
	return settleWithCleanup(
		async () => {
			context = await launchPinnedChromium(profileDir);
			const page = context.pages()[0] ?? (await context.newPage());
			return fn(page, context);
		},
		async () => {
			await closeChromium(context, profileDir);
		},
	);
}

export function assertToastHostEvidence(evidence: ToastHostEvidence) {
	if (!evidence.hostFound) {
		throw new Error("missing data-basalt-toast-host");
	}
	if (evidence.count === 0 && evidence.ownCount > 0) {
		throw new Error("toast message in host is hidden");
	}
	if (evidence.count === 0) {
		throw new Error("missing visible toast message in toast host");
	}
	if (evidence.count !== 1) {
		throw new Error(`duplicate visible toast messages in toast host: ${evidence.count}`);
	}
	if (!evidence.visible) {
		throw new Error("toast message in host is hidden");
	}
	if (evidence.inRoot) {
		throw new Error("toast message is contained by data-basalt-root");
	}
	if (!evidence.inBody) {
		throw new Error("toast message is not in document.body");
	}
}

export async function readToastHostEvidence(
	page: Page,
	message = NEXT_TOAST_MESSAGE,
): Promise<ToastHostEvidence> {
	return page.evaluate((msg) => {
		const root = document.querySelector("[data-basalt-root]");
		const host = document.querySelector("[data-basalt-toast-host]");
		if (!host) {
			return {
				hostFound: false,
				ownCount: 0,
				count: 0,
				inBody: false,
				inRoot: false,
				visible: false,
			};
		}
		const isHidden = (el: Element) => {
			if (!(el instanceof HTMLElement)) {
				return true;
			}
			if (el.hidden) {
				return true;
			}
			const style = getComputedStyle(el);
			return style.display === "none" || style.visibility === "hidden";
		};
		const isVisible = (el: Element) => {
			if (isHidden(el)) {
				return false;
			}
			let current: HTMLElement | null = el instanceof HTMLElement ? el : null;
			while (current) {
				if (current !== el && isHidden(current)) {
					return false;
				}
				const rect = current.getBoundingClientRect();
				if (rect.width > 0 && rect.height > 0) {
					return true;
				}
				if (current === host) {
					break;
				}
				current = current.parentElement;
			}
			return false;
		};
		const ownMatch = (el: Element) => {
			if (el.matches("script, style, noscript, template")) {
				return false;
			}
			if (!(el.textContent ?? "").includes(msg)) {
				return false;
			}
			return ![...el.children].some((child) => (child.textContent ?? "").includes(msg));
		};
		const matches = [host, ...host.querySelectorAll("*")].filter(ownMatch);
		const visible = matches.filter(isVisible);
		const node = visible[0];
		return {
			hostFound: true,
			ownCount: matches.length,
			count: visible.length,
			inBody: Boolean(node && document.body.contains(node)),
			inRoot: Boolean(node && root?.contains(node)),
			visible: Boolean(node && isVisible(node)),
		};
	}, message);
}

export async function assertVisibleToastOutsideRoot(
	page: Page,
	message = NEXT_TOAST_MESSAGE,
	timeoutMs = 5000,
) {
	const deadline = Date.now() + timeoutMs;
	while (true) {
		const evidence = await readToastHostEvidence(page, message);
		try {
			assertToastHostEvidence(evidence);
			return evidence;
		} catch (error) {
			if (Date.now() >= deadline) {
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, 50));
		}
	}
}

async function htmlTheme(page: Page) {
	return page.evaluate(() => ({
		className: document.documentElement.className,
		mode: document.documentElement.dataset.mode ?? "",
	}));
}

export async function proveNextHydration(
	url: string,
	profileDir: string,
): Promise<HydrationEvidence> {
	return withChromiumPage(profileDir, async (page, context) => {
		const faults = attachPageFaults(page);
		await page.goto(url, { waitUntil: "domcontentloaded" });
		const marker = page.locator('[data-basalt-consumer="next19"]');
		if (!(await marker.isVisible())) {
			throw new Error("HTTP first screen marker not visible");
		}
		const markerText = (await marker.innerText()).trim();
		if (!markerText.includes("basalt-next19-ok")) {
			throw new Error("missing HTTP marker in DOM");
		}

		await page.locator('[data-basalt-root][data-hydrated="true"]').waitFor({ timeout: 15_000 });

		const save = page.locator("[data-basalt-save]");
		const beforeSave = (await save.textContent()) ?? "";
		await save.click();
		await page.waitForFunction((previous) => {
			const el = document.querySelector("[data-basalt-save]");
			return (el?.textContent ?? "") !== previous;
		}, beforeSave);

		const themeBefore = await htmlTheme(page);
		const toggle = page.getByRole("button", { name: "Toggle theme" });
		let themeAfter = themeBefore;
		for (let i = 0; i < 3; i += 1) {
			await toggle.click();
			themeAfter = await htmlTheme(page);
			if (themeAfter.className !== themeBefore.className || themeAfter.mode !== themeBefore.mode) {
				break;
			}
		}
		if (themeAfter.className === themeBefore.className && themeAfter.mode === themeBefore.mode) {
			throw new Error("ThemeToggle did not change html theme state");
		}

		await page.locator("[data-basalt-toast]").click();
		await assertVisibleToastOutsideRoot(page);

		assertNoPageFaults(faults);
		const browser = context.browser();
		const browserVersion = browser ? browser.version() : "";
		if (!browserVersion) {
			throw new Error("Playwright did not report a Chromium version");
		}
		return {
			url,
			marker: true,
			hydrated: true,
			buttonChanged: true,
			themeBefore,
			themeAfter,
			toastPortal: true,
			profileDir,
			executablePath: playwrightChromiumExecutable(),
			browserVersion,
		};
	});
}
