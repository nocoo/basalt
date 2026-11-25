import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AgentWorkspaceTemplate from "@/templates/AgentWorkspaceTemplate";
import DocumentPageTemplate from "@/templates/DocumentPageTemplate";
import ExecutiveDashboardTemplate from "@/templates/ExecutiveDashboardTemplate";
import NotFoundTemplate from "@/templates/NotFoundTemplate";
import OpsInboxTemplate from "@/templates/OpsInboxTemplate";
import VisitorLoginTemplate from "@/templates/VisitorLoginTemplate";
import WorkspaceSettingsTemplate from "@/templates/WorkspaceSettingsTemplate";

afterEach(() => vi.restoreAllMocks());

describe("standalone template interactions", () => {
	it("keeps agent sessions, decisions, artifacts and tasks interactive", () => {
		render(
			<TooltipProvider>
				<AgentWorkspaceTemplate />
			</TooltipProvider>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Prepare deployment plan" }));
		expect(screen.getByText("Prepare a deployment plan.")).toBeInTheDocument();
		expect(screen.getByText("Pending approval")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Request changes" }));
		expect(screen.getByText("Changes requested")).toBeInTheDocument();
		expect(screen.getByText("Requested follow-up diff review.")).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Approve migration" }));
		expect(screen.getByText("Approved")).toBeInTheDocument();
		expect(screen.getByText("Approved migration plan for release.")).toBeInTheDocument();
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
	it("keeps incident actions synchronized with the visible queue", () => {
		render(
			<TooltipProvider>
				<OpsInboxTemplate />
			</TooltipProvider>,
		);
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Open" }));
		fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
		expect(
			screen.getByText("Queue backlog growing", { selector: "[data-slot=card-header]" }),
		).toBeInTheDocument();
		expect(screen.getByRole("button", { name: /Queue backlog growing/ })).toHaveAttribute(
			"aria-current",
			"page",
		);
		fireEvent.click(screen.getByRole("button", { name: "Resolve" }));
		expect(screen.getByText("No incident selected")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Escalate" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
		expect(screen.getByRole("button", { name: "Escalate" })).toBeInTheDocument();
		fireEvent.change(screen.getByRole("textbox", { name: "Search incidents" }), {
			target: { value: "no such incident" },
		});
		expect(screen.getByText("No incident selected")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Resolve" })).not.toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
		expect(screen.getByRole("textbox", { name: "Search incidents" })).toHaveValue("");
	});
	it.each([
		{
			name: "executive dashboard",
			Template: ExecutiveDashboardTemplate,
			title: "Dashboard navigation",
			item: "Accounts",
		},
		{ name: "operations inbox", Template: OpsInboxTemplate, title: "Operations", item: "Runbooks" },
		{
			name: "workspace settings",
			Template: WorkspaceSettingsTemplate,
			title: "Workspace navigation",
			item: "Members",
		},
	])(
		"opens $name mobile navigation and returns focus after navigation",
		async ({ Template, title, item }) => {
			vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
				matches: true,
				media: query,
				onchange: null,
				addListener() {},
				removeListener() {},
				addEventListener() {},
				removeEventListener() {},
				dispatchEvent: () => true,
			}));
			const view = render(
				<TooltipProvider>
					<Template />
				</TooltipProvider>,
			);
			const accounts = view.container.querySelector("#account-list");
			if (accounts) Object.defineProperty(accounts, "scrollIntoView", { value: vi.fn() });
			const trigger = screen.getByRole("button", { name: "Open navigation" });
			act(() => trigger.focus());
			fireEvent.click(trigger);
			const dialog = screen.getByRole("dialog", { name: title });
			fireEvent.click(within(dialog).getByRole("button", { name: item }));
			await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
			if (item === "Runbooks") {
				await waitFor(() =>
					expect(screen.getByRole("checkbox", { name: "Confirm the alert" })).toHaveFocus(),
				);
			} else await waitFor(() => expect(trigger).toHaveFocus());
			fireEvent.click(trigger);
			fireEvent.keyDown(document, { key: "Escape" });
			await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
			await waitFor(() => expect(trigger).toHaveFocus());
			fireEvent.click(trigger);
			fireEvent.click(
				within(screen.getByRole("dialog", { name: title })).getByRole("button", {
					name: "Close navigation",
				}),
			);
			await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
			await waitFor(() => expect(trigger).toHaveFocus());
			if (item === "Members")
				expect(
					screen.getByRole("switch", { name: "Allow member invitations" }),
				).toBeInTheDocument();
		},
	);
	it("returns to the menu when no runbook exists", async () => {
		vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
			matches: true,
			media: query,
			onchange: null,
			addListener() {},
			removeListener() {},
			addEventListener() {},
			removeEventListener() {},
			dispatchEvent: () => true,
		}));
		render(
			<TooltipProvider>
				<OpsInboxTemplate />
			</TooltipProvider>,
		);
		fireEvent.change(screen.getByRole("textbox", { name: "Search incidents" }), {
			target: { value: "missing" },
		});
		const trigger = screen.getByRole("button", { name: "Open navigation" });
		fireEvent.click(trigger);
		fireEvent.click(
			within(screen.getByRole("dialog", { name: "Operations" })).getByRole("button", {
				name: "Runbooks",
			}),
		);
		await waitFor(() => expect(trigger).toHaveFocus());
	});
	it.each([
		["agent", AgentWorkspaceTemplate],
		["dashboard", ExecutiveDashboardTemplate],
		["inbox", OpsInboxTemplate],
		["settings", WorkspaceSettingsTemplate],
	] as const)("keeps %s navigation available at fractional widths", (_name, Template) => {
		let width = 767.5;
		const listeners = new Set<EventListenerOrEventListenerObject>();
		const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
			matches: query === "(width < 768px)" && width < 768,
			media: query,
			onchange: null,
			addListener() {},
			removeListener() {},
			addEventListener(_type: string, listener: EventListenerOrEventListenerObject | null) {
				if (listener) listeners.add(listener);
			},
			removeEventListener(_type: string, listener: EventListenerOrEventListenerObject | null) {
				if (listener) listeners.delete(listener);
			},
			dispatchEvent: () => true,
		}));
		render(
			<TooltipProvider>
				<Template />
			</TooltipProvider>,
		);
		expect(matchMedia).toHaveBeenCalledWith("(width < 768px)");
		expect(screen.getByRole("button", { name: "Open navigation" })).toBeInTheDocument();
		width = 768;
		act(() => {
			for (const listener of listeners) {
				if (typeof listener === "function") listener(new Event("change"));
				else listener.handleEvent(new Event("change"));
			}
		});
		expect(screen.queryByRole("button", { name: "Open navigation" })).not.toBeInTheDocument();
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
		fireEvent.mouseDown(screen.getByRole("tab", { name: "Security" }));
		expect(screen.getByText("MacBook Pro — Chrome")).toBeInTheDocument();
		expect(screen.queryByRole("button", { name: "Revoke MacBook Pro — Chrome" })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Revoke iPhone 15 — Safari" }));
		expect(screen.queryByText("iPhone 15 — Safari")).not.toBeInTheDocument();
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
		const email = screen.getByLabelText("Email");
		const password = screen.getByLabelText("Password");
		expect(email).toHaveAttribute("name", "username");
		expect(email).toHaveAttribute("autocomplete", "username");
		expect(email).toHaveAttribute("autocapitalize", "none");
		expect(email).toHaveAttribute("spellcheck", "false");
		expect(password).toHaveAttribute("name", "password");
		fireEvent.change(email, { target: { value: "visitor@example.com" } });
		fireEvent.change(password, { target: { value: "example" } });
		fireEvent.click(screen.getByRole("switch", { name: "Use verification code" }));
		const code = screen.getByLabelText("Verification code");
		expect(code).toHaveAttribute("name", "code");
		expect(code).toHaveAttribute("autocomplete", "one-time-code");
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(screen.getByRole("alert")).toHaveTextContent("123456");
		expect(code).toHaveAttribute("aria-invalid", "true");
		fireEvent.change(code, { target: { value: "123456" } });
		fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
		expect(screen.getByRole("status")).toHaveTextContent("No credentials were sent");
		expect(code).not.toHaveAttribute("aria-invalid");
	});
	it("renders document and not-found standalone templates with structured sections", () => {
		const { unmount } = render(<DocumentPageTemplate />);
		expect(screen.getByRole("heading", { name: "Terms of Service" })).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "1. Acceptance of Terms" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute("href", "/");
		unmount();

		render(<NotFoundTemplate />);
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Back to Homepage" })).toHaveAttribute("href", "/");
	});
});
