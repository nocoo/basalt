import assert from "node:assert/strict";
import type { Page } from "playwright";

export async function assertConsumerConfirm(page: Page) {
	// Case 1: replacement confirmation settles first promise as false, second settles as true, and returns focus to original opener
	await page.evaluate(() => {
		window.renderConfirm?.("confirm");
	});
	await page.locator("#opener").click();
	await page.getByRole("alertdialog").waitFor({ state: "visible" });
	await page.evaluate(() => {
		window.askTwo?.();
	});
	await page.getByRole("heading", { name: "Second request" }).waitFor({ state: "visible" });
	assert.deepEqual(
		await page.evaluate(() => window.confirmProof?.results),
		[{ name: "first", value: false }],
		"first request should settle false upon being replaced",
	);
	await page.getByRole("button", { name: "Confirm", exact: true }).click();
	await page.getByRole("alertdialog").waitFor({ state: "hidden" });
	assert.deepEqual(
		await page.evaluate(() => window.confirmProof?.results),
		[
			{ name: "first", value: false },
			{ name: "second", value: true },
		],
		"second request should settle true upon confirmation",
	);
	await page.waitForFunction(() => document.activeElement?.id === "opener");

	// Case 2: independent Cancel resolves false and restores opener focus
	await page.locator("#opener").click();
	await page.getByRole("alertdialog").waitFor({ state: "visible" });
	await page.getByRole("button", { name: "Cancel", exact: true }).click();
	await page.getByRole("alertdialog").waitFor({ state: "hidden" });
	assert.deepEqual(
		await page.evaluate(() => window.confirmProof?.results),
		[
			{ name: "first", value: false },
			{ name: "second", value: true },
			{ name: "first", value: false },
		],
		"cancelled confirmation must settle promise as false",
	);
	await page.waitForFunction(() => document.activeElement?.id === "opener");

	// Case 3: unmounted pending confirmation resolves false and restores connected opener
	await page.evaluate(() => {
		window.renderConfirm?.("confirm");
	});
	await page.locator("#opener").click();
	await page.getByRole("alertdialog").waitFor({ state: "visible" });
	await page.evaluate(() => {
		window.unmountConfirm?.();
	});
	await page.getByRole("alertdialog").waitFor({ state: "hidden" });
	assert.deepEqual(
		await page.evaluate(() => window.confirmProof?.results),
		[{ name: "first", value: false }],
		"unmounted confirmation must settle pending promise as false",
	);
	await page.waitForFunction(() => document.activeElement?.id === "opener");

	return {
		passed: true,
		replacementSettled: true,
		cancelSettled: true,
		unmountSettled: true,
	};
}
