import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Dock } from "./dock";

describe("Dock", () => {
	it("collapses width when closed", () => {
		render(
			<Dock open={false} aria-label="Assistant">
				Panel
			</Dock>,
		);
		const dock = screen.getByLabelText("Assistant");
		expect(dock).toHaveStyle({ width: "0px" });
		expect(dock).toHaveAttribute("aria-hidden", "true");
	});

	it("opens to the given width", () => {
		render(
			<Dock open width="24rem" aria-label="Assistant">
				Panel
			</Dock>,
		);
		const dock = screen.getByLabelText("Assistant");
		expect(dock).toHaveStyle({ width: "384px" });
		expect(dock).toHaveAttribute("aria-hidden", "false");
		expect(screen.getByText("Panel")).toBeInTheDocument();
	});
});
