import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Locator, Page } from "playwright";
import { assertMovingHighlight } from "./showcase-hover";
import { setShowcaseTheme } from "./showcase-theme";

async function flushHighlight(node: Locator) {
	await node.evaluate(
		() =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			),
	);
}

async function settleHighlight(node: Locator) {
	await flushHighlight(node);
	await node.evaluate(async (element) => {
		await Promise.allSettled(
			element.getAnimations({ subtree: true }).map((animation) => animation.finished),
		);
	});
	await flushHighlight(node);
}

async function highlightMotion(nav: Locator) {
	return nav.evaluate((node) => {
		const style = getComputedStyle(node, "::before");
		const transform = new DOMMatrix(style.transform);
		return {
			visible: node instanceof HTMLElement ? node.dataset.hoverVisible : undefined,
			animated: node instanceof HTMLElement ? node.dataset.hoverAnimated : undefined,
			y: transform.m42,
			spatial: node
				.getAnimations({ subtree: true })
				.filter(
					(animation) =>
						animation instanceof CSSTransition && animation.transitionProperty === "transform",
				).length,
		};
	});
}

async function itemOffsetY(item: Locator) {
	return item.evaluate((node) => {
		const root = node.closest("nav");
		if (!(root instanceof HTMLElement)) return Number.NaN;
		return (
			node.getBoundingClientRect().y -
			root.getBoundingClientRect().y +
			root.scrollTop -
			root.clientTop
		);
	});
}

async function leaveNav(sidebar: Locator, nav: Locator) {
	await sidebar.locator("[data-slot='sidebar-header']").hover();
	await settleHighlight(nav);
}

async function assertSidebarHoverSnap(nav: Locator, item: Locator, label: string) {
	await item.hover();
	await flushHighlight(nav);
	const motion = await highlightMotion(nav);
	assert.equal(motion.spatial, 0, label);
	assert.equal(motion.animated, "false", label);
	assert.equal(motion.visible, "true", label);
	assert.ok(
		Math.abs(motion.y - (await itemOffsetY(item))) < 1,
		`${label}: ${JSON.stringify(motion)}`,
	);
}

async function startSidebarFlight(nav: Locator) {
	await nav.evaluate(async (node) => {
		const rows = node.querySelectorAll("[data-basalt-hover-item]");
		const frame = () =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			);
		node.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
		rows[0].dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
		await frame();
		// Drain the newly observed row's initial resize delivery before testing motion.
		await frame();
		rows[1].dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
		await frame();
		const transition = node
			.getAnimations({ subtree: true })
			.find(
				(animation) =>
					animation instanceof CSSTransition && animation.transitionProperty === "transform",
			);
		if (!transition)
			throw new Error(
				`Missing row-to-row transition before interruption: ${node.getAttribute("data-hover-animated")}, ${getComputedStyle(node, "::before").transition}`,
			);
	});
}

