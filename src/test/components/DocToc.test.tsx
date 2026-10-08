import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DocToc } from "@/pages/ui/DocToc";
import { scrollToDocSection } from "@/pages/ui/useDocTocActiveId";

describe("DocToc structure", () => {
	it("keeps anchor headings below the actual sticky panel instead of a fixed offset", () => {
		const { container } = render(
			<div data-doc-scroll style={{ paddingTop: "16px" }}>
				<div data-doc-toc-bar />
				<section id="target">Target</section>
			</div>,
		);
		const scroller = container.firstElementChild as HTMLElement;
		const bar = scroller.querySelector("[data-doc-toc-bar]") as HTMLElement;
		const section = screen.getByText("Target");
		const scrollTo = vi.fn();
		Object.assign(scroller, { scrollTo, getBoundingClientRect: () => ({ top: 20 }) });
		Object.assign(section, { getBoundingClientRect: () => ({ top: 400 }) });
		for (const height of [64, 80, 0]) {
			Object.assign(bar, { getBoundingClientRect: () => ({ height }) });
			scrollToDocSection("target");
			expect(scrollTo).toHaveBeenLastCalledWith({
				top: 400 - 20 - height - 16,
				behavior: "smooth",
			});
		}
		scrollToDocSection("missing");
		expect(scrollTo).toHaveBeenCalledTimes(3);
	});
	it("keeps the marker inside a valid list and distinguishes nested headings", () => {
		const { container } = render(
			<DocToc
				headings={[
					{ id: "usage", text: "Usage", depth: 2 },
					{ id: "setup", text: "Setup", depth: 3 },
				]}
			/>,
		);
		for (const child of container.querySelectorAll("ul > *")) expect(child.tagName).toBe("LI");
		expect(screen.getByRole("link", { name: "Usage" })).toHaveClass("pl-basalt-space-lg");
		expect(screen.getByRole("link", { name: "Setup" })).toHaveClass("pl-basalt-layout");
		expect(screen.getByRole("navigation").parentElement).toHaveAttribute("data-slot", "card-body");
	});
	it("uses section anchors and preserves click navigation", () => {
		const scrollIntoView = vi.fn();
		const { container } = render(
			<>
				<DocToc headings={[{ id: "setup", text: "Setup", depth: 2 }]} />
				<section id="setup">Example</section>
			</>,
		);
		const section = container.querySelector("#setup");
		Object.defineProperty(section, "scrollIntoView", { value: scrollIntoView });
		fireEvent.click(screen.getByRole("link", { name: "Setup" }));
		expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
	});
});
