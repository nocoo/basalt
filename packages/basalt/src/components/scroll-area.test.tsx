import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ScrollArea, type ScrollAreaProps } from "./scroll-area";

function acceptScrollAreaProps(_props: ScrollAreaProps) {}

describe("ScrollArea", () => {
	it("puts focus, accessible naming, scrolling, and the ref on the viewport", () => {
		const ref = createRef<HTMLDivElement>();
		const onScroll = vi.fn();
		render(
			<ScrollArea
				ref={ref}
				id="activity-shell"
				data-owner="account"
				aria-label="Recent activity"
				onScroll={onScroll}
				className="h-40"
				viewportClassName="px-3"
			>
				<p>First event</p>
			</ScrollArea>,
		);

		const root = document.querySelector('[data-slot="scroll-area"]');
		const viewport = screen.getByRole("region", { name: "Recent activity" });
		expect(root).toHaveAttribute("id", "activity-shell");
		expect(root).toHaveAttribute("data-owner", "account");
		expect(root).toHaveClass("relative", "overflow-hidden", "h-40");
		expect(root).not.toHaveAttribute("aria-label");
		expect(viewport).toHaveAttribute("data-slot", "scroll-area-viewport");
		expect(viewport).toHaveAttribute("data-orientation", "vertical");
		expect(viewport).toHaveAttribute("tabindex", "0");
		expect(viewport).toHaveClass("overflow-x-hidden!", "px-3");
		expect(ref.current).toBe(viewport);

		fireEvent.scroll(viewport);
		expect(onScroll).toHaveBeenCalledTimes(1);
	});

	it("uses labelledby, describedby, role, and tabIndex on the viewport", () => {
		render(
			<>
				<h2 id="events-title">Events</h2>
				<p id="events-help">Newest first</p>
				<ScrollArea
					aria-labelledby="events-title"
					aria-describedby="events-help"
					role="feed"
					tabIndex={-1}
				>
					Event
				</ScrollArea>
			</>,
		);
		const viewport = screen.getByRole("feed", { name: "Events" });
		expect(viewport).toHaveAccessibleDescription("Newest first");
		expect(viewport).toHaveAttribute("tabindex", "-1");
	});

	it("does not invent a region landmark when the viewport has no accessible name", () => {
		render(<ScrollArea>Unnamed content</ScrollArea>);
		const viewport = document.querySelector('[data-slot="scroll-area-viewport"]');
		expect(viewport).toBeInTheDocument();
		expect(viewport).not.toHaveAttribute("role");
		expect(viewport).toHaveAttribute("tabindex", "0");
	});

	it.each([
		["vertical", ["vertical"], "overflow-x-hidden!"],
		["horizontal", ["horizontal"], "overflow-y-hidden!"],
		["both", ["vertical", "horizontal"], undefined],
	] as const)("renders the %s scrollbar contract", (orientation, expected, hiddenClass) => {
		render(
			<ScrollArea type="always" orientation={orientation} aria-label={`${orientation} content`}>
				Content
			</ScrollArea>,
		);
		const viewport = screen.getByRole("region", { name: `${orientation} content` });
		expect(viewport).toHaveAttribute("data-orientation", orientation);
		if (hiddenClass) {
			expect(viewport).toHaveClass(hiddenClass);
		} else {
			expect(viewport).not.toHaveClass("overflow-x-hidden!", "overflow-y-hidden!");
		}
		expect(
			Array.from(document.querySelectorAll('[data-slot="scroll-area-scrollbar"]')).map((node) =>
				node.getAttribute("data-orientation"),
			),
		).toEqual(expected);
	});

	it("keeps the public type to the supported orientation values", () => {
		acceptScrollAreaProps({ orientation: "vertical" });
		acceptScrollAreaProps({ orientation: "horizontal", viewportClassName: "pb-2" });
		acceptScrollAreaProps({ orientation: "both", className: "size-40" });
		// @ts-expect-error unsupported orientation
		acceptScrollAreaProps({ orientation: "inline" });
	});
});
