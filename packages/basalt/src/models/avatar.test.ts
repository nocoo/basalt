import { describe, expect, it } from "vitest";
import { avatarColorIndex, avatarInitials } from "./avatar";

describe("avatar identity", () => {
	it.each([
		["Alpine Churn — Zurich", "AC"],
		[" A ", "A"],
		["Basalt", "BA"],
		["Amber-Scoop", "AS"],
		["李 郑", "李郑"],
		["", "?"],
		["   ", "?"],
	])("uses two initials for %s", (name, expected) => expect(avatarInitials(name)).toBe(expected));
	it("uses stable bounded colors", () => {
		for (const name of ["a", "b", "李郑", "😀", "same", ""]) {
			expect(avatarColorIndex(name)).toBe(avatarColorIndex(name));
			expect(avatarColorIndex(name)).toBeGreaterThanOrEqual(0);
			expect(avatarColorIndex(name)).toBeLessThan(6);
		}
	});
});
