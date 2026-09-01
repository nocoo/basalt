import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmDialog, useConfirm } from "./confirm-dialog";

function ControlledExample({
	loading = false,
	onConfirm = () => {},
	onOpenChange,
	variant = "default" as const,
}: {
	loading?: boolean;
	onConfirm?: () => void | Promise<void>;
	onOpenChange?: (open: boolean) => void;
	variant?: "default" | "destructive";
}) {
	const [open, setOpen] = useState(true);
	return (
		<ConfirmDialog
			open={open}
			loading={loading}
			variant={variant}
			title={<span>Delete project?</span>}
			description={<strong>This cannot be undone.</strong>}
			confirmLabel={<em>Delete</em>}
			cancelLabel={<span>Keep</span>}
			onOpenChange={(next) => {
				setOpen(next);
				onOpenChange?.(next);
			}}
			onConfirm={onConfirm}
		/>
	);
}

function HookHarness({ apiRef }: { apiRef: { current: ReturnType<typeof useConfirm> | null } }) {
	const api = useConfirm();
	apiRef.current = api;
	return <ConfirmDialog {...api.dialogProps} />;
}

function requireConfirm(apiRef: { current: ReturnType<typeof useConfirm> | null }) {
	const confirm = apiRef.current?.confirm;
	if (!confirm) {
		throw new Error("missing useConfirm");
	}
	return confirm;
}

describe("ConfirmDialog", () => {
	it("renders an accessible alertdialog with ReactNode copy and default confirm styling", () => {
		render(<ControlledExample />);

		expect(screen.getByRole("alertdialog", { name: "Delete project?" })).toBeInTheDocument();
		expect(screen.getByText("This cannot be undone.").tagName).toBe("STRONG");
		expect(screen.getByRole("button", { name: "Keep" })).toBeEnabled();
		const confirm = screen.getByRole("button", { name: "Delete" });
		expect(confirm).toBeEnabled();
		expect(confirm.className).toContain("bg-basalt-primary");
	});

	it("uses the destructive confirm button variant", () => {
		render(<ControlledExample variant="destructive" />);
		expect(screen.getByRole("button", { name: "Delete" }).className).toContain(
			"bg-basalt-destructive",
		);
	});

	it("calls onConfirm once without closing, and cancel closes", () => {
		const onConfirm = vi.fn();
		const onOpenChange = vi.fn();
		render(<ControlledExample onConfirm={onConfirm} onOpenChange={onOpenChange} />);

		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();

		fireEvent.click(screen.getByRole("button", { name: "Keep" }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("shows a spinner, disables both actions, and ignores Escape while loading", () => {
		const onConfirm = vi.fn();
		const onOpenChange = vi.fn();
		render(<ControlledExample loading onConfirm={onConfirm} onOpenChange={onOpenChange} />);

		const confirm = screen.getByRole("button", { name: "Delete" });
		const cancel = screen.getByRole("button", { name: "Keep" });
		expect(confirm).toBeDisabled();
		expect(confirm).toHaveAttribute("aria-busy", "true");
		expect(cancel).toBeDisabled();
		fireEvent.click(confirm);
		fireEvent.click(cancel);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onConfirm).not.toHaveBeenCalled();
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});

	it("invokes an async onConfirm without awaiting or auto-closing", async () => {
		let finish!: () => void;
		const pending = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const onConfirm = vi.fn(() => pending);
		render(<ControlledExample onConfirm={onConfirm} />);

		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
		await act(async () => {
			finish();
			await pending;
		});
		expect(screen.getByRole("alertdialog")).toBeInTheDocument();
	});
});

describe("useConfirm", () => {
	it("settles true on confirm and false on cancel, each resolver only once", async () => {
		const apiRef: { current: ReturnType<typeof useConfirm> | null } = { current: null };
		render(<HookHarness apiRef={apiRef} />);

		let confirmed!: Promise<boolean>;
		const confirmedSeen: boolean[] = [];
		await act(async () => {
			confirmed = requireConfirm(apiRef)({
				title: "Archive?",
				description: "Keep history.",
			});
			void confirmed.then((value) => {
				confirmedSeen.push(value);
			});
		});
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		await expect(confirmed).resolves.toBe(true);
		expect(confirmedSeen).toEqual([true]);

		let cancelled!: Promise<boolean>;
		await act(async () => {
			cancelled = requireConfirm(apiRef)({
				title: "Archive?",
				description: "Keep history.",
			});
		});
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		await expect(cancelled).resolves.toBe(false);
	});

	it("settles the previous request false when a second confirm replaces it", async () => {
		const apiRef: { current: ReturnType<typeof useConfirm> | null } = { current: null };
		render(<HookHarness apiRef={apiRef} />);

		let first!: Promise<boolean>;
		let second!: Promise<boolean>;
		await act(async () => {
			first = requireConfirm(apiRef)({ title: "First", description: "One" });
		});
		await act(async () => {
			second = requireConfirm(apiRef)({ title: "Second", description: "Two" });
		});
		await expect(first).resolves.toBe(false);
		expect(screen.getByRole("alertdialog", { name: "Second" })).toBeInTheDocument();
		fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
		await expect(second).resolves.toBe(true);
	});

	it("settles a pending request false on unmount", async () => {
		const apiRef: { current: ReturnType<typeof useConfirm> | null } = { current: null };
		const { unmount } = render(<HookHarness apiRef={apiRef} />);
		let pending!: Promise<boolean>;
		await act(async () => {
			pending = requireConfirm(apiRef)({ title: "Leave?", description: "Unsaved." });
		});
		unmount();
		await expect(pending).resolves.toBe(false);
	});
});
