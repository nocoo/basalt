import assert from "node:assert/strict";
import type { Page } from "playwright";

/**
 * Validates Empty and LayerCard.Empty consumer contracts across Standalone and Tailwind setups.
 * Covers:
 * - Proper DOM attribute forwarding (id, data-testid, aria-label)
 * - Structured content rendering (title, description)
 * - Numeric zero preservation in children
 * - Keyboard navigation and activation (Enter / Space) on interactive children
 * - Keyboard navigation and activation (Enter / Space) on interactive action button
 * - Live UI feedback verification upon user activation
 */
export async function assertConsumerEmpty(page: Page) {
	await page.waitForFunction(() => Boolean(window.emptyAudit?.mounted));

	// 1. Standalone Empty attribute forwarding & content verification
	const standaloneEmpty = page.locator(
		"#standalone-empty-section [data-testid='standalone-empty']",
	);
	await standaloneEmpty.waitFor({ state: "visible" });

	assert.equal(await standaloneEmpty.getAttribute("id"), "custom-empty-id");
	assert.equal(await standaloneEmpty.getAttribute("aria-label"), "Empty Workspace");

	const emptyTitle = standaloneEmpty.locator("p.text-sm");
	assert.equal(await emptyTitle.textContent(), "No documents");

	const emptyDesc = standaloneEmpty.locator("p.text-xs");
	assert.equal(await emptyDesc.textContent(), "There are currently zero files.");

	// Numeric zero in children
	const emptyZero = standaloneEmpty.locator("#empty-numeric-zero");
	assert.equal(
		await emptyZero.textContent(),
		"0",
		"children numeric zero must be rendered without drop",
	);

	// 2. Keyboard interaction on Empty children button (Enter key)
	const emptyChildBtn = standaloneEmpty.locator("#empty-child-btn");
	await emptyChildBtn.focus();
	await page.keyboard.press("Enter");
	await page.waitForFunction(
		() => document.querySelector("#empty-feedback-child")?.textContent === "child-clicks:1",
	);

	// 3. Keyboard interaction on Empty action button (Space key)
	const emptyActionBtn = standaloneEmpty.locator("#empty-action-btn");
	await emptyActionBtn.focus();
	await page.keyboard.press("Space");
	await page.waitForFunction(
		() => document.querySelector("#empty-feedback-action")?.textContent === "action-clicks:1",
	);

	// 4. LayerCard.Empty attribute forwarding & content verification
	const cardEmpty = page.locator("#card-empty-section [data-testid='card-empty']");
	await cardEmpty.waitFor({ state: "visible" });

	assert.equal(await cardEmpty.getAttribute("id"), "custom-card-empty-id");
	assert.equal(await cardEmpty.getAttribute("aria-label"), "Empty Card Activity");

	const cardTitle = cardEmpty.locator("p.text-sm");
	assert.equal(await cardTitle.textContent(), "No activity recorded");

	const cardDesc = cardEmpty.locator("p.text-xs");
	assert.equal(await cardDesc.textContent(), "Incoming events will be listed here.");

	// Numeric zero in LayerCard.Empty children
	const cardZero = cardEmpty.locator("#card-numeric-zero");
	assert.equal(
		await cardZero.textContent(),
		"0",
		"LayerCard.Empty children numeric zero must be rendered",
	);

	// 5. Keyboard interaction on LayerCard.Empty children button (Enter key)
	const cardChildBtn = cardEmpty.locator("#card-child-btn");
	await cardChildBtn.focus();
	await page.keyboard.press("Enter");
	await page.waitForFunction(
		() => document.querySelector("#card-feedback-child")?.textContent === "card-child-clicks:1",
	);

	// 6. Keyboard interaction on LayerCard.Empty action button (Space key)
	const cardActionBtn = cardEmpty.locator("#card-action-btn");
	await cardActionBtn.focus();
	await page.keyboard.press("Space");
	await page.waitForFunction(
		() => document.querySelector("#card-feedback-action")?.textContent === "card-action-clicks:1",
	);

	// 7. Bare numeric zero in children={0} and action={0}
	const bareEmpty = page.locator("#bare-empty-zero");
	await bareEmpty.waitFor({ state: "visible" });
	const bareEmptyText = (await bareEmpty.textContent())?.trim();
	assert.ok(
		bareEmptyText?.endsWith("00"),
		`bare Empty must preserve both children and action numeric 0 (expected endsWith '00'), got: ${bareEmptyText}`,
	);

	const bareCardEmpty = page.locator("#bare-card-zero");
	await bareCardEmpty.waitFor({ state: "visible" });
	const bareCardText = (await bareCardEmpty.textContent())?.trim();
	assert.ok(
		bareCardText?.endsWith("00"),
		`bare LayerCard.Empty must preserve both children and action numeric 0 (expected endsWith '00'), got: ${bareCardText}`,
	);

	return {
		standaloneEmpty: {
			id: "custom-empty-id",
			ariaLabel: "Empty Workspace",
			numericZero: "0",
			childClicks: 1,
			actionClicks: 1,
		},
		cardEmpty: {
			id: "custom-card-empty-id",
			ariaLabel: "Empty Card Activity",
			numericZero: "0",
			childClicks: 1,
			actionClicks: 1,
		},
		bareZeroRegression: {
			empty: bareEmptyText,
			card: bareCardText,
		},
	};
}
