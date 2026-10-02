import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { ArrowLeft, MoreHorizontal, Type } from "lucide-react";
import { useState } from "react";

export default function ReaderPage() {
	const [large, setLarge] = useState(false);
	const [saved, setSaved] = useState(false);
	return (
		<AppShell layout="responsive">
			<AppSkipLink>Skip to content</AppSkipLink>
			<AppMain>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col md:px-3 md:py-3">
					<ContentIsland mobileSurface="edge-to-edge">
						<AppHeader
							sticky
							density="compact"
							title="A slower way to see"
							leading={
								<LinkButton href="/layout" size="icon" variant="ghost" aria-label="Back to layouts">
									<ArrowLeft />
								</LinkButton>
							}
							actions={
								<>
									<Popover>
										<PopoverTrigger asChild>
											<Button size="icon" variant="ghost" aria-label="Reading preferences">
												<Type />
											</Button>
										</PopoverTrigger>
										<PopoverContent aria-label="Reading preferences">
											<Button
												className="min-h-11"
												variant="outline"
												aria-pressed={large}
												onClick={() => setLarge(!large)}
											>
												Larger text
											</Button>
										</PopoverContent>
									</Popover>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button size="icon" variant="ghost" aria-label="Reading actions">
												<MoreHorizontal />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent>
											<DropdownMenuItem className="min-h-11" onSelect={() => setSaved(!saved)}>
												{saved ? "Remove bookmark" : "Bookmark"}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</>
							}
						/>
						<article
							aria-label="A slower way to see"
							className={`mx-auto max-w-prose space-y-6 px-4 py-4 leading-relaxed md:px-6 ${large ? "text-xl" : "text-base"}`}
						>
							<div className="hidden md:block">
								<PageHeader
									title="A slower way to see"
									description="Field journal / 8 minute read"
								/>
							</div>
							<p className="text-sm text-basalt-muted-foreground">FIELD JOURNAL / 08 MIN</p>
							<p className="font-basalt-display text-2xl leading-snug">
								When the frame gets out of the way, the ordinary becomes worth noticing.
							</p>
							<p role="status" className="text-sm text-basalt-muted-foreground">
								{saved
									? "Bookmarked locally"
									: "Local demonstration; no account or network writes."}
							</p>
							{Array.from({ length: 12 }, (_, index) => (
								<section key={`note-${index}`} className="space-y-3">
									<h2 className="font-basalt-display text-xl">
										{index + 1}.{" "}
										{
											["Start at the water", "Leave room for a pause", "Notice the small changes"][
												index % 3
											]
										}
									</h2>
									<p>
										The path follows the bank before it enters the trees. In the morning, small
										details arrive before the larger view: a footprint in damp soil, light caught on
										a leaf, a sound that disappears when we stop to listen. There is no need to
										finish the walk quickly.
									</p>
									<p>
										Reading can work the same way. A line leads to another line without a second
										pane asking for attention. The page moves with the document; controls stay close
										enough to reach, and the words keep their place when a menu opens and closes.
									</p>
								</section>
							))}
							<p data-reader-end className="border-t border-basalt-border pt-4">
								End of the field journal.
							</p>
							<LinkButton href="/examples/list-detail" variant="outline" className="min-h-11">
								Explore list and detail
							</LinkButton>
						</article>
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
