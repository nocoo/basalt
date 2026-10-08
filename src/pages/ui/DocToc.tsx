import { LayerCard } from "@nocoo/basalt/components/layer-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSelectionIndicator } from "../../../packages/basalt/src/utils/selection-indicator";
import { scrollToDocSection, useDocTocActiveId } from "./useDocTocActiveId";

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

function measureMarker(item: HTMLElement, root: HTMLElement) {
	const box = item.getBoundingClientRect();
	return {
		left: 0,
		top: box.top - root.getBoundingClientRect().top,
		width: box.width,
		height: box.height,
	};
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
				"basalt-choice rounded-basalt-sm block w-full truncate py-basalt-space-xs text-left text-basalt-base leading-basalt-body no-underline transition-colors basalt-motion duration-basalt-normal",
				nested ? "pl-basalt-layout" : "pl-basalt-space-lg",
				active ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
			)}
			onClick={(event) => {
				event.preventDefault();
				onSelect(heading.id);
				scrollToDocSection(heading.id);
			}}
		>
			{heading.text}
		</a>
	);
}

export function DocToc({
	headings,
	compact = false,
}: {
	headings: DocHeading[];
	compact?: boolean;
}) {
	const groups = useMemo(() => groupHeadings(headings), [headings]);
	const ids = useMemo(() => headings.map((heading) => heading.id), [headings]);
	const { activeId, selectSection } = useDocTocActiveId(ids);
	const {
		ref: listRef,
		state: marker,
		motionClassName,
	} = useSelectionIndicator({
		itemSelector: '[data-toc-id][aria-current="true"]',
		mapGeometry: measureMarker,
	});

	return (
		<LayerCard>
			<LayerCard.Body>
				<nav aria-label="On this page" className="text-basalt-base">
					<div
						className={
							compact ? "flex flex-wrap items-center gap-basalt-space-lg" : "block xl:hidden"
						}
					>
						<span
							className={
								compact
									? "shrink-0 text-muted-foreground"
									: "mb-basalt-field-gap block text-muted-foreground"
							}
						>
							On this page
						</span>
						<Select
							value={activeId}
							onValueChange={(id) => {
								selectSection(id);
								scrollToDocSection(id);
							}}
						>
							<SelectTrigger
								aria-label="Jump to section"
								className={compact ? "min-w-0 max-w-full flex-1 sm:flex-none sm:w-80" : "w-full"}
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{headings.map((heading) => (
									<SelectItem key={heading.id} value={heading.id}>
										{heading.text}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className={compact ? "hidden" : "hidden xl:block"}>
						<p className="mb-basalt-space-lg text-basalt-sm font-semibold tracking-wide text-muted-foreground uppercase">
							On this page
						</p>
						<ul
							ref={listRef}
							className="relative flex flex-col gap-basalt-space-lg border-l-2 border-border"
						>
							<li
								aria-hidden="true"
								className={cn(
									"absolute top-0 left-[-0.125rem] w-0.5 rounded-basalt-full bg-primary",
									motionClassName,
								)}
								style={{
									height: marker.visible ? marker.height : 0,
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
									<li key={group.h2.id} className="flex flex-col gap-basalt-space-lg">
										<TocLink
											heading={group.h2}
											active={activeId === group.h2.id}
											onSelect={selectSection}
										/>
										<ul className="flex flex-col gap-basalt-space-lg">
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
			</LayerCard.Body>
		</LayerCard>
	);
}
