import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NavigationPage from "@/pages/NavigationPage";

const source = readFileSync("src/pages/NavigationPage.tsx", "utf8");

describe("NavigationPage", () => {
	it("uses TablePager for the with-context range instead of a hand-built string", () => {
		expect(source).toContain("@nocoo/basalt/components/table-pager");
		expect(source).toContain("formatRange");
		expect(source).toContain('t("common.showing")');
		expect(source).toContain('t("common.of")');
		expect(source).toContain('t("common.results")');
		expect(source).not.toContain("41-50");
		expect(source).toContain("<Pagination page={page1}");
		expect(source).toContain("<Pagination page={page2} pageCount={20}");
	});

	it("renders the contextual range through TablePager", () => {
		render(<NavigationPage />);
		expect(screen.getByText("41-50")).toBeInTheDocument();
		expect(screen.getByText("200")).toBeInTheDocument();
		expect(screen.getAllByRole("navigation", { name: "Pagination" })).toHaveLength(3);
	});
});
