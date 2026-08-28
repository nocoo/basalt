export interface DocHeading {
	id: string;
	text: string;
	depth: 2 | 3;
}

export function DocToc({ headings }: { headings: DocHeading[] }) {
	return (
		<nav aria-label="On this page" className="hidden xl:block sticky top-4 text-sm">
			<p className="mb-2 text-muted-foreground">On this page</p>
			<ul className="space-y-1">
				{headings.map((heading) => (
					<li key={heading.id} className={heading.depth === 3 ? "pl-3" : undefined}>
						<a
							className="text-foreground hover:underline underline-offset-4"
							href={`#${heading.id}`}
						>
							{heading.text}
						</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
