import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback, AvatarInitials } from "./avatar";

describe("Avatar", () => {
	it("renders a colored circular two-letter identity and supports overrides", () => {
		const { rerender } = render(<AvatarInitials name="Alpine Churn" size="sm" colorKey="stable" />);
		expect(screen.getByRole("img", { name: "Alpine Churn" })).toHaveClass(
			"rounded-basalt-full",
			"size-basalt-6",
		);
		expect(screen.getByText("AC")).toHaveClass("text-basalt-xs");
		expect(screen.getByText("AC")).not.toHaveClass("text-basalt-sm");
		const color = screen.getByText("AC").className;
		rerender(<AvatarInitials name="Amber Scoop" size="sm" colorKey="stable" />);
		expect(screen.getByText("AS").className).toBe(color);
		rerender(<AvatarInitials name="Fallback" initials=" xy more " />);
		expect(screen.getByText("XY")).toHaveClass("text-basalt-sm");
		rerender(<AvatarInitials name="Fallback" initials="  " />);
		expect(screen.getByText("FA")).toBeInTheDocument();
	});
	it("renders fallback initials", () => {
		render(
			<Avatar>
				<AvatarFallback>ZL</AvatarFallback>
			</Avatar>,
		);
		expect(screen.getByText("ZL")).toBeInTheDocument();
	});
});
