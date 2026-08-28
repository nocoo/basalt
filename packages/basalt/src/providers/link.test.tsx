import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkProvider, useLinkComponent } from "./link";

function Probe() {
	const Comp = useLinkComponent();
	return <Comp href="/x">Go</Comp>;
}

describe("LinkProvider", () => {
	it("defaults to an anchor", () => {
		render(
			<LinkProvider>
				<Probe />
			</LinkProvider>,
		);
		expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute("href", "/x");
	});
});
