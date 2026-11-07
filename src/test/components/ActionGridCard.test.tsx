import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { ActionGridCard } from "@/components/dashboard/ActionGridCard";
import i18n from "@/i18n";

beforeAll(async () => {
	await i18n.changeLanguage("en");
});

describe("ActionGridCard", () => {
	it("keeps the quick actions closed until one is chosen", () => {
		render(<ActionGridCard />);
		expect(screen.getByRole("heading", { name: "Quick Actions" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Book Visit" })).toHaveAttribute(
			"aria-haspopup",
			"dialog",
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("explains every action as a demo and returns focus to its own trigger", async () => {
		render(<ActionGridCard />);

		for (const label of ["Book Visit", "Log Vitals", "Add Medication", "Save Check-in"]) {
			const trigger = screen.getByRole("button", { name: label });
			trigger.focus();
			expect(trigger).toHaveFocus();

			fireEvent.click(trigger);
			const dialog = screen.getByRole("dialog");
			expect(screen.getByRole("heading", { name: `${label} — demo only` })).toBeInTheDocument();
			expect(
				screen.getByText(
					"This catalog demo shows the quick action surface. Nothing is booked, recorded, or sent anywhere.",
				),
			).toBeInTheDocument();
			expect(dialog.textContent).not.toMatch(/payment sent|signed in|success/i);

			fireEvent.click(screen.getByRole("button", { name: "Close" }));
			await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
			await waitFor(() => expect(trigger).toHaveFocus());
		}
	});
});
