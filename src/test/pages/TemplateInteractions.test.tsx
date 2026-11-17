import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AgentWorkspaceTemplate from "@/templates/AgentWorkspaceTemplate";
import ExecutiveDashboardTemplate from "@/templates/ExecutiveDashboardTemplate";
import OpsInboxTemplate from "@/templates/OpsInboxTemplate";
import VisitorLoginTemplate from "@/templates/VisitorLoginTemplate";
import WorkspaceSettingsTemplate from "@/templates/WorkspaceSettingsTemplate";

describe("standalone template interactions", () => {
	it("keeps agent sessions, decisions, artifacts and tasks interactive", () => {
		render(
			<TooltipProvider>
				<AgentWorkspaceTemplate />
			</TooltipProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Prepare deployment plan" }));
		expect(screen.getByText("Prepare a deployment plan.")).toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Message" }), {
			target: { value: "Review the logs" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Send" }));
		expect(screen.getByText("Review the logs")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Remove checks.json" }));
		expect(screen.queryByText("checks.json")).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "changes.diff" }));
		expect(screen.getByText(/retries/)).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Stop" }));
		expect(screen.getByText("Indexing stopped")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "New session" }));
		expect(screen.queryByText("Review the logs")).not.toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Start a session" })).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Prepare deployment plan" }),
		).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Release readiness" }));
		expect(screen.getByText("Review the logs")).toBeInTheDocument();
	});
	it("triages incidents and records runbook actions", () => {
		render(
			<TooltipProvider>
				<OpsInboxTemplate />
			</TooltipProvider>,
		);
		const check = screen.getByRole("checkbox", { name: "Confirm the alert" });
		fireEvent.click(check);
		expect(check).toBeChecked();
		fireEvent.click(screen.getByRole("button", { name: "Escalate" }));
		expect(screen.getByText("escalated")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
		expect(screen.getByText("resolved")).toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Search incidents" }), {
			target: { value: "backlog" },
		});
		expect(screen.getByRole("button", { name: /Queue backlog growing/ })).toBeInTheDocument();
	});
	it("filters and sorts executive accounts", () => {
		render(
			<TooltipProvider>
				<ExecutiveDashboardTemplate />
			</TooltipProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: "Filter accounts" }), {
			target: { value: "Evergreen" },
		});
		expect(screen.getByText("Evergreen")).toBeInTheDocument();
		expect(screen.queryByText("Meridian")).not.toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Filter accounts" }), {
			target: { value: "" },
		});
		fireEvent.click(screen.getByRole("button", { name: /Revenue/ }));
		expect(screen.getByText("Meridian")).toBeInTheDocument();
	});
	it("updates settings, switches, keys and quotas", () => {
		render(
			<TooltipProvider>
				<WorkspaceSettingsTemplate />
			</TooltipProvider>,
		);
		fireEvent.change(screen.getByLabelText("Workspace name"), {
			target: { value: "New workspace" },
		});
		fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
		expect(screen.getByRole("status")).toHaveTextContent("saved locally");
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Members" }));
		const invite = screen.getByRole("switch", { name: "Allow member invitations" });
		fireEvent.click(invite);
		expect(invite).not.toBeChecked();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "API Keys" }));
		fireEvent.click(screen.getByRole("button", { name: "Create key" }));
		const row = screen.getByText(/New key 1/).closest("div");
		if (!row) throw new Error("Missing key row");
		fireEvent.click(within(row).getByRole("button", { name: "Revoke" }));
		expect(screen.queryByText(/New key 1/)).not.toBeInTheDocument();
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Quotas" }));
		expect(screen.getByRole("meter", { name: "API requests" })).toBeInTheDocument();
	});
	it("verifies the local login demo without submitting credentials", () => {
		render(<VisitorLoginTemplate />);
		fireEvent.change(screen.getByLabelText("Email"), { target: { value: "visitor@example.com" } });
		fireEvent.change(screen.getByLabelText("Password"), { target: { value: "example" } });
		fireEvent.click(screen.getByRole("switch", { name: "Use verification code" }));
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(screen.getByRole("status")).toHaveTextContent("123456");
		fireEvent.change(screen.getByLabelText("Verification code"), { target: { value: "123456" } });
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(screen.getByRole("status")).toHaveTextContent("No credentials were sent");
	});
});
