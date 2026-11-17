import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import i18n from "@/i18n";
import { DEFAULT_CUSTOM_SPECIMEN, TYPE_SCALE_TIERS } from "@/models/typeface";
import TypefacePage from "@/pages/TypefacePage";

describe("TypefacePage", () => {
	it("renders all three font families, seven scale tiers, OpenType/numeric sections, and clean surfaces", () => {
		const { container } = render(<TypefacePage />);
		expect(screen.getByRole("heading", { level: 1, name: "Typeface" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "DM Sans" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "Inter" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { level: 3, name: "JetBrains Mono" })).toBeInTheDocument();

		for (const tier of TYPE_SCALE_TIERS) {
			const specimen = container.querySelector(`[data-typeface-tier="${tier.id}"]`);
			expect(specimen, tier.id).not.toBeNull();
			expect(specimen).toHaveTextContent(tier.roleSpecimen);
		}

		expect(screen.getByRole("heading", { name: "Glyph disambiguation" })).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Tabular vs proportional numerals" }),
		).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Typography norms" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Anti-patterns to avoid" })).toBeInTheDocument();

		expect(container.querySelector("[data-basalt-surface]")).not.toBeNull();
		expect(container.querySelector(".bg-card")).toBeNull();
		expect(container.querySelector(".bg-muted")).toBeNull();
	});

	it("switches between Roles, Bilingual, and Custom specimen preview modes", () => {
		const { container } = render(<TypefacePage />);
		const group = screen.getByRole("radiogroup", { name: "Specimen preview mode" });

		fireEvent.click(within(group).getByRole("radio", { name: "Bilingual" }));
		expect(container.querySelector('[data-typeface-tier="3xl"]')).toHaveTextContent(
			TYPE_SCALE_TIERS[0].bilingualSpecimen,
		);

		fireEvent.click(within(group).getByRole("radio", { name: "Custom" }));
		const input = screen.getByRole("textbox", { name: "Custom specimen preview text" });
		fireEvent.change(input, { target: { value: "System Zero Typography" } });
		for (const tier of TYPE_SCALE_TIERS) {
			expect(container.querySelector(`[data-typeface-tier="${tier.id}"]`)).toHaveTextContent(
				"System Zero Typography",
			);
		}

		fireEvent.click(screen.getByRole("button", { name: "Reset" }));
		expect(input).toHaveValue(DEFAULT_CUSTOM_SPECIMEN);
		expect(container.querySelector('[data-typeface-tier="md"]')).toHaveTextContent(
			DEFAULT_CUSTOM_SPECIMEN,
		);
	});

	it("supports Chinese localization", async () => {
		const previous = i18n.language;
		try {
			await act(async () => i18n.changeLanguage("zh"));
			render(<TypefacePage />);
			expect(screen.getByRole("heading", { level: 1, name: "字体排版" })).toBeInTheDocument();
			expect(screen.getByRole("heading", { name: "字体族体系" })).toBeInTheDocument();
			expect(screen.getByRole("heading", { name: "七级位置化字号体系" })).toBeInTheDocument();
		} finally {
			await act(async () => i18n.changeLanguage(previous));
		}
	});
});
