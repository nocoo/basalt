import { act, render, screen } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router";
import { describe, expect, it } from "vitest";
import { DeferredToaster } from "@/components/DeferredToaster";

let navigate: ReturnType<typeof useNavigate>;

function Navigation() {
	navigate = useNavigate();
	return null;
}

describe("landing-only deferrals", () => {
	it("mounts the toaster with the first non-landing route and keeps it", async () => {
		const { container } = render(
			<MemoryRouter initialEntries={["/"]}>
				<Navigation />
				<DeferredToaster />
			</MemoryRouter>,
		);
		expect(container.innerHTML).toBe("");
		await act(async () => navigate("/dashboard"));
		expect(await screen.findByRole("region", { name: /Notifications/ })).toBeInTheDocument();
		await act(async () => navigate("/"));
		expect(screen.getByRole("region", { name: /Notifications/ })).toBeInTheDocument();
	});
});
