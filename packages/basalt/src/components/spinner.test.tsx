import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
	it("renders a live status indicator with default label and md size", () => {
		render(<Spinner />);
		const spinner = screen.getByRole("status", { name: "Loading" });
		expect(spinner.tagName.toLowerCase()).toBe("svg");
		expect(spinner).toHaveAttribute("data-slot", "spinner");
		expect(spinner).toHaveAttribute("data-size", "md");
		expect(spinner).toHaveClass(
			"basalt-ui",
			"animate-basalt-spin",
			"motion-reduce:animate-none",
			"size-basalt-icon",
		);
	});

	it("supports custom label, aria-label, and aria-labelledby", () => {
		const { rerender } = render(<Spinner label="Saving changes" />);
		expect(screen.getByRole("status", { name: "Saving changes" })).toBeInTheDocument();

		rerender(<Spinner label="Ignored" aria-label="Custom label" />);
		expect(screen.getByRole("status", { name: "Custom label" })).toBeInTheDocument();

		rerender(
			<div>
				<span id="spinner-heading">Uploading bundle</span>
				<Spinner aria-labelledby="spinner-heading" />
			</div>,
		);
		const labeled = screen.getByRole("status", { name: "Uploading bundle" });
		expect(labeled).not.toHaveAttribute("aria-label");
	});

	it("suppresses status role and label when aria-hidden is set", () => {
		const { container } = render(<Spinner aria-hidden="true" />);
		const svg = container.querySelector("svg");
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute("aria-hidden", "true");
		expect(svg).not.toHaveAttribute("role");
		expect(svg).not.toHaveAttribute("aria-label");
	});

	it("applies sm, md, and lg size tokens and forwards ref", () => {
		const ref = createRef<SVGSVGElement>();
		const { rerender } = render(<Spinner ref={ref} size="sm" className="text-basalt-primary" />);
		expect(ref.current).toBeInstanceOf(SVGSVGElement);
		expect(ref.current).toHaveClass("size-basalt-icon-sm", "text-basalt-primary");

		rerender(<Spinner size="lg" />);
		expect(screen.getByRole("status")).toHaveClass("size-basalt-6");
	});
});
