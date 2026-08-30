import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { type BrowserContext, chromium, type Page } from "playwright";
import { listPidsMatching, processAlive } from "./consumer-http";

export const PLAYWRIGHT_INSTALL_COMMAND = "bun run playwright:install";
export const NEXT_TOAST_MESSAGE = "basalt-toast-ok";
export const NEXT_TOAST_HOST = "[data-basalt-toast-host]";

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
	toastOutsideRoot: true;
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

export async function assertVisibleToastOutsideRoot(page: Page, timeoutMs = 5000) {
	const hosts = page.locator(NEXT_TOAST_HOST);
	const hostCount = await hosts.count();
	if (hostCount !== 1) {
		throw new Error(
			hostCount === 0
				? "missing data-basalt-toast-host"
				: `duplicate data-basalt-toast-host: ${hostCount}`,
		);
	}
	const toast = hosts.first().locator("[data-sonner-toast]");
	if (timeoutMs > 0) {
		await toast.waitFor({ state: "visible", timeout: timeoutMs }).catch(() => undefined);
	}
	const toastCount = await toast.count();
	if (toastCount === 0) {
		throw new Error("missing [data-sonner-toast] in toast host");
	}
	if (toastCount !== 1) {
		throw new Error(`duplicate [data-sonner-toast] in toast host: ${toastCount}`);
	}
	if (!(await toast.isVisible())) {
		throw new Error("toast in host is hidden");
	}
	const title = toast.locator("[data-title]");
	if (timeoutMs > 0) {
		await title.waitFor({ state: "visible", timeout: timeoutMs }).catch(() => undefined);
	}
	const titleCount = await title.count();
	if (titleCount !== 1) {
		throw new Error(
			titleCount === 0
				? "missing [data-title] on sonner toast"
				: `duplicate [data-title] on sonner toast: ${titleCount}`,
		);
	}
	if (!(await title.isVisible())) {
		throw new Error("toast title is hidden");
	}
	const titleText = (await title.innerText()).replace(/\s+/g, " ").trim();
	if (titleText !== NEXT_TOAST_MESSAGE) {
		throw new Error(
			`toast title ${JSON.stringify(titleText)} does not equal ${JSON.stringify(NEXT_TOAST_MESSAGE)}`,
		);
	}
	const placement = await toast.evaluate((node) => {
		const root = document.querySelector("[data-basalt-root]");
		return {
			inBody: document.body.contains(node),
			inRoot: Boolean(root?.contains(node)),
		};
	});
	if (placement.inRoot) {
		throw new Error("toast is contained by data-basalt-root");
	}
	if (!placement.inBody) {
		throw new Error("toast is not in document.body");
	}
	return { toastOutsideRoot: true as const, inBody: true as const, inRoot: false as const };
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
			toastOutsideRoot: true,
			profileDir,
			executablePath: playwrightChromiumExecutable(),
			browserVersion,
		};
	});
}
