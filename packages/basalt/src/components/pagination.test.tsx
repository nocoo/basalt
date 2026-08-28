import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pagination } from "./pagination";

describe("Pagination", () => {
	it("shows the current page", () => {
		render(<Pagination page={2} pageCount={5} />);
		expect(screen.getByText("2 / 5")).toBeInTheDocument();
	});
});
