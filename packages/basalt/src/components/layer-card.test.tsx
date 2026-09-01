import { render, screen } from "@testing-library/react";
import { createRef, Fragment } from "react";
import { describe, expect, it } from "vitest";
import { LayerCard, type LayerCardProps } from "./layer-card";

function acceptLayerCardProps(_props: LayerCardProps) {}

describe("LayerCard", () => {
	it("renders a single surface by default", () => {
		render(<LayerCard>Body</LayerCard>);
		expect(screen.getByText("Body").className).toContain("bg-basalt-bright");
		expect(screen.getByText("Body").className).toContain("ring-1");
	});

	it("layers a muted header over a raised primary card", () => {
		render(
			<LayerCard>
				<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
				<LayerCard.Primary>Hello</LayerCard.Primary>
			</LayerCard>,
		);
		const header = screen.getByText("Next Steps");
		const body = screen.getByText("Hello");
		expect(header.className).toContain("text-basalt-muted-foreground");
		expect(body.className).toContain("bg-basalt-bright");
		expect(body.className).toContain("rounded-basalt-lg");
		expect(header.parentElement?.className).toContain("bg-basalt-muted");
	});

	it("keeps a single bright surface for ordinary element children", () => {
		render(
			<LayerCard>
				<span>Plain</span>
			</LayerCard>,
		);
		const label = screen.getByText("Plain");
		const root = label.parentElement;
		expect(label.tagName).toBe("SPAN");
		expect(root?.className).toContain("bg-basalt-bright");
		expect(root?.className).toContain("shadow-xs");
		expect(root?.className).not.toContain("bg-basalt-muted");
		expect(root?.className).not.toContain("flex-col");
	});

	it("recurses through a fragment to recognize a nested primary section", () => {
		render(
			<LayerCard>
				<Fragment key="nested">
					<span>Lead</span>
					<LayerCard.Primary>Raised</LayerCard.Primary>
				</Fragment>
			</LayerCard>,
		);
		const lead = screen.getByText("Lead");
		const body = screen.getByText("Raised");
		const root = lead.parentElement;
		expect(root?.className).toContain("bg-basalt-muted");
		expect(root?.className).toContain("flex-col");
		expect(root?.className).not.toContain("shadow-xs");
		expect(body.className).toContain("bg-basalt-bright");
		expect(body.className).toContain("rounded-basalt-lg");
		expect(body.parentElement).toBe(root);
	});

	it("layers from a direct primary without a preceding secondary", () => {
		render(
			<LayerCard>
				<LayerCard.Primary>Solo</LayerCard.Primary>
			</LayerCard>,
		);
		const body = screen.getByText("Solo");
		expect(body.className).toContain("bg-basalt-bright");
		expect(body.className).toContain("rounded-basalt-lg");
		expect(body.parentElement?.className).toContain("bg-basalt-muted");
		expect(body.parentElement?.className).toContain("flex-col");
	});

	it("accepts className and native div props and rejects a wrong className type", () => {
		acceptLayerCardProps({ className: "w-[250px]", padding: "md" });
		acceptLayerCardProps({
			id: "card",
			role: "region",
			style: { display: "block" },
			"aria-label": "Card",
			onClick: () => undefined,
		});
		// @ts-expect-error className must be a string
		acceptLayerCardProps({ className: 1 });
		// @ts-expect-error padding must be a supported spacing token
		acceptLayerCardProps({ padding: "xl" });
	});

	it("applies optional root padding without changing the default surface", () => {
		const { rerender } = render(<LayerCard data-testid="card">Body</LayerCard>);
		const card = screen.getByTestId("card");
		expect(card).not.toHaveClass("p-3", "p-4", "p-6");

		for (const [padding, className] of [
			["sm", "p-3"],
			["md", "p-4"],
			["lg", "p-6"],
		] as const) {
			rerender(
				<LayerCard data-testid="card" padding={padding}>
					Body
				</LayerCard>,
			);
			expect(card).toHaveClass(className);
		}
	});

	it("composes header, body, and footer sections", () => {
		render(
			<LayerCard aria-label="Deployment">
				<LayerCard.Header data-testid="header">Release</LayerCard.Header>
				<LayerCard.Body data-testid="body">Ready to deploy</LayerCard.Body>
				<LayerCard.Footer data-testid="footer">Actions</LayerCard.Footer>
			</LayerCard>,
		);
		expect(screen.getByLabelText("Deployment")).toHaveClass("bg-basalt-bright", "ring-1");
		expect(screen.getByTestId("header")).toHaveClass("border-b", "px-4", "py-3");
		expect(screen.getByTestId("body")).toHaveClass("p-4");
		expect(screen.getByTestId("footer")).toHaveClass("border-t", "justify-end", "px-4", "py-3");
	});

	it("renders an accessible loading state with reduced-motion-safe skeletons", () => {
		render(<LayerCard.Loading label="Loading metrics" data-testid="loading" />);
		const loading = screen.getByRole("status", { name: "Loading metrics" });
		expect(loading).toBe(screen.getByTestId("loading"));
		expect(loading).toHaveClass("space-y-3", "p-4");
		const skeletons = loading.querySelectorAll('[aria-hidden="true"]');
		expect(skeletons).toHaveLength(3);
		for (const skeleton of skeletons) {
			expect(skeleton.querySelector("span")).toHaveClass("motion-reduce:animate-none");
		}
	});

	it("renders a reusable empty state and forwards native props", () => {
		render(
			<LayerCard.Empty
				title="No activity"
				description="New events will appear here."
				icon={<svg aria-label="Inbox" />}
				data-testid="empty"
				className="extra"
			/>,
		);
		const empty = screen.getByTestId("empty");
		expect(empty).toHaveClass("p-8", "extra");
		expect(screen.getByText("No activity")).toBeInTheDocument();
		expect(screen.getByText("New events will appear here.")).toBeInTheDocument();
		expect(screen.getByLabelText("Inbox")).toBeInTheDocument();
	});

	it("forwards class, id, data attributes, and ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<LayerCard ref={ref} className="extra" id="card" data-kind="card">
				Body
			</LayerCard>,
		);
		const root = screen.getByText("Body");
		expect(root).toHaveAttribute("id", "card");
		expect(root).toHaveAttribute("data-kind", "card");
		expect(root.className).toContain("extra");
		expect(root.className).toContain("bg-basalt-bright");
		expect(ref.current).toBe(root);
	});
});
