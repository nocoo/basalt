import assert from "node:assert/strict";
import type { Page } from "playwright";
import { setShowcaseTheme } from "./showcase-theme";

export async function assertTemplatesShowcase(page: Page, baseUrl: string) {
	await page.setViewportSize({ width: 1440, height: 1000 });
	await page.goto(`${baseUrl}/templates/agent-workspace`);
	await page.getByRole("heading", { name: "Agent workspace", exact: true }).waitFor();
	await setShowcaseTheme(page, false);
	assert.equal(await page.locator("iframe").count(), 1);
	assert.equal(
		await page.getByRole("link", { name: "Open fullscreen" }).getAttribute("href"),
		"/view/agent-workspace",
	);
	assert.equal(
		await page.getByRole("link", { name: "View .md" }).getAttribute("href"),
		"/templates/agent-workspace.md",
	);

	// Verify CardHeader vertical padding symmetry and vertical content alignment on Agent workspace.
	const hostHeaderGeometry = await page.evaluate(() => {
		const headers = Array.from(document.querySelectorAll<HTMLElement>('[data-slot="card-header"]'));
		const toolbar = headers[0];
		const anatomyHeaders = headers.slice(1, -2);
		const rootSetupHeader = headers[headers.length - 1];
		if (!toolbar || anatomyHeaders.length === 0 || !rootSetupHeader) {
			throw new Error("Missing expected Agent workspace headers");
		}
		const toolbarStyle = getComputedStyle(toolbar);
		const rootSetupStyle = getComputedStyle(rootSetupHeader);
		const anatomyAlignments = anatomyHeaders.map((header) => {
			const title = header.querySelector<HTMLElement>("span");
			const button = header.querySelector<HTMLElement>("button");
			if (!title || !button) throw new Error("Missing anatomy header title or Locate button");
			const titleRect = title.getBoundingClientRect();
			const buttonRect = button.getBoundingClientRect();
			return {
				alignItems: getComputedStyle(header).alignItems,
				centerDiff: Math.abs(
					titleRect.top + titleRect.height / 2 - (buttonRect.top + buttonRect.height / 2),
				),
			};
		});
		return {
			toolbar: {
				divided: toolbar.getAttribute("data-divided"),
				paddingTop: toolbarStyle.paddingTop,
				paddingBottom: toolbarStyle.paddingBottom,
				alignItems: toolbarStyle.alignItems,
				borderBottomWidth: toolbarStyle.borderBottomWidth,
			},
			anatomyAlignments,
			rootSetup: {
				paddingTop: rootSetupStyle.paddingTop,
				paddingBottom: rootSetupStyle.paddingBottom,
				alignItems: rootSetupStyle.alignItems,
			},
		};
	});
	assert.deepEqual(hostHeaderGeometry.toolbar, {
		divided: "true",
		paddingTop: "16px",
		paddingBottom: "16px",
		alignItems: "center",
		borderBottomWidth: "1px",
	});
	for (const entry of hostHeaderGeometry.anatomyAlignments) {
		assert.equal(entry.alignItems, "center");
		assert.ok(entry.centerDiff <= 1, JSON.stringify(entry));
	}
	assert.deepEqual(hostHeaderGeometry.rootSetup, {
		paddingTop: "16px",
		paddingBottom: "16px",
		alignItems: "center",
	});

	const iframe = page.locator("iframe");
	await iframe.scrollIntoViewIfNeeded();
	const agent = iframe.contentFrame();
	await agent.locator("#agent-approval").waitFor();
	const approvalHeaderGeometry = await agent
		.locator("#agent-approval [data-slot='card-header']")
		.evaluate((header) => {
			const title = header.querySelector<HTMLElement>("span");
			const badge = header.querySelector<HTMLElement>('[data-slot="badge"]');
			if (!title || !badge) throw new Error("Missing approval header title or badge");
			const titleRect = title.getBoundingClientRect();
			const badgeRect = badge.getBoundingClientRect();
			return {
				alignItems: getComputedStyle(header).alignItems,
				centerDiff: Math.abs(
					titleRect.top + titleRect.height / 2 - (badgeRect.top + badgeRect.height / 2),
				),
			};
		});
	assert.equal(approvalHeaderGeometry.alignItems, "center");
	assert.ok(approvalHeaderGeometry.centerDiff <= 1, JSON.stringify(approvalHeaderGeometry));
	await agent.getByRole("button", { name: "Approve migration" }).click();
	await agent.getByText("Approved", { exact: true }).waitFor();
	await agent.getByText("Approved migration plan for release.").waitFor();
	await agent.getByRole("button", { name: "Prepare deployment plan" }).click();
	await agent.getByText("Prepare a deployment plan.").waitFor();
	await agent.getByRole("button", { name: "Collapse sidebar" }).click();
	await agent.getByRole("button", { name: "Expand sidebar" }).waitFor();
	assert.equal(await agent.getByRole("textbox", { name: "Search sessions" }).count(), 0);
	await agent.getByRole("button", { name: "Expand sidebar" }).click();
	await agent.getByRole("textbox", { name: "Search sessions" }).waitFor();

	await page.getByRole("radio", { name: "Mobile", exact: true }).click();
	const mobileBox = await iframe.boundingBox();
	assert.ok(mobileBox && mobileBox.width <= 390);
	await agent.getByRole("button", { name: "Open navigation" }).click();
	await agent.getByRole("button", { name: "New session" }).click();
	await agent.getByRole("heading", { name: "New session 4", exact: true }).waitFor();
	await page.waitForFunction(
		(node) => {
			const frame = node as HTMLIFrameElement;
			return frame.contentDocument?.activeElement?.hasAttribute("data-app-header-menu");
		},
		await iframe.elementHandle(),
	);

	// Local theme override inside workbench leaves host theme intact.
	await page.getByRole("radio", { name: "Dark", exact: true }).click();
	await agent.locator("html[data-mode=dark]").waitFor();
	assert.equal(await page.evaluate(() => localStorage.getItem("theme")), "light");
	await page.getByRole("radio", { name: "Site", exact: true }).click();
	await agent.locator("html[data-mode=light]").waitFor();

	// Host theme propagates when Preview theme is set to Site.
	await setShowcaseTheme(page, true);
	await agent.locator("html[data-mode=dark]").waitFor();
	assert.equal(await page.evaluate(() => localStorage.getItem("theme")), "dark");

	await page.getByRole("button", { name: "Reload preview" }).click();
	await agent.getByRole("button", { name: "Prepare deployment plan" }).waitFor();
	await agent.locator("html[data-mode=dark]").waitFor();

	// Switch back to Desktop and verify anatomy "Locate" highlights the target inside iframe.
	await page.getByRole("radio", { name: "Desktop", exact: true }).click();
	await page.getByRole("button", { name: "Locate" }).first().click();
	await agent.locator('[data-basalt-template-focus="true"]').waitFor();

	await page.getByRole("radio", { name: "Code", exact: true }).click();
	assert.equal(await page.locator("iframe").count(), 0);
	const attachedCodeBorderTop = await page
		.locator("[data-basalt-code][data-code-attached]")
		.first()
		.evaluate((el) => getComputedStyle(el).borderTopWidth);
	assert.equal(attachedCodeBorderTop, "0px");
	await page.evaluate(() => {
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: async (text: string) => {
					document.body.dataset.copiedTemplate = text;
				},
			},
		});
	});
	await page.getByRole("button", { name: "Copy code" }).click();
	await page.getByRole("button", { name: "Copied" }).waitFor();
	assert.match(
		await page.evaluate(() => document.body.dataset.copiedTemplate ?? ""),
		/export default function AgentWorkspaceTemplate/,
	);

	await page.goto(`${baseUrl}/view/ops-inbox`);
	await page.getByRole("button", { name: "Escalate" }).click();
	await page.getByText("escalated", { exact: true }).waitFor();
	await page.goto(`${baseUrl}/view/executive-dashboard`);
	await page.getByRole("textbox", { name: "Filter accounts" }).fill("Evergreen");
	assert.equal(await page.getByText("Evergreen", { exact: true }).count(), 1);
	assert.equal(await page.getByText("Meridian", { exact: true }).count(), 0);
	await page.goto(`${baseUrl}/view/workspace-settings`);
	await page.getByRole("tab", { name: "Security" }).click();
	await page.getByRole("button", { name: "Revoke iPhone 15 — Safari" }).click();
	assert.equal(await page.getByText("iPhone 15 — Safari", { exact: true }).count(), 0);
	await page.getByRole("tab", { name: "API Keys" }).click();
	await page.getByRole("button", { name: "Create key" }).click();
	await page.getByText("New key 1").waitFor();
	await page.goto(`${baseUrl}/view/visitor-login?theme=light`);
	await page.locator("html[data-mode=light]").waitFor();
	assert.equal(await page.evaluate(() => localStorage.getItem("theme")), "dark");
	await page.getByLabel("Email").fill("visitor@example.com");
	await page.getByLabel("Password").fill("demo-only");
	await page.getByRole("switch", { name: "Use verification code" }).click();
	await page.getByLabel("Verification code", { exact: true }).fill("123456");
	await page.getByRole("button", { name: "Sign in" }).click();
	await page.getByRole("status").getByText("Demo verified. No credentials were sent.").waitFor();
	await page.goto(`${baseUrl}/view/document-page`);
	await page.getByRole("heading", { name: "Terms of Service" }).waitFor();
	await page.goto(`${baseUrl}/view/not-found`);
	await page.getByRole("heading", { name: "Page not found" }).waitFor();
	return { templates: 7, previewTheme: true, mobileDrawer: true, copy: true, interactions: true };
}
