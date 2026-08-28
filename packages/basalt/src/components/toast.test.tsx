import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast, Toaster, toast } from "./toast";

describe("toast", () => {
	it("exports a callable toast function", () => {
		expect(typeof toast).toBe("function");
	});

	it("exposes Toast and Toaster", () => {
		expect(Toast).toBe(Toaster);
		render(<Toaster />);
	});
});
