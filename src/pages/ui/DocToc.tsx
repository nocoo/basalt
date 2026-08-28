import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useDocTocActiveId } from "./useDocTocActiveId";

export interface DocHeading {
	id: string;
	text: string;
	depth: 2 | 3;
}

interface HeadingGroup {
	h2: DocHeading;
	h3s: DocHeading[];
}

function groupHeadings(headings: DocHeading[]): HeadingGroup[] {
	const groups: HeadingGroup[] = [];
	for (const heading of headings) {
		if (heading.depth === 2) {
			groups.push({ h2: heading, h3s: [] });
		} else if (heading.depth === 3 && groups.length > 0) {
			groups[groups.length - 1].h3s.push(heading);
		}
	}
	return groups;
}

function TocLink({
	heading,
	active,
	nested,
	onSelect,
}: {
	heading: DocHeading;
	active: boolean;
	nested?: boolean;
	onSelect: (id: string) => void;
}) {
	return (
		<a
			href={`#${heading.id}`}
			aria-current={active ? "true" : undefined}
			data-toc-id={heading.id}
			className={cn(
				"block w-full truncate py-0.5 text-left text-sm leading-5 no-underline transition-colors duration-200",
				nested ? "pl-7" : "pl-4",
				active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
			)}
			onClick={(event) => {
				event.preventDefault();
				onSelect(heading.id);
				document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
			}}
		>
			{heading.text}
		</a>
	);
}

export function DocToc({ headings }: { headings: DocHeading[] }) {
	const groups = useMemo(() => groupHeadings(headings), [headings]);
	const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
	const { activeId, selectSection } = useDocTocActiveId(ids);
	const listRef = useRef<HTMLUListElement>(null);
	const [marker, setMarker] = useState({ top: 0, height: 0 });

	useLayoutEffect(() => {
		const list = listRef.current;
		const active = list?.querySelector(`[data-toc-id="${activeId}"]`);
		if (!list || !(active instanceof HTMLElement) || !activeId) {
			return;
		}
		const listBox = list.getBoundingClientRect();
		const itemBox = active.getBoundingClientRect();
		setMarker({
			top: itemBox.top - listBox.top,
			height: itemBox.height,
		});
	}, [activeId]);

	return (
		<nav aria-label="On this page" className="text-sm">
			<label className="block xl:hidden">
				<span className="mb-1 block text-muted-foreground">On this page</span>
				<select
					className="w-full rounded-md border border-border bg-secondary px-2 py-1 text-foreground"
					aria-label="Jump to section"
					value={activeId}
					onChange={(event) => {
						const id = event.target.value;
						selectSection(id);
						document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
				<p className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					On this page
				</p>
				<ul ref={listRef} className="relative flex flex-col gap-2 border-l-2 border-border">
					<span
						aria-hidden="true"
						className="absolute top-0 left-[-2px] w-0.5 rounded-full bg-primary transition-[transform,height] duration-200 ease-out"
						style={{
							height: marker.height || 20,
							transform: `translateY(${marker.top}px)`,
						}}
					/>
					{groups.map((group) => {
						if (group.h3s.length === 0) {
							return (
								<li key={group.h2.id}>
									<TocLink
										heading={group.h2}
										active={activeId === group.h2.id}
										onSelect={selectSection}
									/>
								</li>
							);
						}
						return (
							<li key={group.h2.id} className="flex flex-col gap-2">
								<TocLink
									heading={group.h2}
									active={activeId === group.h2.id}
									onSelect={selectSection}
								/>
								<ul className="flex flex-col gap-2">
									{group.h3s.map((h3) => (
										<li key={h3.id}>
											<TocLink
												heading={h3}
												active={activeId === h3.id}
												nested
												onSelect={selectSection}
											/>
										</li>
									))}
								</ul>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}
