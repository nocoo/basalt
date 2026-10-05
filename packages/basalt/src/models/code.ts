const TOKEN =
	/(\/\/[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`[^`]*`)|\b(import|from|export|default|async|await|function|return|const|let|var|type|interface|as|if|else|throw|new|typeof|null|true|false|undefined)\b|(\b\d+\b)|(<\/?[A-Za-z][\w.-]*)/g;

type CodeToken = { text: string; className?: string };

export function codeLines(code: string, highlighted: boolean): CodeToken[][] {
	const tokens: CodeToken[] = [];
	let offset = 0;
	if (highlighted) {
		for (const match of code.matchAll(TOKEN)) {
			const index = match.index;
			if (index > offset) tokens.push({ text: code.slice(offset, index) });
			tokens.push({
				text: match[0],
				className: match[1]
					? "text-basalt-muted-foreground"
					: match[2]
						? "text-basalt-chart-5"
						: match[4]
							? "text-basalt-chart-4"
							: "text-basalt-primary",
			});
			offset = index + match[0].length;
		}
	}
	if (offset < code.length) tokens.push({ text: code.slice(offset) });
	const lines: CodeToken[][] = [[]];
	for (const token of tokens) {
		for (const [index, text] of token.text.split(/\r\n|\r|\n/).entries()) {
			if (index > 0) lines.push([]);
			if (text) lines[lines.length - 1].push({ text, className: token.className });
		}
	}
	return lines;
}
