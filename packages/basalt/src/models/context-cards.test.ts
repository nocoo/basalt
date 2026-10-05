import { describe, expect, it } from "vitest";
import { useContextCardsViewModel } from "../viewmodels/use-context-cards";
import { contextSourceHref } from "./context-cards";

describe("context model", () => {
	it.each([
		undefined,
		"",
		" javascript:alert(1)",
		"javascript:alert(1)",
		"data:text/html,evil",
		"//evil.test",
		"/\\evil.test",
		"https://user:pass@example.com",
		"https://example.com/a\n",
		"https://example.com/a b",
		"not-a-url",
	])("rejects unsafe source %s", (href) => expect(contextSourceHref(href)).toBeUndefined());
	it.each(["/files/doc.pdf", "https://example.com/a", "http://example.com/"])(
		"accepts source %s",
		(href) => expect(contextSourceHref(href)).toBe(href),
	);
	it("normalizes counts, measures Unicode text and caps stagger delay", () => {
		const chunk = { id: "a", title: "A", body: "😀界", source: { name: "a", type: "TXT" } };
		expect(useContextCardsViewModel([chunk]).chunks[0].characters).toBe(2);
		expect(useContextCardsViewModel([chunk], -2).count).toBe(1);
		expect(useContextCardsViewModel([chunk], 32.9).count).toBe(32);
		expect(useContextCardsViewModel([chunk], NaN).count).toBe(1);
		expect(useContextCardsViewModel([{ ...chunk, characters: -5 }]).chunks[0].characters).toBe(0);
		expect(useContextCardsViewModel([{ ...chunk, characters: NaN }]).chunks[0].characters).toBe(2);
		expect(
			useContextCardsViewModel(Array.from({ length: 7 }, (_, i) => ({ ...chunk, id: String(i) })))
				.chunks[6].delay,
		).toBe(240);
	});
});
