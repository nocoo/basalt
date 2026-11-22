import assert from "node:assert/strict";
import type { ToastCallOptions, ToastTone } from "@nocoo/basalt/components/toast";
import type { Page } from "playwright";

export async function assertConsumerToast(page: Page) {
	await page.waitForFunction(() => Boolean(window.toastAudit?.ref));

	// 1. Ordinary Toaster public ref
	const tag = await page.evaluate(() => window.toastAudit?.ref?.tagName);
	assert.equal(tag, "SECTION", "Toaster public ref must point to SECTION element");

	// 2. 15 variations: 5 tones x 3 icon options (omitted, false, custom)
	const tones = [
		"neutral",
		"success",
		"danger",
		"warning",
		"info",
	] as const satisfies readonly ToastTone[];
	const iconKinds = ["omitted", "false", "custom"] as const;

	for (const tone of tones) {
		for (const iconKind of iconKinds) {
			const title = `Icon ${tone} ${iconKind}`;
			const id = await page.evaluate(
				({ t, k, msg }) => {
					const audit = window.toastAudit;
					if (!audit) throw new Error("toastAudit missing");
					audit.toast.dismiss();
					const options: ToastCallOptions = {
						tone: t,
						duration: Number.POSITIVE_INFINITY,
					};
					if (k === "false") options.icon = false;
					if (k === "custom") options.icon = "★";
					return audit.toast(msg, options);
				},
				{ t: tone, k: iconKind, msg: title },
			);

			const item = page.locator("[data-sonner-toast]").filter({ hasText: title });
			await item.waitFor({ state: "visible" });

			const iconCount = await item.locator("[data-icon]").count();
			const expected =
				iconKind === "false" || (iconKind === "omitted" && tone === "neutral") ? 0 : 1;
			assert.equal(
				iconCount,
				expected,
				`${tone} with icon=${iconKind} expected ${expected} icons, got ${iconCount}`,
			);

			if (iconKind === "custom") {
				assert.equal(await item.locator("[data-icon]").textContent(), "★");
			}
			if (iconCount > 0) {
				assert.equal(await item.locator("[data-icon]").isVisible(), true);
			}
			assert.ok(
				typeof id === "number" || typeof id === "string",
				"toast dispatch should return id",
			);
		}
	}

	// 3. Per-notification close default overrides Toaster default
	await page.evaluate(() => window.toastAudit?.setOptions?.({ closeButton: false }));
	await page.waitForTimeout(50);
	await page.evaluate(() => {
		window.toastAudit?.toast.dismiss();
		window.toastAudit?.toast("Close inherited", { duration: Infinity });
	});
	const item = page.locator("[data-sonner-toast]").filter({ hasText: "Close inherited" });
	await item.waitFor({ state: "visible" });
	assert.equal(await item.locator("[data-close-button]").count(), 1);

	await page.evaluate(() =>
		window.toastAudit?.toast("Close hidden", { close: false, duration: Infinity }),
	);
	const hidden = page.locator("[data-sonner-toast]").filter({ hasText: "Close hidden" });
	await hidden.waitFor({ state: "visible" });
	assert.equal(await hidden.locator("[data-close-button]").count(), 0);

	// 4. Status per-notification icons preserve current priority
	await page.evaluate(() =>
		window.toastAudit?.setOptions?.({
			icons: { success: "§" } as Parameters<
				NonNullable<NonNullable<typeof window.toastAudit>["setOptions"]>
			>[0]["icons"],
		}),
	);
	await page.waitForTimeout(50);
	await page.evaluate(() => {
		window.toastAudit?.toast.dismiss();
		window.toastAudit?.toast.success("Default status icon", { duration: Infinity });
	});
	const statusItem = page.locator("[data-sonner-toast]").filter({
		hasText: "Default status icon",
	});
	await statusItem.waitFor({ state: "visible" });
	assert.equal(await statusItem.locator("[data-icon] svg").count(), 1);
	assert.notEqual(await statusItem.locator("[data-icon]").textContent(), "§");

	return {
		passed: true,
		refTag: tag,
		totalChecks: 18,
	};
}
