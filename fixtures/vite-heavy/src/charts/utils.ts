export function cn(...values: unknown[]): string {
	return values.filter((value) => typeof value === "string" && value.length > 0).join(" ");
}
