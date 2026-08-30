import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from "./timeline";

describe("Timeline", () => {
	it("renders items without id or at as a named list with title rows", () => {
		render(<Timeline items={[{ title: "Queued" }, { title: "Packed" }]} ariaLabel="Stages" />);
		const list = screen.getByRole("list", { name: "Stages" });
		const rows = within(list).getAllByRole("listitem");
		expect(rows).toHaveLength(2);
		const firstSpans = rows[0].querySelectorAll("span");
		const secondSpans = rows[1].querySelectorAll("span");
		expect(firstSpans).toHaveLength(2);
		expect(firstSpans[0]).toHaveClass("text-basalt-muted-foreground");
		expect(firstSpans[0]).toHaveTextContent("");
		expect(firstSpans[1]).toHaveTextContent("Queued");
		expect(secondSpans).toHaveLength(2);
		expect(secondSpans[1]).toHaveTextContent("Packed");
		expect(within(list).queryByText("Mon")).toBeNull();
		expect(within(list).queryByText("Tue")).toBeNull();
	});

	it("keeps a colored subtitle event and a bare event in the same hour slot", () => {
		render(
			<Timeline
				ariaLabel="Day"
				events={[
					{
						id: "wake",
						time: "14:10",
						title: "Wake",
						subtitle: "Rested",
						color: "bg-indigo-500",
					},
					{
						id: "hydrate",
						time: "14:55",
						title: "Hydrate",
					},
				]}
			/>,
		);
		const list = screen.getByRole("list", { name: "Day" });
		const slot = screen.getByText("14:00").closest("li");
		expect(slot).not.toBeNull();
		if (!slot) {
			throw new Error("expected 14:00 hour slot");
		}
		expect(within(slot).getByText("Wake")).toBeInTheDocument();
		expect(within(slot).getByText("Hydrate")).toBeInTheDocument();
		expect(within(slot).getByText("14:10")).toBeInTheDocument();
		expect(within(slot).getByText("14:55")).toBeInTheDocument();
		const otherHour = screen.getByText("15:00").closest("li");
		expect(otherHour).not.toBeNull();
		if (!otherHour) {
			throw new Error("expected 15:00 hour slot");
		}
		expect(within(otherHour).queryByText("Wake")).toBeNull();
		expect(within(otherHour).queryByText("Hydrate")).toBeNull();

		const colored = within(slot).getByText("Wake").closest("div");
		expect(colored).toHaveClass("bg-indigo-500");
		expect(colored).toHaveClass("text-white");
		expect(within(colored as HTMLElement).getByText("Rested")).toHaveClass("text-white/80");

		const bare = within(slot).getByText("Hydrate").closest("div");
		expect(bare).toHaveClass("bg-basalt-muted");
		expect(bare).not.toHaveClass("text-white");
		expect(within(bare as HTMLElement).queryByText("Rested")).toBeNull();
		expect(bare?.querySelectorAll("span")).toHaveLength(2);
		expect(list).toBeInTheDocument();
	});
});
