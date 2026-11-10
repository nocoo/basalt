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

type SidebarBrandSample = {
	x: number;
	y: number;
	width: number;
	height: number;
	sidebarWidth: number;
};

async function assertSidebarBrandGeometry(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.emulateMedia({ reducedMotion: "no-preference" });
	await page.goto(`${baseUrl}/dashboard`);
	const sidebar = page.locator("[data-dashboard-shell] > [data-basalt-sidebar]");
	await sidebar.waitFor();
	const logo = sidebar.locator("[data-sidebar-brand-image]");
	const toggle = sidebar.locator("[data-sidebar-toggle]");
	await logo.waitFor();
	await toggle.waitFor();
	const dashboardLink = sidebar.getByRole("link", { name: "Dashboard", exact: true });
	const linkHref = await dashboardLink.getAttribute("href");
	assert.equal(linkHref, "/dashboard");
	const [newTab] = await Promise.all([
		page.context().waitForEvent("page"),
		dashboardLink.click({ button: "middle" }),
	]);
	try {
		await newTab.waitForURL(`${baseUrl}/dashboard`);
	} finally {
		await newTab.close();
	}
	const measure = () =>
		page.evaluate(() => {
			const sidebar = document.querySelector("[data-dashboard-shell] > [data-basalt-sidebar]");
			const logo = sidebar?.querySelector<HTMLElement>("[data-sidebar-brand-image]");
			const toggle = sidebar?.querySelector<HTMLElement>("[data-sidebar-toggle]");
			const chevron = sidebar?.querySelector<SVGElement>('[data-slot="sidebar-group-label"] svg');
			const search = sidebar?.querySelector<SVGElement>('[data-slot="sidebar-search"] > svg');
			const navIcon = sidebar?.querySelector<SVGElement>(
				'[data-sidebar-row]:not([data-slot="sidebar-search"]) > svg',
			);
			const avatar =
				sidebar?.querySelector<HTMLElement>('[data-slot="sidebar-footer"] > div > :first-child') ??
				sidebar?.querySelector<HTMLElement>('[data-slot="sidebar-footer"] > :first-child');
			if (!sidebar || !logo || !toggle || !search || !navIcon || !avatar) {
				throw new Error("Missing sidebar geometry");
			}
			const sidebarBox = sidebar.getBoundingClientRect();
			const logoBox = logo.getBoundingClientRect();
			const toggleBox = toggle.getBoundingClientRect();
			const chevronBox = chevron?.getBoundingClientRect();
			return {
				logo: {
					x: logoBox.x - sidebarBox.x,
					y: logoBox.y,
					width: logoBox.width,
					height: logoBox.height,
					sidebarWidth: sidebarBox.width,
				},
				toggleCenterX: toggleBox.x + toggleBox.width / 2 - sidebarBox.x,
				chevronCenterX: chevronBox ? chevronBox.x + chevronBox.width / 2 - sidebarBox.x : null,
				search: {
					x: search.getBoundingClientRect().x - sidebarBox.x,
					width: search.getBoundingClientRect().width,
				},
				nav: {
					x: navIcon.getBoundingClientRect().x - sidebarBox.x,
					width: navIcon.getBoundingClientRect().width,
				},
				avatar: {
					x: avatar.getBoundingClientRect().x - sidebarBox.x,
					width: avatar.getBoundingClientRect().width,
				},
			};
		});
	const expanded = await measure();
	// 24px mark centered on the 34px rail axis (x = 22), wider than the 20px icon column.
	assert.ok(Math.abs(expanded.logo.x - 22) <= 0.5, JSON.stringify(expanded));
	assert.ok(Math.abs(expanded.logo.width - 24) <= 0.5, JSON.stringify(expanded));
	assert.ok(Math.abs(expanded.logo.height - 24) <= 0.5, JSON.stringify(expanded));
	assert.ok(
		Math.abs(
			expanded.logo.x + expanded.logo.width / 2 - (expanded.nav.x + expanded.nav.width / 2),
		) <= 0.5,
		JSON.stringify(expanded),
	);
	assert.ok(expanded.chevronCenterX !== null, JSON.stringify(expanded));
	for (const icon of [expanded.search, expanded.nav]) {
		assert.ok(Math.abs(icon.x - 24) <= 0.5, JSON.stringify(expanded));
		assert.ok(Math.abs(icon.width - 20) <= 0.5, JSON.stringify(expanded));
	}
	assert.ok(Math.abs(expanded.avatar.x - 16) <= 0.5, JSON.stringify(expanded));
	assert.ok(Math.abs(expanded.avatar.width - 36) <= 0.5, JSON.stringify(expanded));
	assert.ok(
		Math.abs(expanded.toggleCenterX - expanded.chevronCenterX) <= 0.5,
		JSON.stringify(expanded),
	);
	const samples = await page.evaluate(async () => {
		const logo = document.querySelector<HTMLElement>("[data-sidebar-brand-image]");
		const sidebar = document.querySelector<HTMLElement>(
			"[data-dashboard-shell] > [data-basalt-sidebar]",
		);
		const toggle = document.querySelector<HTMLButtonElement>("[data-sidebar-toggle]");
		if (!logo || !sidebar || !toggle) throw new Error("Missing sidebar transition geometry");
		const sample = (): SidebarBrandSample => {
			const logoBox = logo.getBoundingClientRect();
			const sidebarBox = sidebar.getBoundingClientRect();
			return {
				x: logoBox.x - sidebarBox.x,
				y: logoBox.y,
				width: logoBox.width,
				height: logoBox.height,
				sidebarWidth: sidebarBox.width,
			};
		};
		const frames = [sample()];
		toggle.click();
		await new Promise<void>((resolve) => {
			const started = performance.now();
			const next = () => {
				frames.push(sample());
				if (performance.now() - started >= 260) resolve();
				else requestAnimationFrame(next);
			};
			requestAnimationFrame(next);
		});
		return frames;
	});
	await page.waitForFunction(
		() =>
			document.querySelector("[data-dashboard-shell] > [data-basalt-sidebar]")?.clientWidth === 68,
	);
	const collapsed = await measure();
	for (const sample of samples) {
		assert.ok(Math.abs(sample.x - expanded.logo.x) <= 0.5, JSON.stringify(samples));
		assert.ok(Math.abs(sample.y - expanded.logo.y) <= 0.5, JSON.stringify(samples));
	}
	assert.ok(Math.abs(collapsed.logo.x - expanded.logo.x) <= 0.5, JSON.stringify(collapsed));
	assert.ok(Math.abs(collapsed.logo.y - expanded.logo.y) <= 0.5, JSON.stringify(collapsed));
	for (const icon of [collapsed.search, collapsed.nav]) {
		assert.ok(Math.abs(icon.x - 24) <= 0.5, JSON.stringify(collapsed));
		assert.ok(Math.abs(icon.width - 20) <= 0.5, JSON.stringify(collapsed));
	}
	assert.ok(Math.abs(collapsed.avatar.x - 16) <= 0.5, JSON.stringify(collapsed));
	assert.ok(Math.abs(collapsed.avatar.width - 36) <= 0.5, JSON.stringify(collapsed));
	const geometry = {
		expanded: expanded.logo,
		collapsed: collapsed.logo,
		logoDx: collapsed.logo.x - expanded.logo.x,
		logoDy: collapsed.logo.y - expanded.logo.y,
		toggleChevronDx: expanded.toggleCenterX - expanded.chevronCenterX,
		transitionSamples: samples,
		linkHref,
	};
	console.log(`Sidebar brand geometry ${JSON.stringify(geometry)}`);
	return geometry;
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

async function assertNavigationGeometry(sidebar: Locator, collapsed: boolean, inset = 16) {
	const geometry = await sidebar.evaluate((node) => {
		const nav = node.querySelector("nav") as HTMLElement;
		const box = node.getBoundingClientRect();
		const search = nav.querySelector<HTMLElement>('[data-slot="sidebar-search"]');
		const footerControl = node.querySelector<HTMLElement>(
			'[data-slot="sidebar-footer"] > .basalt-action',
		);
		if (!search || !footerControl) throw new Error("Missing sidebar control geometry");
		const footer = footerControl.parentElement;
		if (!footer) throw new Error("Missing sidebar footer geometry");
		const footerProbeCenters = node.hasAttribute("data-collapsed")
			? (
					[
						["a", 20],
						["button", 30],
						["span", 36],
					] as const
				).map(([tag, width]) => {
					const probe = document.createElement(tag);
					probe.style.boxSizing = "border-box";
					probe.style.inlineSize = `${width}px`;
					probe.style.blockSize = "20px";
					probe.style.border = "0";
					probe.style.padding = "0";
					footer.append(probe);
					const probeBox = probe.getBoundingClientRect();
					const center = probeBox.left + probeBox.width / 2 - box.left;
					probe.remove();
					return center;
				})
			: [];
		const top = (element: HTMLElement) =>
			element.getBoundingClientRect().top - nav.getBoundingClientRect().top + nav.scrollTop;
		const destinations = Array.from(
			nav.querySelectorAll<HTMLElement>("[data-basalt-hover-item]"),
		).filter((row) => row !== search);
		const directDestinations = Array.from(nav.children).filter(
			(child): child is HTMLElement =>
				child instanceof HTMLElement &&
				child.hasAttribute("data-basalt-hover-item") &&
				child !== search,
		);
		const rowGeometry = (row: HTMLElement) => ({
			top: top(row),
			left: row.getBoundingClientRect().left - box.left,
			height: row.getBoundingClientRect().height,
			padding: getComputedStyle(row).padding,
		});
		return {
			width: box.width,
			paddingInline: getComputedStyle(nav).paddingInlineStart,
			paddingTop: getComputedStyle(nav).paddingTop,
			paddingBottom: getComputedStyle(nav).paddingBottom,
			search: {
				...rowGeometry(search),
				hoverItem: search.hasAttribute("data-basalt-hover-item"),
			},
			footerControl: (() => {
				const controlBox = footerControl.getBoundingClientRect();
				return {
					left: controlBox.left - box.left,
					center: controlBox.left + controlBox.width / 2 - box.left,
					width: controlBox.width,
				};
			})(),
			footerProbeCenters,
			destinations: destinations.map(rowGeometry),
			directDestinationTops: directDestinations.map(top),
			centers: Array.from(
				node.querySelectorAll(
					'[data-slot="sidebar-brand-action"] svg, [data-basalt-hover-item] svg',
				),
				(icon) => {
					const rect = icon.getBoundingClientRect();
					return rect.x + rect.width / 2 - box.x;
				},
			),
		};
	});
	assert.ok(
		geometry.destinations.every((row) => row.height === 38),
		JSON.stringify(geometry),
	);
	if (collapsed) {
		assert.equal(geometry.width, 68);
		assert.equal(geometry.paddingInline, "17px");
		assert.equal(geometry.paddingTop, "36px");
		assert.equal(geometry.paddingBottom, "8px");
		assert.deepEqual(geometry.directDestinationTops, [78, 120, 162], JSON.stringify(geometry));
		assert.equal(geometry.search.top, 36, JSON.stringify(geometry));
		assert.equal(geometry.search.height, 38, JSON.stringify(geometry));
		assert.equal(geometry.search.hoverItem, true, JSON.stringify(geometry));
		assert.equal(geometry.search.left, 17, JSON.stringify(geometry));
		assert.equal(geometry.search.padding, "8px", JSON.stringify(geometry));
		assert.deepEqual(
			geometry.footerControl,
			{ left: 20, center: 34, width: 28 },
			JSON.stringify(geometry),
		);
		assert.ok(
			geometry.footerProbeCenters.length === 3 &&
				geometry.footerProbeCenters.every((center) => Math.abs(center - 34) <= 0.5),
			JSON.stringify(geometry),
		);
		assert.equal(
			geometry.directDestinationTops[0] - geometry.search.top - geometry.search.height,
			4,
			JSON.stringify(geometry),
		);
		assert.ok(
			geometry.destinations.every((row) => row.left === 17 && row.padding === "8px"),
			JSON.stringify(geometry),
		);
		assert.ok(
			geometry.centers.every((center) => Math.abs(center - 34) < 1),
			JSON.stringify(geometry),
		);
	} else {
		assert.equal(geometry.paddingInline, `${inset}px`);
		assert.equal(geometry.paddingTop, "8px");
		assert.equal(geometry.search.top, 8, JSON.stringify(geometry));
		assert.equal(geometry.search.hoverItem, false, JSON.stringify(geometry));
		assert.equal(geometry.search.left, inset, JSON.stringify(geometry));
		assert.equal(geometry.search.padding, "8px", JSON.stringify(geometry));
		assert.equal(geometry.footerControl.left, 16, JSON.stringify(geometry));
		assert.equal(geometry.footerControl.width, geometry.width - 32, JSON.stringify(geometry));
		const firstDestinationTop = geometry.search.top + geometry.search.height + 4;
		assert.equal(geometry.directDestinationTops.length, 3, JSON.stringify(geometry));
		geometry.directDestinationTops.forEach((top, index) => {
			assert.ok(
				Math.abs(top - (firstDestinationTop + index * 42)) < 0.01,
				JSON.stringify(geometry),
			);
		});
		assert.ok(
			geometry.destinations.every((row) => row.left === inset && row.padding === "8px"),
			JSON.stringify(geometry),
		);
	}
}

export async function assertNavigationLists(page: Page, baseUrl: string) {
	const css = readFileSync("packages/basalt/src/styles/standalone.css", "utf8");
	const brandGeometry = await assertSidebarBrandGeometry(page, baseUrl);
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
			const homeLink = sidebar.getByRole("link", { name: "Home", exact: true });
			assert.equal(await homeLink.getAttribute("href"), "/ui/sidebar?destination=home");
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
				(node as HTMLElement).style.setProperty("--basalt-space-sidebar-inset", "4px"),
			);
			await assertNavigationGeometry(sidebar, false, 4);
			await sidebar.evaluate((node) =>
				(node as HTMLElement).style.removeProperty("--basalt-space-sidebar-inset"),
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
			await nav.getByRole("link", { name: "New chat" }).hover();
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
		assert.equal(
			await list.evaluate((node) => getComputedStyle(node).padding),
			slug === "navigation-menu" ? "8px" : "8px 16px",
		);
	}
	return {
		viewports: 2,
		themes: 2,
		cssEntrypoints: 2,
		rowHeight: 38,
		railAxis: 34,
		inset: 24,
		navigationFamilies: 3,
		brandGeometry,
	};
}
