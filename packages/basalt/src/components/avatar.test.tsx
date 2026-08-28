import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarFallback } from "./avatar";

describe("Avatar", () => {
	it("renders fallback initials", () => {
		render(
			<Avatar>
				<AvatarFallback>ZL</AvatarFallback>
			</Avatar>,
		);
		expect(screen.getByText("ZL")).toBeInTheDocument();
	});
});
