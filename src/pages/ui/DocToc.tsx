export interface DocHeading {
	id: string;
	text: string;
	depth: 2 | 3;
}

export function DocToc({ headings }: { headings: DocHeading[] }) {
	return (
		<nav aria-label="On this page" className="text-sm space-y-3 xl:sticky xl:top-4">
			<label className="block xl:hidden">
				<span className="mb-1 block text-muted-foreground">On this page</span>
				<select
					className="w-full rounded-widget border border-border bg-secondary px-2 py-1 text-foreground"
					aria-label="Jump to section"
					onChange={(event) => {
						window.location.hash = event.target.value;
					}}
				>
					{headings.map((heading) => (
						<option key={heading.id} value={heading.id}>
							{heading.text}
						</option>
					))}
				</select>
			</label>
			<div className="hidden xl:block">
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
			</div>
		</nav>
	);
}
