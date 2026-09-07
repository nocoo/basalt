import type { Page } from "playwright";

/** Exercise the provider's storage contract and verify every theme selector agrees. */
export async function setShowcaseTheme(page: Page, dark: boolean) {
	const theme = dark ? "dark" : "light";
	await page.evaluate((theme) => {
		localStorage.setItem("theme", theme);
		sessionStorage.setItem("showcase-theme", theme);
		window.dispatchEvent(
			new StorageEvent("storage", { key: "theme", newValue: theme, storageArea: localStorage }),
		);
	}, theme);
	await page.waitForFunction((theme) => {
		const root = document.documentElement;
		return (
			root.dataset.mode === theme &&
			root.classList.contains(theme) &&
			!root.classList.contains(theme === "dark" ? "light" : "dark")
		);
	}, theme);
}
