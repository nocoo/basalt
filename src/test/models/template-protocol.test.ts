import { describe, expect, it } from "vitest";
import {
	createTemplateActivePartMessage,
	createTemplateFocusMessage,
	createTemplateReadyMessage,
	createTemplateThemeMessage,
	parseTemplateChildMessage,
	parseTemplateParentMessage,
} from "@/models/template-protocol";

describe("template viewport postMessage protocol", () => {
	it("builds and parses valid parent-to-viewport messages", () => {
		const themeMsg = createTemplateThemeMessage("dark");
		expect(parseTemplateParentMessage(themeMsg)).toEqual({
			type: "basalt-template-theme",
			theme: "dark",
		});

		const focusMsg = createTemplateFocusMessage("agent-trace");
		expect(parseTemplateParentMessage(focusMsg)).toEqual({
			type: "basalt-template-focus",
			partId: "agent-trace",
		});
	});

	it("rejects malformed or unknown parent messages", () => {
		expect(parseTemplateParentMessage(null)).toBeNull();
		expect(parseTemplateParentMessage("theme")).toBeNull();
		expect(parseTemplateParentMessage({})).toBeNull();
		expect(parseTemplateParentMessage({ type: "unknown" })).toBeNull();
		expect(
			parseTemplateParentMessage({ type: "basalt-template-theme", theme: "sepia" }),
		).toBeNull();
		expect(parseTemplateParentMessage({ type: "basalt-template-focus", partId: "" })).toBeNull();
		expect(parseTemplateParentMessage({ type: "basalt-template-focus", partId: 42 })).toBeNull();
	});

	it("builds and parses child ready and active-part messages and rejects invalid payloads", () => {
		const readyMsg = createTemplateReadyMessage("agent-workspace");
		expect(parseTemplateChildMessage(readyMsg)).toEqual({
			type: "basalt-template-ready",
			slug: "agent-workspace",
		});

		const activeMsg = createTemplateActivePartMessage("ops-inbox", "ops-runbook");
		expect(parseTemplateChildMessage(activeMsg)).toEqual({
			type: "basalt-template-active-part",
			slug: "ops-inbox",
			partId: "ops-runbook",
		});

		expect(parseTemplateChildMessage(null)).toBeNull();
		expect(parseTemplateChildMessage({ type: "other" })).toBeNull();
		expect(
			parseTemplateChildMessage({
				type: "basalt-template-active-part",
				slug: "unknown",
				partId: "ops-runbook",
			}),
		).toBeNull();
		expect(
			parseTemplateChildMessage({
				type: "basalt-template-active-part",
				slug: "ops-inbox",
				partId: "",
			}),
		).toBeNull();
	});
});
