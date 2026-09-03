import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SettingsPage from "@/pages/SettingsPage";

describe("SettingsPage", () => {
	it("paints controls from the nested surface instead of card", () => {
		const { container } = render(<SettingsPage />);
		expect(container.innerHTML).not.toContain("bg-card");
		expect(container.querySelector(".bg-basalt-control")).not.toBeNull();
	});
});
