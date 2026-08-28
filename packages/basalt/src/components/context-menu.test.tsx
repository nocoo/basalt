import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContextMenu, ContextMenuTrigger } from "./context-menu";

describe("ContextMenu", () => {
	it("renders a trigger", () => {
		render(
			<ContextMenu>
				<ContextMenuTrigger>Right click</ContextMenuTrigger>
			</ContextMenu>,
		);
		expect(screen.getByText("Right click")).toBeInTheDocument();
	});
});
