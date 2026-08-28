import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LinkProvider } from "../providers/link";
import { Link } from "./link";

describe("Link", () => {
	it("renders an anchor", () => {
		render(
			<LinkProvider>
				<Link href="/docs">Docs</Link>
			</LinkProvider>,
		);
		expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
	});
});
