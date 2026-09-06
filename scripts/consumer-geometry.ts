import type { Page } from "playwright";

export async function assertConsumerGeometry(
	page: Page,
	mode: "standalone" | "tailwind",
): Promise<Record<string, unknown>> {
	// 1. Wait for Dialog portal content and let its entrance animation settle
	const portalContent = page.locator("#basalt-dialog-content");
	await portalContent.waitFor({ state: "visible", timeout: 10_000 });
	await page.waitForFunction(() => {
		const el = document.getElementById("basalt-dialog-content");
		if (!el) return false;
		const style = window.getComputedStyle(el);
		const transform = style.transform;
		return (
			style.opacity === "1" &&
			(transform === "none" ||
				!transform.includes("matrix") ||
				Math.abs(Number(transform.split(",")[0].replace("matrix(", "").trim()) - 1) < 0.01)
		);
	});

	// 2. Wait for baseline un-styled iframe to be fully loaded with its document elements ready
	await page.waitForFunction(() => {
		const frame = document.getElementById("raw-frame") as HTMLIFrameElement | null;
		if (!frame?.contentDocument) return false;
		const doc = frame.contentDocument;
		return Boolean(
			doc.getElementById("raw-btn") &&
				doc.getElementById("raw-input") &&
				doc.getElementById("raw-textarea") &&
				doc.getElementById("raw-table"),
		);
	});

	// 3. Test Accordion interaction: click trigger to expand and verify body is visible
	const accordionTrigger = page.locator("#basalt-accordion-trigger");
	await accordionTrigger.click();
	const accordionContent = page.locator("#basalt-accordion-content");
	await accordionContent.waitFor({ state: "visible", timeout: 5000 });

	const data = await page.evaluate(() => {
		function getEl(id: string): HTMLElement {
			const el = document.getElementById(id);
			if (!el) throw new Error(`element #${id} missing`);
			return el;
		}

		const hostBtn = getEl("host-btn");
		const hostInput = getEl("host-input");
		const hostTextarea = getEl("host-textarea");
		const hostTable = getEl("host-table");

		const frame = getEl("raw-frame") as HTMLIFrameElement;
		const rawDoc = frame.contentDocument;
		if (!rawDoc) throw new Error("raw-frame contentDocument missing");
		const rawBtn = rawDoc.getElementById("raw-btn");
		const rawInput = rawDoc.getElementById("raw-input");
		const rawTextarea = rawDoc.getElementById("raw-textarea");
		const rawTable = rawDoc.getElementById("raw-table");
		if (!rawBtn || !rawInput || !rawTextarea || !rawTable || !rawDoc.defaultView) {
			throw new Error("raw iframe elements missing");
		}

		const basaltInput = getEl("basalt-input");
		const basaltInputArea = getEl("basalt-input-area");
		const basaltBtnDefault = getEl("basalt-btn-default");
		const basaltBtnOutline = getEl("basalt-btn-outline");
		const basaltBtnAnchor = getEl("basalt-btn-anchor");
		const basaltCheckbox = getEl("basalt-checkbox");
		const basaltSwitch = getEl("basalt-switch");
		const basaltSelectTrigger = getEl("basalt-select-trigger");
		const basaltCard = getEl("basalt-card");
		const basaltCardInput = getEl("basalt-card-input");
		const basaltTable = getEl("basalt-table");
		const basaltAccordionTrigger = getEl("basalt-accordion-trigger");
		const basaltAccordionContent = getEl("basalt-accordion-content");
		const basaltMenuBarTrigger = getEl("basalt-menubar-trigger");
		const shortcutParent = getEl("shortcut-parent");
		const basaltCommandShortcut = getEl("basalt-command-shortcut");
		const portalInput = getEl("portal-input");
		const portalBtn = getEl("portal-btn");

		const hostBtnStyle = window.getComputedStyle(hostBtn);
		const hostInputStyle = window.getComputedStyle(hostInput);
		const hostTextareaStyle = window.getComputedStyle(hostTextarea);
		const hostTableStyle = window.getComputedStyle(hostTable);

		const rawBtnStyle = rawDoc.defaultView.getComputedStyle(rawBtn);
		const rawInputStyle = rawDoc.defaultView.getComputedStyle(rawInput);
		const rawTextareaStyle = rawDoc.defaultView.getComputedStyle(rawTextarea);
		const rawTableStyle = rawDoc.defaultView.getComputedStyle(rawTable);

		const basaltInputStyle = window.getComputedStyle(basaltInput);
		const basaltInputAreaStyle = window.getComputedStyle(basaltInputArea);
		const basaltBtnDefaultStyle = window.getComputedStyle(basaltBtnDefault);
		const basaltBtnOutlineStyle = window.getComputedStyle(basaltBtnOutline);
		const basaltBtnAnchorStyle = window.getComputedStyle(basaltBtnAnchor);
		const basaltCardStyle = window.getComputedStyle(basaltCard);
		const basaltTableStyle = window.getComputedStyle(basaltTable);
		const basaltAccordionTriggerStyle = window.getComputedStyle(basaltAccordionTrigger);
		const basaltShortcutStyle = window.getComputedStyle(basaltCommandShortcut);

		const portalInputStyle = window.getComputedStyle(portalInput);
		const portalBtnStyle = window.getComputedStyle(portalBtn);

		const cardRect = basaltCard.getBoundingClientRect();
		const cardInputRect = basaltCardInput.getBoundingClientRect();
		const shortcutParentRect = shortcutParent.getBoundingClientRect();
		const shortcutRect = basaltCommandShortcut.getBoundingClientRect();

		return {
			host: {
				btnBoxSizing: hostBtnStyle.boxSizing,
				btnBorderStyle: hostBtnStyle.borderTopStyle,
				inputBoxSizing: hostInputStyle.boxSizing,
				textareaBoxSizing: hostTextareaStyle.boxSizing,
				tableBorderCollapse: hostTableStyle.borderCollapse,
			},
			raw: {
				btnBoxSizing: rawBtnStyle.boxSizing,
				btnBorderStyle: rawBtnStyle.borderTopStyle,
				inputBoxSizing: rawInputStyle.boxSizing,
				textareaBoxSizing: rawTextareaStyle.boxSizing,
				tableBorderCollapse: rawTableStyle.borderCollapse,
			},
			basalt: {
				inputWidth: basaltInput.getBoundingClientRect().width,
				inputHeight: basaltInput.getBoundingClientRect().height,
				inputBoxSizing: basaltInputStyle.boxSizing,
				inputAreaWidth: basaltInputArea.getBoundingClientRect().width,
				inputAreaHeight: basaltInputArea.getBoundingClientRect().height,
				inputAreaBoxSizing: basaltInputAreaStyle.boxSizing,
				btnDefaultHeight: basaltBtnDefault.getBoundingClientRect().height,
				btnDefaultBoxSizing: basaltBtnDefaultStyle.boxSizing,
				btnDefaultBorderStyle: basaltBtnDefaultStyle.borderTopStyle,
				btnOutlineBorderStyle: basaltBtnOutlineStyle.borderTopStyle,
				btnAnchorHeight: basaltBtnAnchor.getBoundingClientRect().height,
				btnAnchorTextDecoration: basaltBtnAnchorStyle.textDecorationLine,
				checkboxWidth: basaltCheckbox.getBoundingClientRect().width,
				checkboxHeight: basaltCheckbox.getBoundingClientRect().height,
				switchWidth: basaltSwitch.getBoundingClientRect().width,
				switchHeight: basaltSwitch.getBoundingClientRect().height,
				selectTriggerWidth: basaltSelectTrigger.getBoundingClientRect().width,
				selectTriggerHeight: basaltSelectTrigger.getBoundingClientRect().height,
				cardWidth: cardRect.width,
				cardInputRight: cardInputRect.right,
				cardRight: cardRect.right,
				cardPaddingLeft: Number.parseFloat(basaltCardStyle.paddingLeft),
				tableBorderCollapse: basaltTableStyle.borderCollapse,
				tableBorderSpacing: basaltTableStyle.borderSpacing,
				accordionTriggerHeight: basaltAccordionTrigger.getBoundingClientRect().height,
				accordionTriggerBorderStyle: basaltAccordionTriggerStyle.borderTopStyle,
				accordionTriggerFontFamily: basaltAccordionTriggerStyle.fontFamily,
				accordionContentVisible: basaltAccordionContent.getBoundingClientRect().height > 0,
				menuBarTriggerHeight: basaltMenuBarTrigger.getBoundingClientRect().height,
				shortcutMarginLeft: basaltShortcutStyle.marginLeft,
				shortcutLetterSpacing: basaltShortcutStyle.letterSpacing,
				shortcutFontSize: basaltShortcutStyle.fontSize,
				shortcutRight: shortcutRect.right,
				shortcutParentRight: shortcutParentRect.right,
				portalInputHeight: portalInput.getBoundingClientRect().height,
				portalInputBoxSizing: portalInputStyle.boxSizing,
				portalBtnHeight: portalBtn.getBoundingClientRect().height,
				portalBtnBoxSizing: portalBtnStyle.boxSizing,
				portalBtnBorderStyle: portalBtnStyle.borderTopStyle,
			},
		};
	});

	// 1. In standalone mode, verify host native elements are untouched (matches un-styled iframe)
	if (mode === "standalone") {
		if (data.host.inputBoxSizing !== data.raw.inputBoxSizing) {
			throw new Error(
				`host input box-sizing leaked: ${data.host.inputBoxSizing} vs raw ${data.raw.inputBoxSizing}`,
			);
		}
		if (data.host.textareaBoxSizing !== data.raw.textareaBoxSizing) {
			throw new Error(
				`host textarea box-sizing leaked: ${data.host.textareaBoxSizing} vs raw ${data.raw.textareaBoxSizing}`,
			);
		}
		if (data.host.btnBorderStyle !== data.raw.btnBorderStyle) {
			throw new Error(
				`host button border-style leaked: ${data.host.btnBorderStyle} vs raw ${data.raw.btnBorderStyle}`,
			);
		}
		if (data.host.tableBorderCollapse !== data.raw.tableBorderCollapse) {
			throw new Error(
				`host table border-collapse leaked: ${data.host.tableBorderCollapse} vs raw ${data.raw.tableBorderCollapse}`,
			);
		}
	}

	// 2. Basalt Input in 320px container: exactly 320px wide, 36px tall, border-box
	if (Math.round(data.basalt.inputWidth) !== 320) {
		throw new Error(`expected Input width 320px, got ${data.basalt.inputWidth}`);
	}
	if (Math.round(data.basalt.inputHeight) !== 36) {
		throw new Error(`expected Input height 36px, got ${data.basalt.inputHeight}`);
	}
	if (data.basalt.inputBoxSizing !== "border-box") {
		throw new Error(`expected Input border-box, got ${data.basalt.inputBoxSizing}`);
	}

	// 3. Basalt InputArea: 320px wide, height >= 80px, border-box
	if (Math.round(data.basalt.inputAreaWidth) !== 320) {
		throw new Error(`expected InputArea width 320px, got ${data.basalt.inputAreaWidth}`);
	}
	if (data.basalt.inputAreaHeight < 80) {
		throw new Error(`expected InputArea height >= 80px, got ${data.basalt.inputAreaHeight}`);
	}
	if (data.basalt.inputAreaBoxSizing !== "border-box") {
		throw new Error(`expected InputArea border-box, got ${data.basalt.inputAreaBoxSizing}`);
	}

	// 4. Buttons (Default, Outline, asChild Anchor): height 36px (h-9), border-box, no UA outset border, no native anchor underline
	if (Math.round(data.basalt.btnDefaultHeight) !== 36) {
		throw new Error(`expected Button height 36px, got ${data.basalt.btnDefaultHeight}`);
	}
	if (data.basalt.btnDefaultBorderStyle === "outset") {
		throw new Error("Button has native UA outset border");
	}
	if (data.basalt.btnOutlineBorderStyle !== "solid") {
		throw new Error(
			`Outline Button should have solid border, got ${data.basalt.btnOutlineBorderStyle}`,
		);
	}
	if (Math.round(data.basalt.btnAnchorHeight) !== 36) {
		throw new Error(
			`expected asChild Anchor Button height 36px, got ${data.basalt.btnAnchorHeight}`,
		);
	}
	if (data.basalt.btnAnchorTextDecoration === "underline") {
		throw new Error("asChild Anchor Button has native underline");
	}

	// 5. Checkbox, Switch, SelectTrigger
	if (
		Math.round(data.basalt.checkboxWidth) !== 16 ||
		Math.round(data.basalt.checkboxHeight) !== 16
	) {
		throw new Error(
			`expected Checkbox 16x16, got ${data.basalt.checkboxWidth}x${data.basalt.checkboxHeight}`,
		);
	}
	if (Math.round(data.basalt.switchWidth) !== 44 || Math.round(data.basalt.switchHeight) !== 24) {
		throw new Error(
			`expected Switch 44x24, got ${data.basalt.switchWidth}x${data.basalt.switchHeight}`,
		);
	}
	if (Math.round(data.basalt.selectTriggerWidth) !== 320) {
		throw new Error(`expected SelectTrigger width 320px, got ${data.basalt.selectTriggerWidth}`);
	}
	if (Math.round(data.basalt.selectTriggerHeight) !== 36) {
		throw new Error(`expected SelectTrigger height 36px, got ${data.basalt.selectTriggerHeight}`);
	}

	// 6. Table & Card: Table preserves separate + 0 spacing; Card nested Input does not overflow Card bounds
	if (data.basalt.tableBorderCollapse !== "separate") {
		throw new Error(
			`expected Table border-collapse: separate, got ${data.basalt.tableBorderCollapse}`,
		);
	}
	if (data.basalt.tableBorderSpacing !== "0px 0px" && data.basalt.tableBorderSpacing !== "0px") {
		throw new Error(`expected Table border-spacing: 0, got ${data.basalt.tableBorderSpacing}`);
	}
	if (Math.round(data.basalt.cardWidth) !== 320) {
		throw new Error(`expected LayerCard width 320px, got ${data.basalt.cardWidth}`);
	}
	if (data.basalt.cardInputRight > data.basalt.cardRight) {
		throw new Error(
			`Card inner input overflows card: inputRight=${data.basalt.cardInputRight} > cardRight=${data.basalt.cardRight}`,
		);
	}

	// 7. Accordion & MenuBar triggers
	if (data.basalt.accordionTriggerBorderStyle === "outset") {
		throw new Error("AccordionTrigger has UA outset border");
	}
	if (!data.basalt.accordionContentVisible) {
		throw new Error("AccordionContent did not expand on trigger click");
	}
	if (Math.round(data.basalt.menuBarTriggerHeight) !== 32) {
		throw new Error(
			`expected MenuBarTrigger height 32px (h-8), got ${data.basalt.menuBarTriggerHeight}`,
		);
	}

	// 8. CommandShortcut in flex parent: margin-left: auto pushes it to the right boundary, tracking-widest applied
	const parsedSpacing = Number.parseFloat(data.basalt.shortcutLetterSpacing);
	const parsedFontSize = Number.parseFloat(data.basalt.shortcutFontSize);
	if (!Number.isFinite(parsedSpacing) || !Number.isFinite(parsedFontSize)) {
		throw new Error(
			`CommandShortcut tracking-widest missing/invalid: letterSpacing=${data.basalt.shortcutLetterSpacing} fontSize=${data.basalt.shortcutFontSize}`,
		);
	}
	const expectedSpacing = parsedFontSize * 0.1;
	if (Math.abs(parsedSpacing - expectedSpacing) > 0.1) {
		throw new Error(
			`expected CommandShortcut tracking-widest (~${expectedSpacing}px), got ${parsedSpacing}px (letterSpacing=${data.basalt.shortcutLetterSpacing})`,
		);
	}
	if (Math.abs(data.basalt.shortcutRight - data.basalt.shortcutParentRight) > 2) {
		throw new Error(
			`CommandShortcut ml-auto did not push to right edge: shortcutRight=${data.basalt.shortcutRight} parentRight=${data.basalt.shortcutParentRight}`,
		);
	}

	// 9. Portal Content (Dialog): Portal Input and Button have proper height and border-box
	if (Math.round(data.basalt.portalInputHeight) !== 36) {
		throw new Error(`expected Portal Input height 36px, got ${data.basalt.portalInputHeight}`);
	}
	if (data.basalt.portalInputBoxSizing !== "border-box") {
		throw new Error(`expected Portal Input border-box, got ${data.basalt.portalInputBoxSizing}`);
	}
	if (Math.round(data.basalt.portalBtnHeight) !== 36) {
		throw new Error(`expected Portal Button height 36px, got ${data.basalt.portalBtnHeight}`);
	}
	if (data.basalt.portalBtnBorderStyle === "outset") {
		throw new Error("Portal Button has native UA outset border");
	}

	return data;
}