async function assertSidebarPointerHover(
	page: Page,
	sidebar: Locator,
	nav: Locator,
	collapsed: boolean,
) {
	const rows = nav.locator("[data-basalt-hover-item]:not([disabled]):not([data-disabled])");
	const target = nav.locator("[data-basalt-hover-item]:not([data-hover-selected='true'])").first();
	await leaveNav(sidebar, nav);
	assert.equal(await nav.getAttribute("data-hover-visible"), "false");
	await assertSidebarHoverSnap(
		nav,
		target,
		collapsed ? "collapsed entry snaps" : "initial entry snaps",
	);
	const active = nav.locator("[data-hover-selected='true']").first();
	if ((await active.count()) > 0) {
		await active.focus();
		await leaveNav(sidebar, nav);
		await assertSidebarHoverSnap(nav, target, "stale focus cannot seed entry");
	}
	const lastY = await itemOffsetY(target);
	if (!collapsed) {
		await nav.locator("[data-slot='sidebar-group-label']").first().hover();
		await flushHighlight(nav);
		const group = await highlightMotion(nav);
		assert.equal(group.visible, "false", "disclosure has no hover destination");
		assert.equal(group.spatial, 0, "gap must not fly to focused route");
		assert.ok(
			Math.abs(group.y - lastY) < 1,
			`gap exit stays at last hovered row: ${JSON.stringify(group)}`,
		);
		const partition = nav.locator("[data-slot='sidebar-partition']");
		if ((await partition.count()) > 0) {
			await assertSidebarHoverSnap(nav, target, "entry before partition snaps");
			const partitionY = await itemOffsetY(target);
			await partition.first().hover();
			await flushHighlight(nav);
			const parted = await highlightMotion(nav);
			assert.equal(parted.visible, "false", "partition has no hover destination");
			assert.equal(parted.spatial, 0, "partition must not fly");
			assert.ok(Math.abs(parted.y - partitionY) < 1, JSON.stringify(parted));
		}
		await assertSidebarHoverSnap(nav, target, "entry before root gap snaps");
	}
	const gapY = collapsed ? lastY : await itemOffsetY(target);
	await nav.hover({ position: { x: 2, y: 2 } });
	await flushHighlight(nav);
	const rootGap = await highlightMotion(nav);
	assert.equal(rootGap.visible, "false", "root padding is a non-item gap");
	assert.equal(rootGap.spatial, 0, "root gap must not fly");
	assert.ok(
		Math.abs(rootGap.y - gapY) < 1,
		`root gap exit stays at last hovered row: ${JSON.stringify(rootGap)}`,
	);
	if (collapsed) return;
	await assertSidebarHoverSnap(nav, rows.first(), "entry after gap snaps");
	await nav.evaluate((node) => {
		node.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
		node
			.querySelectorAll("[data-basalt-hover-item]")[1]
			?.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
	});
	await flushHighlight(nav);
	const rapid = await highlightMotion(nav);
	assert.equal(rapid.spatial, 0, "same-frame leave/enter must reset interpolation");
	assert.equal(rapid.animated, "false", "same-frame reentry snaps");
	assert.ok(
		Math.abs(rapid.y - (await itemOffsetY(rows.nth(1)))) < 1,
		`same-frame reentry snaps to new row: ${JSON.stringify(rapid)}`,
	);
	await rows.first().hover();
	await settleHighlight(nav);
	await nav.evaluate((node) => {
		node.style.setProperty("--basalt-motion-normal", "1000ms");
	});
	try {
		await startSidebarFlight(nav);
		await nav.evaluate((node) => {
			const item = node.querySelectorAll("[data-basalt-hover-item]")[1];
			node.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
			item.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
		});
		await flushHighlight(nav);
		const sameTarget = await highlightMotion(nav);
		assert.equal(sameTarget.spatial, 0, "same-target reentry cancels the previous transition");
		assert.equal(sameTarget.animated, "false", "same-target reentry snaps");
		assert.ok(Math.abs(sameTarget.y - (await itemOffsetY(rows.nth(1)))) < 1);
		for (const event of ["pointerover", "pointerleave"]) {
			await startSidebarFlight(nav);
			await nav.evaluate((node, type) => {
				node.dispatchEvent(new PointerEvent(type, { pointerType: "mouse" }));
			}, event);
			await flushHighlight(nav);
			const exit = await highlightMotion(nav);
			assert.equal(exit.visible, "false", `${event} hides at the last hovered row`);
			assert.equal(exit.spatial, 0, `${event} cancels the in-flight transform`);
			assert.equal(exit.animated, "false", `${event} disables spatial motion`);
			assert.ok(Math.abs(exit.y - (await itemOffsetY(rows.nth(1)))) < 1);
			await flushHighlight(nav);
			assert.equal((await highlightMotion(nav)).y, exit.y, `${event} exit geometry is stable`);
		}
	} finally {
		await nav.evaluate((node) => node.style.removeProperty("--basalt-motion-normal"));
	}
	await leaveNav(sidebar, nav);
	if ((await active.count()) > 0) await active.focus();
	// WebKit's default macOS tab order needs Option-Tab to include native buttons.
	const tabKey = page.context().browser()?.browserType().name() === "webkit" ? "Alt+Tab" : "Tab";
	await page.keyboard.press(tabKey);
	const focused = await nav.evaluate((node) => {
		const el = document.activeElement;
		return {
			inside: node.contains(el),
			outline: el ? getComputedStyle(el).outlineWidth : "",
			offset: el ? getComputedStyle(el).outlineOffset : "",
		};
	});
	assert.ok(focused.inside, JSON.stringify(focused));
	assert.equal(focused.outline, "1px", JSON.stringify(focused));
	assert.equal(focused.offset, "-2px", JSON.stringify(focused));
}

