import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Fab } from "./fab";

describe("Fab", () => {
	it("renders a labeled launcher", () => {
		render(<Fab aria-label="Open assistant">AI</Fab>);
		expect(screen.getByRole("button", { name: "Open assistant" })).toBeInTheDocument();
	});

	it("hides and ignores clicks while open", () => {
		const onClick = vi.fn();
		render(
			<Fab open aria-label="Open assistant" onClick={onClick}>
				AI
			</Fab>,
		);
		const button = document.querySelector("button[aria-label='Open assistant']");
		expect(button).toHaveAttribute("aria-expanded", "true");
		expect(button).toHaveAttribute("aria-hidden", "true");
		fireEvent.click(button as HTMLButtonElement);
		expect(onClick).not.toHaveBeenCalled();
	});
});
