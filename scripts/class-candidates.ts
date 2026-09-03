export function classCandidates(source: string): string[] {
	const tokens: string[] = [];
	for (const match of source.matchAll(/["'`]([^"'`]*)["'`]/g)) {
		for (const token of match[1].split(/\s+/)) {
			if (token && !token.includes("${") && token.length < 200) {
				tokens.push(token);
			}
		}
	}
	return tokens;
}
