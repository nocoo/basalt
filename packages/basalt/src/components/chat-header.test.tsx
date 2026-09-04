import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ChatHeader } from "./chat-header";

describe("ChatHeader", () => {
	it("renders title, subtitle, and actions", () => {
		render(
			<ChatHeader title="Assistant" subtitle="Home" leading={<span>AI</span>}>
				<button type="button">Close</button>
			</ChatHeader>,
		);
		expect(screen.getByText("Assistant")).toBeInTheDocument();
		expect(screen.getByText("Home")).toBeInTheDocument();
		expect(screen.getByText("AI")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
	});
});
