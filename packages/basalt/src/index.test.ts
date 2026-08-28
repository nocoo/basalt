import { describe, expect, it } from "vitest";
import * as pkg from "./index";

describe("@nocoo/basalt", () => {
	it("loads the root barrel", () => {
		expect(Object.keys(pkg)).toEqual(
			expect.arrayContaining(["Button", "Label", "Separator", "ThemeProvider", "LinkProvider"]),
		);
	});
});
