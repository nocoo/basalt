import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { StatCard } from "../charts/stat-card";
import { Banner } from "./banner";
import { ChatBubble } from "./chat-bubble";
import { ChatMessage } from "./chat-message";
import { FlowNode } from "./flow";
import { GridItem } from "./grid";
import { LayerCard } from "./layer-card";
import { StatStrip } from "./stat-strip";
import { UploadItem } from "./upload-queue";

describe("content surface ownership", () => {
	it.each<[string, ComponentType]>([
		["neutral banner", () => <Banner variant="secondary">Content</Banner>],
		["assistant bubble", () => <ChatBubble>Content</ChatBubble>],
		["user message", () => <ChatMessage variant="user" content="Content" />],
		[
			"flow node",
			() => (
				<ol>
					<FlowNode>Content</FlowNode>
				</ol>
			),
		],
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

	it("keeps semantic banners and solid user bubbles outside the neutral stack", () => {
		render(
			<>
				<Banner variant="error">Failure</Banner>
				<ChatBubble variant="user">Sent</ChatBubble>
			</>,
		);
		expect(screen.getByText("Failure")).not.toHaveAttribute("data-basalt-surface");
		expect(screen.getByText("Sent")).not.toHaveAttribute("data-basalt-surface");
	});
});
