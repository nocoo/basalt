// Pure business logic for the Stats Overview page.
// No React dependency — fully testable with plain unit tests.

export type ChangeDirection = "positive" | "negative" | "neutral";

export function classifyChange(change: string): ChangeDirection {
	if (change.startsWith("+")) return "positive";
	if (change.startsWith("-")) return "negative";
	return "neutral";
}
