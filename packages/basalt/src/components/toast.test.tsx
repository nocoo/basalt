import { render } from "@testing-library/react";
import { Check, CircleAlert, Info, TriangleAlert } from "lucide-react";
import { isValidElement, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Toast, Toaster, toast } from "./toast";

vi.mock("sonner", async (importOriginal) => {
	const actual = await importOriginal<typeof import("sonner")>();
	const success = vi.fn();
	const error = vi.fn();
	const warning = vi.fn();
	const info = vi.fn();
	const dismiss = vi.fn();
	const fn = Object.assign(vi.fn(), { success, error, warning, info, dismiss });
	const Sonner = vi.fn(() => null);
	return { ...actual, toast: fn, Toaster: Sonner };
});

async function mockedSonner() {
	const { toast: sonnerToast } = await import("sonner");
	return {
		base: vi.mocked(sonnerToast),
		success: vi.mocked(sonnerToast.success),
		error: vi.mocked(sonnerToast.error),
		warning: vi.mocked(sonnerToast.warning),
		info: vi.mocked(sonnerToast.info),
		dismiss: vi.mocked(sonnerToast.dismiss),
	};
}

async function mockedSonnerToaster() {
	return vi.mocked(await import("sonner")).Toaster;
}

function payloadOf(spy: { mock: { calls: unknown[][] } }) {
	return spy.mock.calls[0]?.[1] as Record<string, unknown>;
}

function expectIconType(icon: unknown, type: unknown) {
	expect(isValidElement(icon) && (icon as ReactElement).type === type).toBe(true);
}

