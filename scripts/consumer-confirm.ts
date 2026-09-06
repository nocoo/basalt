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

	// Case 4: DeleteResource displays error alert upon reject and succeeds on retry
	await page.evaluate(() => {
		window.renderConfirm?.("delete");
	});
	const trigger = page.getByRole("button", { name: "Delete record", exact: true });
	await trigger.click();
	await page.getByRole("button", { name: "Delete", exact: true }).click();
	await page.waitForFunction(() => (window.confirmProof?.attempts ?? 0) === 1);
	const alert = page.getByRole("alert");
	await alert.waitFor({ state: "visible" });
	const alertText = await alert.textContent();
	assert.ok(alertText && alertText.trim().length > 0, "error alert should display text");
	assert.equal(
		await page.getByRole("alertdialog").count(),
		1,
		"alertdialog should remain open after deletion error",
	);

	// Retry deletion
	await page.getByRole("button", { name: "Delete", exact: true }).click();
	await page.getByRole("alertdialog").waitFor({ state: "hidden" });
	assert.equal(await page.evaluate(() => window.confirmProof?.attempts), 2);
	assert.equal(await page.evaluate(() => window.confirmProof?.deleted), true);
	assert.equal(
		await trigger.evaluate((el) => document.activeElement === el),
		true,
		"trigger should regain focus after successful deletion dialog close",
	);

	return {
		passed: true,
		replacementSettled: true,
		cancelSettled: true,
		unmountSettled: true,
		retrySucceeded: true,
	};
}
