import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { Banner } from "./banner";
import { GridItem } from "./grid";
import { LayerCard } from "./layer-card";
import { StatCard } from "./stat-card";
import { StatStrip } from "./stat-strip";
import { UploadItem } from "./upload-queue";

describe("content surface ownership", () => {
	it.each<[string, ComponentType]>([
		["neutral banner", () => <Banner>Content</Banner>],
		["grid item", () => <GridItem>Content</GridItem>],
		["stat item", () => <StatStrip items={[{ label: "Content", value: 1 }]} />],
		["metric card", () => <StatCard label="Content" value="1" />],
		["upload item", () => <UploadItem file={{ id: "file", name: "Content", status: "queued" }} />],
	])("lets the shared surface stack paint a nested %s", (_, Example) => {
		render(
			<LayerCard>
				<LayerCard.Well>
					<Example />
				</LayerCard.Well>
			</LayerCard>,
		);
		const surface = screen.getByText("Content").closest("[data-basalt-surface]");
		expect(surface).toBeTruthy();
		expect(surface).not.toHaveAttribute("data-slot", "card-well");
		expect(surface).not.toHaveClass(
			"bg-basalt-muted",
			"bg-basalt-card",
			"bg-basalt-secondary",
			"bg-basalt-accent",
		);
	});

	it("keeps semantic banners outside the neutral stack", () => {
		render(<Banner tone="danger">Failure</Banner>);
		expect(screen.getByText("Failure")).not.toHaveAttribute("data-basalt-surface");
	});
});
