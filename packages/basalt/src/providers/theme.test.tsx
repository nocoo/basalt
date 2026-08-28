import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
	const { theme } = useTheme();
	return <span>theme:{theme}</span>;
}

describe("ThemeProvider", () => {
	it("provides a default system theme without reading storage at module load", () => {
		render(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByText("theme:system")).toBeInTheDocument();
	});

	it("throws outside the provider", () => {
		expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
	});
});
