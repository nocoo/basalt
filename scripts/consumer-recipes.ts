import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Page } from "playwright";

const RECIPE_IDS = ["recipe-app-frame", "recipe-login", "recipe-resources"] as const;

/** Extract the shipped Markdown bytes, without repairing imports or rewriting JSX. */
export function parseApplicationRecipes(markdown: string) {
	const recipes = new Map<string, string>();
	const fences = [...markdown.matchAll(/^```([^\r\n]*)\r?\n([\s\S]*?)^```[ \t]*\r?$/gm)];
	if ((markdown.match(/^```/gm) ?? []).length !== fences.length * 2)
		throw new Error("Unclosed application recipe fence");
	for (const fence of fences) {
		const header = fence[1].trim();
		if (!header.startsWith("tsx")) continue;
		const id = header.replace(/^tsx compile:/, "");
		if (!RECIPE_IDS.some((known) => known === id))
			throw new Error(`Unknown recipe fence: ${header}`);
		if (recipes.has(id)) throw new Error(`Duplicate application recipe: ${id}`);
		if (!fence[2].trim()) throw new Error(`Empty application recipe: ${id}`);
		recipes.set(id, fence[2]);
	}
	return RECIPE_IDS.map((id) => {
		const code = recipes.get(id);
		if (!code) throw new Error(`Missing application recipe: ${id}`);
		return { id, code, sha256: createHash("sha256").update(code).digest("hex") };
	});
}

/** This path is inside the isolated consumer's npm installation, never the repository source. */
export function materializeApplicationRecipes(
	consumerRoot: string,
	target: "src/recipe-modules" | "app/recipes/recipe-modules",
) {
	const markdown = readFileSync(
		join(consumerRoot, "node_modules/@nocoo/basalt/ai/RECIPES.md"),
		"utf8",
	);
	const recipes = parseApplicationRecipes(markdown);
	mkdirSync(join(consumerRoot, target), { recursive: true });
	return recipes.map(({ id, code, sha256 }) => {
		writeFileSync(join(consumerRoot, target, `${id}.tsx`), code);
		return { id, sha256 };
	});
}

/** Same original recipes, exercised through standalone, Tailwind, and Next client boundaries. */
export async function assertConsumerRecipes(page: Page, url: string) {
	const cases: string[] = [];
	for (const width of [390, 1280]) {
		await page.setViewportSize({ width, height: 950 });
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(`${url}?recipe=app-frame`);
		await page.getByRole("heading", { name: "Projects", exact: true }).waitFor();
		const menu = page.getByRole("button", { name: "Toggle navigation" });
		if (width < 768) {
			await menu.click();
			await page.getByRole("dialog", { name: "Workspace navigation" }).waitFor();
		}
		await page.getByRole("button", { name: "Members", exact: true }).click();
		await page.getByRole("heading", { name: "Members", exact: true }).waitFor();
		if (width < 768) {
			await page.getByRole("dialog").waitFor({ state: "hidden" });
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Toggle navigation",
			);
			await menu.click();
			await page.keyboard.press("Escape");
			await page.waitForFunction(
				() => document.activeElement?.getAttribute("aria-label") === "Toggle navigation",
			);
		}
		const skip = page.getByRole("link", { name: "Skip to content" });
		await skip.focus();
		await page.keyboard.press("Enter");
		await page.waitForFunction(() => document.activeElement?.id === "recipe-main");
		assert.equal(
			await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
			false,
		);

		await page.goto(`${url}?recipe=login`);
		await page.getByRole("textbox", { name: "Email" }).fill("reader@example.com");
		await page.getByLabel("Password", { exact: true }).fill("incorrect");
		await page.getByRole("button", { name: "Sign in", exact: true }).click();
		await page.getByRole("alert").filter({ hasText: "Incorrect demo password." }).waitFor();
		assert.equal(
			await page.getByRole("textbox", { name: "Email" }).inputValue(),
			"reader@example.com",
		);
		await page.getByLabel("Password", { exact: true }).fill("demo-pass");
		await page.getByRole("button", { name: "Sign in", exact: true }).click();
		await page.getByRole("status").filter({ hasText: "Signed in as reader@example.com" }).waitFor();
		await page.getByRole("button", { name: "Sign out" }).click();
		await page.getByRole("form", { name: "Sign in" }).waitFor();
		assert.equal(
			await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
			false,
		);

		await page.goto(`${url}?recipe=resources`);
		await page.getByText("The project service is unavailable.").waitFor();
		await page.getByRole("button", { name: "Try again", exact: true }).click();
		await page.getByRole("cell", { name: "Atlas", exact: true }).waitFor();
		await page.getByRole("textbox", { name: "Search projects" }).fill("boreal");
		assert.equal(await page.getByRole("cell", { name: "Atlas", exact: true }).count(), 0);
		await page.getByRole("cell", { name: "Boreal", exact: true }).waitFor();
		await page.getByRole("textbox", { name: "Search projects" }).fill("");
		const row = page
			.getByRole("row")
			.filter({ has: page.getByRole("cell", { name: "Atlas", exact: true }) });
		await row.getByRole("button", { name: /Delete/ }).click();
		const confirm = page.getByRole("alertdialog");
		await confirm.getByRole("button", { name: "Delete", exact: true }).click();
		await confirm.getByRole("alert").filter({ hasText: "Temporary conflict." }).waitFor();
		await confirm.getByRole("button", { name: "Delete", exact: true }).click();
		await confirm.waitFor({ state: "hidden" });
		await page.getByRole("status").filter({ hasText: "Deleted Atlas" }).waitFor();
		assert.equal(await page.getByRole("cell", { name: "Atlas", exact: true }).count(), 0);
		assert.equal(
			await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
			false,
		);
		cases.push(String(width));
	}
	await page.goto(`${url}?recipe=login-abort`);
	await page.getByRole("textbox", { name: "Email" }).fill("reader@example.com");
	await page.getByLabel("Password", { exact: true }).fill("pending");
	await page.getByRole("button", { name: "Sign in", exact: true }).click();
	assert.equal(await page.getByRole("button", { name: /Sign in/ }).isDisabled(), true);
	// A submit event can still reach the form while the visible button is disabled.
	await page
		.getByRole("form", { name: "Sign in" })
		.evaluate((form) =>
			form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
		);
	assert.equal(await page.getByTestId("auth-calls").innerText(), "1");
	await page.getByRole("button", { name: "Unmount login" }).click();
	await page.getByTestId("auth-aborted").filter({ hasText: "true" }).waitFor();
	assert.equal(await page.getByTestId("auth-success").innerText(), "false");
	return {
		cases,
		installedMarkdown: true,
		navigation: true,
		login: true,
		abort: true,
		resourceRetry: true,
	};
}