async function assertNavigationGeometry(sidebar: Locator, collapsed: boolean, inset = 8) {
	const geometry = await sidebar.evaluate((node) => {
		const nav = node.querySelector("nav") as HTMLElement;
		const box = node.getBoundingClientRect();
		const rows = Array.from(nav.querySelectorAll<HTMLElement>("[data-basalt-hover-item]"));
		return {
			width: box.width,
			padding: getComputedStyle(nav).padding,
			firstTop:
				rows[0].getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop,
			rows: rows.map((row) => ({
				left: row.getBoundingClientRect().left - box.left,
				height: row.getBoundingClientRect().height,
				padding: getComputedStyle(row).padding,
			})),
			centers: Array.from(node.querySelectorAll("button svg"), (icon) => {
				const rect = icon.getBoundingClientRect();
				return rect.x + rect.width / 2 - box.x;
			}),
		};
	});
	assert.equal(geometry.padding, `${inset}px`);
	assert.equal(geometry.firstTop, inset);
	assert.ok(
		geometry.rows.every((row) => row.height === 38),
		JSON.stringify(geometry),
	);
	if (collapsed) {
		assert.equal(geometry.width, 68);
		assert.ok(
			geometry.centers.every((center) => Math.abs(center - 34) < 1),
			JSON.stringify(geometry),
		);
	} else {
		assert.ok(
			geometry.rows.every((row) => row.left === inset && row.padding === "8px"),
			JSON.stringify(geometry),
		);
	}
}

export async function assertNavigationLists(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 1000 });
		for (const dark of [false, true]) {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.mouse.move(width - 1, 0);
			await page.goto(`${baseUrl}/ui/sidebar`);
			const sidebar = page.locator("[data-hero-scenario] [data-basalt-sidebar]");
			await sidebar.waitFor();
			await setShowcaseTheme(page, dark);
			await sidebar.evaluate((node) => ((node as HTMLElement).style.height = "480px"));
			await assertNavigationGeometry(sidebar, false);
			const expanded = await sidebar.evaluate((node) => node.outerHTML);
			const nav = sidebar.getByRole("navigation");
			await flushHighlight(nav);
			assert.equal(await nav.getAttribute("data-hover-visible"), "false", "mount has no hover");
			await page.emulateMedia({ reducedMotion: "no-preference" });
			await assertSidebarPointerHover(page, sidebar, nav, false);
			await assertMovingHighlight(nav);
			await sidebar.evaluate((node) => (node as HTMLElement).style.setProperty("--spacing", "9px"));
			await assertNavigationGeometry(sidebar, false);
			await sidebar.evaluate((node) =>
				(node as HTMLElement).style.setProperty("--basalt-space-nav-inset", "4px"),
			);
			await assertNavigationGeometry(sidebar, false, 4);
			await sidebar.evaluate((node) =>
				(node as HTMLElement).style.removeProperty("--basalt-space-nav-inset"),
			);
			const last = nav.getByRole("button", { name: "Daily activity notes" });
			await last.focus();
			await last.press("Enter");
			assert.equal(await last.getAttribute("aria-current"), "page");
			const bottom = await last.boundingBox();
			const viewport = await nav.boundingBox();
			assert.ok(bottom && viewport && bottom.y + bottom.height <= viewport.y + viewport.height + 1);
			await sidebar.getByRole("button", { name: "Collapse navigation example" }).click();
			await sidebar.evaluate(async (node) => {
				await new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
				);
				await Promise.allSettled(
					node.getAnimations({ subtree: true }).map((animation) => animation.finished),
				);
			});
			await assertNavigationGeometry(sidebar, true);
			await assertSidebarPointerHover(page, sidebar, nav, true);
			await assertMovingHighlight(nav);
			await page.emulateMedia({ reducedMotion: "reduce" });
			await nav.getByRole("button", { name: "New chat" }).hover();
			assert.equal(
				await nav.evaluate((node) => getComputedStyle(node, "::before").transitionDuration),
				"0s",
			);
			const collapsed = await sidebar.evaluate((node) => node.outerHTML);
			for (const [markup, state] of [
				[expanded, false],
				[collapsed, true],
			] as const) {
				await page.setContent(`<style>${css}</style>${markup}`);
				await page.evaluate(
					(dark) => (document.documentElement.dataset.mode = dark ? "dark" : "light"),
					dark,
				);
				await assertNavigationGeometry(page.locator("[data-basalt-sidebar]"), state);
			}
		}
	}
	await page.emulateMedia({ reducedMotion: "no-preference" });
	for (const slug of ["navigation-menu", "editable-nav-item"]) {
		await page.goto(`${baseUrl}/ui/${slug}`);
		const list = page.locator("[data-hero-scenario] .basalt-hover-list");
		await list.waitFor();
		await assertMovingHighlight(list);
		assert.equal(await list.evaluate((node) => getComputedStyle(node).padding), "8px");
	}
	return {
		viewports: 2,
		themes: 2,
		cssEntrypoints: 2,
		rowHeight: 38,
		railAxis: 34,
		inset: 8,
		navigationFamilies: 3,
	};
}