describe("toast", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("exports a callable toast function", () => {
		expect(typeof toast).toBe("function");
		expect(toast.success).toBeTypeOf("function");
		expect(toast.error).toBeTypeOf("function");
		expect(toast.warning).toBeTypeOf("function");
		expect(toast.info).toBeTypeOf("function");
		expect(toast.dismiss).toBeTypeOf("function");
	});

	it("exposes Toast and Toaster", () => {
		expect(Toast).toBe(Toaster);
		render(<Toaster />);
	});

	it("passes close, icon, and variant into sonner", async () => {
		const { toast: sonnerToast } = await import("sonner");
		toast.success("Deployed", { close: false, icon: false, description: "Shipped." });
		expect(sonnerToast.success).toHaveBeenCalledWith(
			"Deployed",
			expect.objectContaining({
				closeButton: false,
				icon: false,
				description: "Shipped.",
			}),
		);
	});

	it("calls the base sonner toast from the default callable", async () => {
		const sonner = await mockedSonner();
		toast("Saved");
		expect(sonner.base).toHaveBeenCalledTimes(1);
		expect(sonner.base).toHaveBeenCalledWith(
			"Saved",
			expect.objectContaining({
				closeButton: true,
				className: expect.stringContaining("bg-basalt-popover"),
			}),
		);
		expect(payloadOf(sonner.base).icon).toBeUndefined();
		expect(sonner.success).not.toHaveBeenCalled();
		expect(sonner.error).not.toHaveBeenCalled();
		expect(sonner.warning).not.toHaveBeenCalled();
		expect(sonner.info).not.toHaveBeenCalled();
	});

	it("dispatches success to sonner.success with the default success icon", async () => {
		const sonner = await mockedSonner();
		toast.success("Ready");
		expect(sonner.success).toHaveBeenCalledTimes(1);
		expect(sonner.success).toHaveBeenCalledWith(
			"Ready",
			expect.objectContaining({
				closeButton: true,
				className: expect.stringContaining("bg-basalt-heatmap-green-1"),
			}),
		);
		expectIconType(payloadOf(sonner.success).icon, Check);
		expect(sonner.base).not.toHaveBeenCalled();
		expect(sonner.error).not.toHaveBeenCalled();
	});

	it("dispatches error to sonner.error with the default error icon", async () => {
		const sonner = await mockedSonner();
		toast.error("Failed");
		expect(sonner.error).toHaveBeenCalledTimes(1);
		expect(sonner.error).toHaveBeenCalledWith(
			"Failed",
			expect.objectContaining({
				closeButton: true,
				className: expect.stringContaining("bg-basalt-danger-tint"),
			}),
		);
		expectIconType(payloadOf(sonner.error).icon, CircleAlert);
		expect(sonner.base).not.toHaveBeenCalled();
		expect(sonner.success).not.toHaveBeenCalled();
	});

	it("dispatches warning to sonner.warning with the default warning icon", async () => {
		const sonner = await mockedSonner();
		toast.warning("Careful");
		expect(sonner.warning).toHaveBeenCalledTimes(1);
		expect(sonner.warning).toHaveBeenCalledWith(
			"Careful",
			expect.objectContaining({
				closeButton: true,
				className: expect.stringContaining("bg-basalt-warning-tint"),
			}),
		);
		expectIconType(payloadOf(sonner.warning).icon, TriangleAlert);
		expect(sonner.base).not.toHaveBeenCalled();
		expect(sonner.info).not.toHaveBeenCalled();
	});

	it("dispatches info to sonner.info with the default info icon", async () => {
		const sonner = await mockedSonner();
		toast.info("Note");
		expect(sonner.info).toHaveBeenCalledTimes(1);
		expect(sonner.info).toHaveBeenCalledWith(
			"Note",
			expect.objectContaining({
				closeButton: true,
				className: expect.stringContaining("bg-basalt-info-tint"),
			}),
		);
		expectIconType(payloadOf(sonner.info).icon, Info);
		expect(sonner.base).not.toHaveBeenCalled();
		expect(sonner.warning).not.toHaveBeenCalled();
	});

	it("defaults closeButton to true and honors explicit false", async () => {
		const sonner = await mockedSonner();
		toast("Open");
		expect(payloadOf(sonner.base).closeButton).toBe(true);
		sonner.base.mockClear();
		toast("Shut", { close: false });
		expect(sonner.base).toHaveBeenCalledWith(
			"Shut",
			expect.objectContaining({ closeButton: false }),
		);
		expect(sonner.success).not.toHaveBeenCalled();
	});

	it("keeps custom icons and suppresses icons when false", async () => {
		const sonner = await mockedSonner();
		const custom = <span data-icon="custom" />;
		toast.info("Custom", { icon: custom });
		expect(sonner.info).toHaveBeenCalledWith("Custom", expect.objectContaining({ icon: custom }));
		expect(payloadOf(sonner.info).icon).toBe(custom);
		sonner.info.mockClear();
		toast.error("Quiet", { icon: false });
		expect(sonner.error).toHaveBeenCalledWith("Quiet", expect.objectContaining({ icon: false }));
	});

	it("forwards description, action, duration, and id", async () => {
		const sonner = await mockedSonner();
		const action = { label: "Undo", onClick: vi.fn() };
		toast.warning("Kept", {
			description: "Details",
			action,
			duration: 4000,
			id: "toast-kept",
		});
		expect(sonner.warning).toHaveBeenCalledTimes(1);
		expect(sonner.warning).toHaveBeenCalledWith(
			"Kept",
			expect.objectContaining({
				description: "Details",
				action,
				duration: 4000,
				id: "toast-kept",
				closeButton: true,
			}),
		);
		expect(sonner.error).not.toHaveBeenCalled();
	});

	it("forwards dismiss to sonner.dismiss", async () => {
		const sonner = await mockedSonner();
		toast.dismiss();
		expect(sonner.dismiss).toHaveBeenCalledTimes(1);
		expect(sonner.dismiss).toHaveBeenCalledWith();
		sonner.dismiss.mockClear();
		toast.dismiss("toast-kept");
		expect(sonner.dismiss).toHaveBeenCalledWith("toast-kept");
	});

	it("defaults Toaster closeButton to true and forwards explicit props", async () => {
		const SonnerToaster = await mockedSonnerToaster();
		render(<Toaster />);
		expect(SonnerToaster).toHaveBeenCalledWith(
			expect.objectContaining({ closeButton: true }),
			undefined,
		);
		SonnerToaster.mockClear();
		render(<Toaster closeButton={false} position="top-center" />);
		expect(SonnerToaster).toHaveBeenCalledWith(
			expect.objectContaining({
				closeButton: false,
				position: "top-center",
			}),
			undefined,
		);
	});
});
