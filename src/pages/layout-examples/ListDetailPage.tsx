import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { ResponsiveMasterDetail } from "@nocoo/basalt/components/responsive-master-detail";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { useState } from "react";

const notes = Array.from({ length: 40 }, (_, index) => ({
	id: String(index + 1),
	title: `Field note ${index + 1}`,
}));

export default function ListDetailPage() {
	const [selected, setSelected] = useState<string | null>(null);
	return (
		<AppShell layout="responsive">
			<AppSkipLink>Skip to content</AppSkipLink>
			<AppMain>
				<AppHeader
					density="compact"
					title="Field notebook"
					actions={
						<LinkButton href="/layout" variant="ghost">
							Layouts
						</LinkButton>
					}
				/>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col md:px-3 md:pb-3">
					<ContentIsland mobileSurface="edge-to-edge" className="md:overflow-hidden">
						<ResponsiveMasterDetail
							label="Field notebook"
							className="md:h-full"
							detailOpen={selected !== null}
							onDetailOpenChange={(open) => {
								if (!open) setSelected(null);
							}}
							selectedId={selected}
							listLabel="Notes"
							detailLabel="Selected note"
							backLabel="Back to notes"
							list={
								<div className="space-y-1 p-3">
									{notes.map((note) => (
										<Button
											key={note.id}
											variant={selected === note.id ? "secondary" : "ghost"}
											className="min-h-11 w-full justify-start"
											aria-pressed={selected === note.id}
											onClick={() => setSelected(note.id)}
										>
											{note.title}
										</Button>
									))}
								</div>
							}
						>
							<article className="space-y-5 p-4">
								<h2 className="font-basalt-display text-2xl">Field note {selected}</h2>
								{Array.from({ length: 18 }, (_, index) => (
									<p key={`paragraph-${index}`} className="max-w-prose text-base leading-relaxed">
										Observation {index + 1}: The list and the selected detail share a bounded
										workspace on a wide screen. On a narrow screen only one region is visible. The
										document scrolls naturally, and returning to the list restores focus to the
										selected item.
									</p>
								))}
								<p data-detail-end>End of this note.</p>
							</article>
						</ResponsiveMasterDetail>
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
