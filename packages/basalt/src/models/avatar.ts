export function avatarInitials(name: string): string {
	const words = name
		.trim()
		.split(/[\s—–-]+/u)
		.filter(Boolean);
	const letters =
		words.length > 1
			? [Array.from(words[0])[0], Array.from(words[1])[0]]
			: Array.from(words[0] ?? "").slice(0, 2);
	return Array.from(letters.join("").toLocaleUpperCase("en-US")).slice(0, 2).join("") || "?";
}

export function avatarColorIndex(key: string): number {
	let hash = 2166136261;
	for (const char of key) hash = Math.imul(hash ^ (char.codePointAt(0) ?? 0), 16777619);
	return (hash >>> 0) % 6;
}
