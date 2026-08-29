import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Toast, Toaster, toast } from "./toast";

vi.mock("sonner", async (importOriginal) => {
	const actual = await importOriginal<typeof import("sonner")>();
	const success = vi.fn();
	const error = vi.fn();
	const warning = vi.fn();
	const info = vi.fn();
	const dismiss = vi.fn();
	const fn = Object.assign(vi.fn(), { success, error, warning, info, dismiss });
	return { ...actual, toast: fn };
});

describe("toast", () => {
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
});
