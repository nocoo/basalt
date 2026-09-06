import assert from "node:assert/strict";
import type { Page } from "playwright";

const SLUGS = [
	"hover-card",
	"dialog",
	"alert-dialog",
	"sheet",
	"popover",
	"popover-aschild",
	"popover-aschild-noarrow",
	"tooltip",
	"dropdown-menu",
	"context-menu-panel",
	"context-menu-bare",
	"menu-bar",
] as const;

type ModuleSlug = (typeof SLUGS)[number];

export async function assertConsumerPortal(page: Page) {
	await page.waitForFunction(() => window.auditReady);

	const cases: Array<{
		slug: string;
		open?: boolean;
		forceMount?: true;
		pass: boolean;
		error?: string;
	}> = [];

	for (const slug of SLUGS) {
		for (const entry of [
			{ open: false, expected: 0 },
			{ open: true, expected: 1 },
			{ open: false, forceMount: true as const, expected: 1 },
		]) {
			try {
				await page.evaluate(
					({ s, entry }) => window.auditMount?.(s as ModuleSlug, entry.open, entry.forceMount),
					{ s: slug, entry },
				);
				if (entry.open && slug.startsWith("context-menu")) {
					await page.locator("[data-audit-trigger]").click({ button: "right" });
				}
				await page.waitForTimeout(100);
				const actual = await page.locator("[data-audit-content]").count();
				assert.equal(
					actual,
					entry.expected,
					`${slug} open=${entry.open} forceMount=${entry.forceMount} expected ${entry.expected} but got ${actual}`,
				);

				if (entry.open && slug.startsWith("popover-aschild")) {
					const child = page.locator('[data-audit-child="target"]');
					assert.equal(await child.count(), 1, `${slug} child must be rendered`);
					await page.evaluate(() => {
						window.auditEvents = [];
					});
					await child.click({ position: { x: 4, y: 4 } });
					const evaluation = await page.evaluate(() => {
						const node = document.querySelector('[data-audit-content^="popover-aschild"]');
						const target = document.querySelector('[data-audit-child="target"]');
						return {
							nodeTag: node?.tagName ?? null,
							refTag: window.auditRefTag ?? null,
							sameElement: node === target && !!node,
							arrowCount: node?.querySelectorAll('svg[width="20"][height="10"]').length ?? 0,
							events: window.auditEvents ?? [],
						};
					});
					assert.equal(evaluation.nodeTag, "SECTION", `${slug} DOM tag must be SECTION`);
					assert.equal(evaluation.refTag, "SECTION", `${slug} forwarded ref must point to SECTION`);
					assert.equal(
						evaluation.sameElement,
						true,
						`${slug} content and child must be same element`,
					);
					const expectedArrows = slug === "popover-aschild-noarrow" ? 0 : 1;
					assert.equal(evaluation.arrowCount, expectedArrows, `${slug} arrow count mismatch`);
					assert.deepEqual(
						evaluation.events,
						["child", "content"],
						`${slug} event bubbling order must be child -> content`,
					);
				}

				cases.push({ slug, ...entry, pass: true });
			} catch (e) {
				cases.push({ slug, ...entry, pass: false, error: String(e) });
				throw e;
			}
		}

		try {
			await page.evaluate(() => window.auditUnmount?.());
			await page.locator("[data-unmounted]").waitFor();
			await page.waitForTimeout(100);

			const beforeClicks = await page.evaluate(() => window.auditOutsideClicks ?? 0);
			await page.locator("#outside-portal").click();
			await page.locator("#outside-portal").focus();

			const state = await page.evaluate(() => ({
				clicks: window.auditOutsideClicks ?? 0,
				active: document.activeElement?.id,
				hidden:
					document.querySelector("#outside-portal")?.closest('[aria-hidden="true"],[inert]') !==
					null,
				pointerEvents: getComputedStyle(document.body).pointerEvents,
				content: document.querySelectorAll("[data-audit-content]").length,
			}));

			assert.equal(
				state.clicks,
				beforeClicks + 1,
				`${slug} unmount: outside button click count must increment by exactly 1 (expected ${beforeClicks + 1}, got ${state.clicks})`,
			);
			assert.equal(
				state.active,
				"outside-portal",
				`${slug} unmount: outside button should have focus`,
			);
			assert.equal(state.hidden, false, `${slug} unmount: background should not be aria-hidden`);
			assert.notEqual(
				state.pointerEvents,
				"none",
				`${slug} unmount: pointer-events on body should not be none`,
			);
			assert.equal(state.content, 0, `${slug} unmount: content elements should be cleaned up`);
			cases.push({ slug, pass: true });
		} catch (e) {
			cases.push({ slug, pass: false, error: String(e) });
			throw e;
		}
	}

	return {
		passed: true,
		total: cases.length,
	};
}
