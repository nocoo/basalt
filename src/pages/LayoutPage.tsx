import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Grid } from "@nocoo/basalt/components/grid";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { ShowcasePage } from "@/components/ShowcasePage";
import { SurfaceDisciplineInspector } from "@/components/showcase/SurfaceDisciplineInspector";
import { cn } from "@/lib/utils";

function Tile({ label, className = "" }: { label: string; className?: string }) {
	return (
		<LayerCard
			className={cn(
				"flex min-h-[5rem] items-center justify-center font-basalt-mono text-basalt-sm text-basalt-muted-foreground",
				className,
			)}
		>
			{label}
		</LayerCard>
	);
}

export default function LayoutPage() {
	return (
		<ShowcasePage
			title="Nested surfaces"
			description="The island is L1. LayerCard is L2. Well raises to L3. Grid and flex only place those cards — they do not paint."
		>
			<SectionRule title="Full-page layout examples" aria-label="Full-page layout examples">
				<LayerCard className="flex flex-wrap items-center gap-basalt-layout">
					<LinkButton href="/examples/reader" variant="outline">
						Immersive reader
					</LinkButton>
					<LinkButton href="/examples/list-detail" variant="outline">
						Mobile list / desktop panes
					</LinkButton>
					<LinkButton href="/examples/workspace" variant="outline">
						Workspace and form
					</LinkButton>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="The stack"
				hint="ContentIsland already painted this page L1. Add LayerCard. Do not wrap the island again."
			>
				<LayerCard padding="none">
					<LayerCard.Header>L2 · LayerCard</LayerCard.Header>
					<LayerCard.Well className="space-y-basalt-layout">
						<p className="text-basalt-base text-basalt-foreground">L3 · LayerCard.Well</p>
						<LayerCard>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								L3+ nested LayerCard — transparent, no ring
							</p>
						</LayerCard>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Surface & signal discipline">
				<SurfaceDisciplineInspector />
			</SectionRule>

			<SectionRule title="Body vs Well">
				<div className="grid grid-cols-1 gap-basalt-layout @[38rem]/island:grid-cols-2">
					<LayerCard padding="none">
						<LayerCard.Header>Body stays on L2</LayerCard.Header>
						<LayerCard.Body>
							<p className="mb-basalt-card-sm text-basalt-sm text-basalt-muted-foreground">
								Copy and DescriptionList sit on the card. They do not raise.
							</p>
							<DescriptionList columns={1}>
								<DescriptionList.Item term="Status">Active</DescriptionList.Item>
								<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
							</DescriptionList>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>Well raises to L3</LayerCard.Header>
						<LayerCard.Well>
							<p className="mb-basalt-card-sm text-basalt-sm text-basalt-muted-foreground">
								Lists and inner groups sit on a brighter well.
							</p>
							<DescriptionList columns={1}>
								<DescriptionList.Item term="Status">Active</DescriptionList.Item>
								<DescriptionList.Item term="Plan">Enterprise</DescriptionList.Item>
							</DescriptionList>
						</LayerCard.Well>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule
				title="Controls inherit fill"
				hint="Input and outline buttons use the current surface fill. Do not override with bg-card."
			>
				<LayerCard padding="none">
					<LayerCard.Header>On L2</LayerCard.Header>
					<LayerCard.Body className="flex flex-wrap items-center gap-basalt-layout">
						<Input className="max-w-56" placeholder="On L2" />
						<Button variant="outline">Cancel</Button>
					</LayerCard.Body>
					<LayerCard.Well className="flex flex-wrap items-center gap-basalt-layout">
						<Input className="max-w-56" placeholder="In a Well" />
						<Button variant="outline">Cancel</Button>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Rules">
				<LayerCard>
					<DescriptionList>
						<DescriptionList.Item term="Root">
							ContentIsland, Dialog, Sheet, and AlertDialog own data-basalt-surface-root. Pages do
							not.
						</DescriptionList.Item>
						<DescriptionList.Item term="Cards">
							Use LayerCard. Do not hand-write bg-card or bg-muted wells.
						</DescriptionList.Item>
						<DescriptionList.Item term="Raise">
							LayerCard.Well or a nested LayerCard raises to L3. Body does not.
						</DescriptionList.Item>
						<DescriptionList.Item term="Controls">
							Leave bg-basalt-control. Fill follows the current surface.
						</DescriptionList.Item>
						<DescriptionList.Item term="Overlays">
							Popover, Tooltip, and Dropdown stay popover. They do not open the stack.
						</DescriptionList.Item>
					</DescriptionList>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Equal Columns">
				<div className="space-y-basalt-layout">
					<Grid columns={2} className="gap-basalt-layout">
						<Tile label="1/2" />
						<Tile label="1/2" />
					</Grid>
					<Grid columns={3} className="gap-basalt-layout">
						<Tile label="1/3" />
						<Tile label="1/3" />
						<Tile label="1/3" />
					</Grid>
					<Grid columns={4} className="gap-basalt-layout">
						<Tile label="1/4" />
						<Tile label="1/4" />
						<Tile label="1/4" />
						<Tile label="1/4" />
					</Grid>
				</div>
			</SectionRule>

			<SectionRule title="Asymmetric Columns">
				<div className="space-y-basalt-layout">
					<div className="grid grid-cols-3 gap-basalt-layout">
						<Tile label="1/3" />
						<Tile label="2/3" className="col-span-2" />
					</div>
					<div className="grid grid-cols-4 gap-basalt-layout">
						<Tile label="1/4" />
						<Tile label="3/4" className="col-span-3" />
					</div>
					<div className="grid grid-cols-12 gap-basalt-layout">
						<Tile label="5 cols" className="col-span-5" />
						<Tile label="7 cols" className="col-span-7" />
					</div>
				</div>
			</SectionRule>

			<SectionRule
				title="Responsive Breakpoints"
				hint="Resize the browser to see these reflow. Mobile: 1 col → md: 2 cols → lg: 4 cols."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[36rem]/island:grid-cols-2 @[56rem]/island:grid-cols-4">
					<Tile label="A" />
					<Tile label="B" />
					<Tile label="C" />
					<Tile label="D" />
				</div>
			</SectionRule>

			<SectionRule title="Spanning Rows & Columns">
				<div className="grid grid-cols-3 grid-rows-2 gap-basalt-layout">
					<Tile label="span 2 rows" className="row-span-2 min-h-[10rem]" />
					<Tile label="1x1" />
					<Tile label="1x1" />
					<Tile label="span 2 cols" className="col-span-2" />
				</div>
			</SectionRule>

			<SectionRule title="Dashboard Composition">
				<div className="space-y-basalt-layout">
					<div className="grid grid-cols-1 gap-basalt-layout @[36rem]/island:grid-cols-2 @[56rem]/island:grid-cols-4">
						<LayerCard className="@[56rem]/island:col-span-2 min-h-[7.5rem]">
							<p className="text-basalt-sm font-medium text-basalt-foreground mb-basalt-space-sm">
								Wide card
							</p>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Spans 2 columns on large screens. Ideal for charts or summaries.
							</p>
						</LayerCard>
						<LayerCard className="min-h-[7.5rem]">
							<p className="text-basalt-sm font-medium text-basalt-foreground mb-basalt-space-sm">
								Metric
							</p>
							<p className="text-basalt-3xl font-semibold text-basalt-foreground">1,284</p>
						</LayerCard>
						<LayerCard className="min-h-[7.5rem]">
							<p className="text-basalt-sm font-medium text-basalt-foreground mb-basalt-space-sm">
								Metric
							</p>
							<p className="text-basalt-3xl font-semibold text-basalt-foreground">$42.5k</p>
						</LayerCard>
					</div>
					<div className="grid grid-cols-1 gap-basalt-layout @[44rem]/island:grid-cols-3">
						<LayerCard padding="none" className="@[44rem]/island:col-span-2">
							<LayerCard.Header>Main content area</LayerCard.Header>
							<LayerCard.Well className="min-h-[10rem]">
								<p className="text-basalt-sm text-basalt-muted-foreground">
									2/3 width. Perfect for primary charts, tables, or data views.
								</p>
							</LayerCard.Well>
						</LayerCard>
						<LayerCard padding="none" className="min-h-[12.5rem]">
							<LayerCard.Header>Sidebar</LayerCard.Header>
							<LayerCard.Body className="flex-1">
								<p className="text-basalt-sm text-basalt-muted-foreground">
									1/3 width. Use for filters, recent activity, or secondary info.
								</p>
							</LayerCard.Body>
						</LayerCard>
					</div>
				</div>
			</SectionRule>

			<SectionRule title="Flexbox Patterns">
				<LayerCard>
					<div className="space-y-basalt-layout">
						<div>
							<p className="text-basalt-sm text-basalt-muted-foreground mb-basalt-card-sm font-basalt-mono">
								justify-center
							</p>
							<div className="flex justify-center gap-basalt-layout">
								<Tile label="A" className="w-20 min-h-0" />
								<Tile label="B" className="w-20 min-h-0" />
								<Tile label="C" className="w-20 min-h-0" />
							</div>
						</div>
						<div>
							<p className="text-basalt-sm text-basalt-muted-foreground mb-basalt-card-sm font-basalt-mono">
								justify-between
							</p>
							<div className="flex justify-between gap-basalt-layout">
								<Tile label="Left" className="w-24 min-h-0" />
								<Tile label="Right" className="w-24 min-h-0" />
							</div>
						</div>
						<div>
							<p className="text-basalt-sm text-basalt-muted-foreground mb-basalt-card-sm font-basalt-mono">
								flex-wrap
							</p>
							<div className="flex flex-wrap gap-basalt-layout">
								{Array.from({ length: 8 }, (_, i) => (
									<Tile key={i} label={`${i + 1}`} className="w-20 min-h-0" />
								))}
							</div>
						</div>
						<div>
							<p className="text-basalt-sm text-basalt-muted-foreground mb-basalt-card-sm font-basalt-mono">
								flex-col gap-basalt-layout
							</p>
							<div className="flex max-w-xs flex-col gap-basalt-layout">
								<Tile label="Top" className="min-h-0" />
								<Tile label="Middle" className="min-h-0" />
								<Tile label="Bottom" className="min-h-0" />
							</div>
						</div>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Auto-Fit Grid"
				hint="Cards fill available space with a minimum width of 200px. No breakpoint classes needed."
			>
				<div
					className="grid gap-basalt-layout"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
				>
					{Array.from({ length: 6 }, (_, i) => (
						<LayerCard key={i} className="min-h-[6.25rem]">
							<p className="text-basalt-sm font-medium text-basalt-foreground mb-basalt-space-sm">
								Card {i + 1}
							</p>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Auto-sized content block that adapts to container width.
							</p>
						</LayerCard>
					))}
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
