import assert from "node:assert/strict";
import type { Page } from "playwright";
import { assertNoPageFaults, attachPageFaults } from "./consumer-browser";

/**
 * Validates ThemeProvider and AccentProvider contracts across Standalone and Tailwind consumer setups.
 * Covers:
 * - Real localStorage getter rejection survival (complete denial)
 * - setItem write rejection survival: preserves in-memory switch (dark/rose),
 *   underlying storage retains old value (light/primary), bare storage event does not roll back,
 *   and system media query emulation updates dark mode correctly
 * - Custom storageKey isolation and persist=false zero storage access (isolated by full navigation)
 * - Controlled mode: host external update does not invoke onChange callback, parent rejection preserves
 *   in-memory state while logging requests, setAccept(true) permits child requests to alter parent state,
 *   and applyToDocument=false ensures host DOM attributes remain untouched
 * - Same-document multiple provider instances (twins) bidirectionally synchronize
 * - Same-context multiple actual browser tabs synchronize via real trusted storage events
 */
export async function assertConsumerProviders(page: Page) {
	const providersUrl = page.url();

	// Helper to reset and reload the page cleanly between isolated test cases
	const resetPage = async () => {
		await page.goto(providersUrl, { waitUntil: "domcontentloaded" });
		await page.waitForFunction(() => Boolean(window.providerAudit?.ready));
		await page.evaluate(() => {
			try {
				localStorage.clear();
			} catch {
				// ignore in getter-denial cases
			}
		});
	};

	// Helper to wait for specific preference text ("theme/accent") on an output element
	const waitForValue = async (expected: string, name = "one") => {
		await page.waitForFunction(
			({ n, exp }) => document.getElementById(`${n}-value`)?.textContent?.trim() === exp,
			{ n: name, exp: expected },
		);
	};

	// Helper to read document root classes/attributes
	const readRootState = async () => {
		return page.evaluate(() => ({
			mode: document.documentElement.dataset.mode,
			accent: document.documentElement.dataset.accent,
			classList: Array.from(document.documentElement.classList),
		}));
	};

	// ------------------------------------------------------------------------
	// Test 1: Complete storage denial (localStorage getter throws)
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		Object.defineProperty(window, "localStorage", {
			configurable: true,
			get() {
				throw new DOMException("Security access prohibited", "SecurityError");
			},
		});
		window.providerAudit?.mount({
			themeProps: { defaultTheme: "light" },
			accentProps: { defaultAccent: "primary" },
		});
	});

	await waitForValue("light/primary");
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose");

	// ------------------------------------------------------------------------
	// Test 2: setItem rejection (write-denial), bare storage survival, system media
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		localStorage.setItem("theme", "light");
		localStorage.setItem("basalt-accent", "primary");
		Object.defineProperty(Storage.prototype, "setItem", {
			configurable: true,
			value() {
				throw new DOMException("QuotaExceededError", "QuotaExceededError");
			},
		});
		window.providerAudit?.mount({
			themeProps: { defaultTheme: "system" },
			accentProps: { defaultAccent: "primary" },
		});
	});

	await waitForValue("light/primary");

	// Switch theme to dark and accent to rose
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose");

	// Verify root element updated
	let root = await readRootState();
	assert.equal(root.mode, "dark");
	assert.equal(root.accent, "rose");

	// Bare storage event must NOT roll back the in-memory failure state
	await page.evaluate(() => {
		window.dispatchEvent(new Event("storage"));
	});
	await waitForValue("dark/rose");

	// Underlying storage must still contain old values (since setItem rejected)
	const storageSnapshot = await page.evaluate(() => ({
		theme: localStorage.getItem("theme"),
		accent: localStorage.getItem("basalt-accent"),
	}));
	assert.equal(storageSnapshot.theme, "light");
	assert.equal(storageSnapshot.accent, "primary");

	// Switch to system and verify media emulation updates classList
	await page.locator("#one-system").click();
	await page.emulateMedia({ colorScheme: "dark" });
	await page.waitForFunction(() => document.documentElement.classList.contains("dark"));

	await page.emulateMedia({ colorScheme: "light" });
	await page.waitForFunction(() => document.documentElement.classList.contains("light"));

	// ------------------------------------------------------------------------
	// Test 3a: Custom keys isolation
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		localStorage.setItem("theme", "system");
		localStorage.setItem("basalt-accent", "sky");
		localStorage.setItem("custom-theme", "light");
		localStorage.setItem("custom-accent", "primary");

		window.providerAudit?.mount({
			themeProps: { storageKey: "custom-theme" },
			accentProps: { storageKey: "custom-accent" },
		});
	});

	await waitForValue("light/primary");
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose");

	// Verify isolation: standard keys untouched, custom keys updated
	const keysAfter = await page.evaluate(() => ({
		theme: localStorage.getItem("theme"),
		accent: localStorage.getItem("basalt-accent"),
		customTheme: localStorage.getItem("custom-theme"),
		customAccent: localStorage.getItem("custom-accent"),
	}));
	assert.equal(keysAfter.theme, "system");
	assert.equal(keysAfter.accent, "sky");
	assert.equal(keysAfter.customTheme, "dark");
	assert.equal(keysAfter.customAccent, "rose");

	// ------------------------------------------------------------------------
	// Test 3b: persist=false performs zero storage access
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		(window as unknown as { storageAccessCount: number }).storageAccessCount = 0;
		Object.defineProperty(window, "localStorage", {
			configurable: true,
			get() {
				(window as unknown as { storageAccessCount: number }).storageAccessCount++;
				throw new Error("localStorage should not be touched when persist=false");
			},
		});
		window.providerAudit?.mount({
			themeProps: { persist: false, defaultTheme: "light" },
			accentProps: { persist: false, defaultAccent: "primary" },
		});
	});

	await waitForValue("light/primary");
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose");

	const accessCount = await page.evaluate(
		() => (window as unknown as { storageAccessCount: number }).storageAccessCount,
	);
	assert.equal(accessCount, 0, "persist=false must perform 0 localStorage accesses");

	// ------------------------------------------------------------------------
	// Test 4: Controlled mode, external update, parent rejection/acceptance, applyToDocument=false
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		// Mock host classes on document root
		document.documentElement.className = "host-app-root";
		document.documentElement.dataset.mode = "host-mode";
		document.documentElement.dataset.accent = "host-accent";

		window.providerAudit?.mount({
			controlled: true,
			themeProps: {
				persist: false,
				applyToDocument: false,
				defaultTheme: "light",
			},
			accentProps: {
				persist: false,
				applyToDocument: false,
				defaultAccent: "primary",
			},
		});
	});

	await waitForValue("light/primary");

	// Verify external host updates do NOT invoke onChange callback / record requests
	await page.evaluate(() => {
		window.providerAudit?.hostApi?.setTheme("dark");
		window.providerAudit?.hostApi?.setAccent("rose");
	});
	await waitForValue("dark/rose");
	let loggedRequests = await page.evaluate(() => window.providerAudit?.hostApi?.requests ?? []);
	assert.deepEqual(loggedRequests, [], "external host updates must not trigger requests");

	// Return to light/primary externally
	await page.evaluate(() => {
		window.providerAudit?.hostApi?.setTheme("light");
		window.providerAudit?.hostApi?.setAccent("primary");
	});
	await waitForValue("light/primary");

	// Child clicks while acceptRequests=false (parent rejection)
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();

	// Value stays light/primary because parent policy rejected
	await waitForValue("light/primary");
	loggedRequests = await page.evaluate(() => window.providerAudit?.hostApi?.requests ?? []);
	assert.deepEqual(loggedRequests, [
		["theme", "dark"],
		["accent", "rose"],
	]);

	// Now set acceptRequests=true and wait for state commit
	await page.evaluate(() => {
		window.providerAudit?.hostApi?.setAccept(true);
	});
	await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));

	// Click child buttons again; now parent accepts and state changes
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose");

	loggedRequests = await page.evaluate(() => window.providerAudit?.hostApi?.requests ?? []);
	assert.deepEqual(loggedRequests, [
		["theme", "dark"],
		["accent", "rose"],
		["theme", "dark"],
		["accent", "rose"],
	]);

	// Verify applyToDocument=false did not pollute host root classes/attributes
	root = await readRootState();
	assert.equal(root.mode, "host-mode");
	assert.equal(root.accent, "host-accent");
	assert.ok(root.classList.includes("host-app-root"));

	// ------------------------------------------------------------------------
	// Test 5: Same-document multiple provider instances (twins) synchronization
	// ------------------------------------------------------------------------
	await resetPage();
	await page.evaluate(() => {
		window.providerAudit?.mount({
			twins: true,
			themeProps: { defaultTheme: "light" },
			accentProps: { defaultAccent: "primary" },
		});
	});

	await waitForValue("light/primary", "one");
	await waitForValue("light/primary", "two");

	// Switch from instance 1 -> instance 2 receives update
	await page.locator("#one-dark").click();
	await page.locator("#one-rose").click();
	await waitForValue("dark/rose", "one");
	await waitForValue("dark/rose", "two");

	// Switch from instance 2 -> instance 1 receives update
	await page.locator("#two-light").click();
	await page.locator("#two-primary").click();
	await waitForValue("light/primary", "one");
	await waitForValue("light/primary", "two");

	// ------------------------------------------------------------------------
	// Test 6: Cross-tab trusted storage synchronization (two actual pages in context)
	// ------------------------------------------------------------------------
	await resetPage();
	const context = page.context();
	const page2 = await context.newPage();
	const faults2 = attachPageFaults(page2);

	try {
		await page.evaluate(() => {
			(
				window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> }
			).trustedStorageEvents = [];
			window.addEventListener("storage", (e) => {
				if (e.isTrusted && e.key) {
					(
						window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> }
					).trustedStorageEvents.push({
						key: e.key,
						value: e.newValue ?? "",
					});
				}
			});
			window.providerAudit?.mount({
				themeProps: { defaultTheme: "light" },
				accentProps: { defaultAccent: "primary" },
			});
		});

		await page2.goto(providersUrl, { waitUntil: "domcontentloaded" });
		await page2.waitForFunction(() => Boolean(window.providerAudit?.ready));
		await page2.evaluate(() => {
			(
				window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> }
			).trustedStorageEvents = [];
			window.addEventListener("storage", (e) => {
				if (e.isTrusted && e.key) {
					(
						window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> }
					).trustedStorageEvents.push({
						key: e.key,
						value: e.newValue ?? "",
					});
				}
			});
			window.providerAudit?.mount({
				themeProps: { defaultTheme: "light" },
				accentProps: { defaultAccent: "primary" },
			});
		});

		await waitForValue("light/primary", "one");
		await page2.waitForFunction(
			() => document.getElementById("one-value")?.textContent?.trim() === "light/primary",
		);

		// Click dark & rose on tab 1
		await page.locator("#one-dark").click();
		await page.locator("#one-rose").click();

		// Tab 2 must receive trusted storage updates and change rendered text
		await page2.waitForFunction(
			() => document.getElementById("one-value")?.textContent?.trim() === "dark/rose",
		);

		// Assert page2 received real trusted storage events
		const page2Events = await page2.evaluate(
			() =>
				(window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> })
					.trustedStorageEvents,
		);
		assert.ok(
			page2Events.some((e) => e.key === "theme" && e.value === "dark"),
			"page2 must observe trusted storage event for theme",
		);
		assert.ok(
			page2Events.some((e) => e.key === "basalt-accent" && e.value === "rose"),
			"page2 must observe trusted storage event for accent",
		);

		// Click light on tab 2 -> Tab 1 receives trusted storage updates
		await page2.locator("#one-light").click();
		await waitForValue("light/rose", "one");

		const page1Events = await page.evaluate(
			() =>
				(window as unknown as { trustedStorageEvents: Array<{ key: string; value: string }> })
					.trustedStorageEvents,
		);
		assert.ok(
			page1Events.some((e) => e.key === "theme" && e.value === "light"),
			"page1 must observe trusted storage event for theme",
		);

		assertNoPageFaults(faults2);
	} finally {
		await page2.close();
		await resetPage();
	}

	return {
		getterDenialFallback: true,
		writeDenialMemoryRetained: true,
		bareStorageNoRollback: true,
		systemMediaResponsive: true,
		customKeyIsolation: true,
		persistFalseZeroStorageAccess: true,
		controlledHostOwnership: true,
		sameDocumentTwinsSync: true,
		crossTabTrustedStorageSync: true,
	};
}
