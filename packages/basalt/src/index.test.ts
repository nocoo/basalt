import { describe, expect, it } from "vitest";
import { Badge, Button, Meter, Toast, Toaster, toast } from "./index";

describe("root barrel", () => {
	it("exports stable controls including Toast", () => {
		expect(Button).toBeTruthy();
		expect(Badge).toBeTruthy();
		expect(Meter).toBeTruthy();
		expect(toast).toBeTypeOf("function");
		expect(Toast).toBe(Toaster);
	});
});
