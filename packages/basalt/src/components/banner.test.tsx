import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Banner } from "./banner";

describe("Banner", () => {
	it("renders title and description", () => {
		render(<Banner title="Update" description="A new version is ready." />);
		expect(screen.getByText("Update")).toBeInTheDocument();
		expect(screen.getByText("A new version is ready.")).toBeInTheDocument();
	});

	it("renders children without a title", () => {
		render(<Banner variant="alert">Just copy</Banner>);
		expect(screen.getByText("Just copy")).toBeInTheDocument();
	});
});
