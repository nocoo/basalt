import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	it("renders label text", () => {
		render(<Badge>Stable</Badge>);
		expect(screen.getByText("Stable")).toBeInTheDocument();
	});
});
