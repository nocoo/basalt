import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
	it("renders an accessible bar filled to the given value", () => {
		render(<Progress value={60} aria-label="Upload" />);
		const bar = screen.getByRole("progressbar", { name: "Upload" });
		expect(bar.className).toContain("bg-basalt-muted");
		const fill = bar.querySelector("[style]");
		expect(fill).toHaveStyle({ transform: "translateX(-40%)" });
	});
});
