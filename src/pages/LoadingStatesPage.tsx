import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { LoadingScreen } from "@nocoo/basalt/components/loading-screen";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { StatCard, StatGrid } from "@nocoo/basalt/components/stat-card";
import { BasaltMark } from "@/components/BasaltMark";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useLoadingShowcaseViewModel } from "@/viewmodels/useLoadingShowcaseViewModel";

const METRICS = [
	{ label: "Requests", value: "148,290", width: 70 },
	{ label: "Projects", value: "24", width: 48 },
	{ label: "Success rate", value: "99.98%", width: 62 },
	{ label: "Latency", value: "42 ms", width: 55 },
] as const;

const WORKSPACES = [
	{ name: "Atlas Health", status: "Active", requests: "42,810" },
	{ name: "Northstar Clinic", status: "Active", requests: "28,604" },
	{ name: "Meridian Care", status: "Review", requests: "16,209" },
] as const;

const TABLE_ROWS = [
	{ name: "Atlas Health", region: "US East", status: "Healthy" },
	{ name: "Northstar Clinic", region: "EU West", status: "Healthy" },
	{ name: "Meridian Care", region: "APAC", status: "Review" },
];

function BoneAvatar() {
	return <Skeleton variant="circle" width={36} height={36} className="shrink-0" />;
}

export default function LoadingStatesPage() {
	const { busy, toggleBusy } = useLoadingShowcaseViewModel();

	return (
		<ShowcasePage
			title="Loading"
			description="Skeleton bones, spinners and busy controls. Replay to see the same layout before and after data arrives."
			actions={
				<Button variant="outline" onClick={toggleBusy}>
					{busy ? "Show loaded" : "Replay loading"}
				</Button>
			}
		>
			<div role="status" aria-live="polite" className="sr-only">
				{busy ? "Loading showcase" : "Showcase loaded"}
			</div>

			<SectionRule
				title="Bones"
				hint="Skeleton provides shimmer line, block, and circle placeholder bones."
			>
				<div className="grid gap-basalt-layout lg:grid-cols-2">
					<LayerCard className="space-y-basalt-card-sm">
						<Skeleton width="40%" />
						<Skeleton width="88%" />
						<Skeleton width="64%" />
						<div className="flex items-center gap-basalt-card-sm pt-basalt-card-sm">
							<BoneAvatar />
							<div className="min-w-0 flex-1 space-y-basalt-space-lg">
								<Skeleton width="52%" />
								<Skeleton width="70%" height={8} />
							</div>
						</div>
					</LayerCard>
					<LayerCard>
						<LayerCard.Loading label="Loading card" />
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule
				title="Spinners"
				hint="Loader is the library mark. Button loading and InputGroup use the same motion."
			>
				<LayerCard>
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<Loader size={16} showLabel={false} showElapsed={false} />
						<Loader size={24} />
						<Loader size={36} />
						<Button loading>Saving</Button>
						<InputGroup className="max-w-56">
							<InputGroup.Input defaultValue="atlas" aria-label="Loading query" />
							<InputGroup.Addon align="end">
								<Loader size={16} showLabel={false} showElapsed={false} />
							</InputGroup.Addon>
						</InputGroup>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Metrics">
				<StatGrid>
					{METRICS.map((metric) => (
						<StatCard key={metric.label} title={metric.label} value={metric.value} loading={busy} />
					))}
				</StatGrid>
			</SectionRule>

			<SectionRule
				title="Dashboard"
				hint="Keep the grid. Swap values for bones of the same height."
			>
				<div aria-busy={busy} data-loading-composition="dashboard" className="space-y-basalt-card">
					<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 xl:grid-cols-4">
						{METRICS.map((metric) => (
							<LayerCard key={metric.label} className="min-h-28 space-y-basalt-card-sm">
								{busy ? (
									<>
										<Skeleton width={`${metric.width}%`} height={10} />
										<Skeleton width="50%" height={24} />
										<Skeleton width="38%" height={9} />
									</>
								) : (
									<>
										<p className="text-basalt-sm text-basalt-muted-foreground">{metric.label}</p>
										<p className="text-basalt-3xl font-semibold tabular-nums">{metric.value}</p>
									</>
								)}
							</LayerCard>
						))}
					</div>
					<LayerCard className="h-40">
						{busy ? (
							<div
								aria-hidden="true"
								className="flex h-full items-end gap-basalt-space-lg border-b border-basalt-border pb-basalt-space-lg"
							>
								{[32, 48, 40, 67, 55, 84, 69, 78, 64, 92, 80, 96].map((height) => (
									<Skeleton
										key={height}
										variant="block"
										width="100%"
										height={`${height}%`}
										className="flex-1 rounded-b-none rounded-t-basalt-md"
									/>
								))}
							</div>
						) : (
							<p className="text-basalt-base text-basalt-muted-foreground">
								Request volume is up 18.6% from last week.
							</p>
						)}
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title="List">
				<LayerCard padding="none" aria-busy={busy} data-loading-composition="list">
					<div className="grid grid-cols-[minmax(0,1fr)_5.625rem_5.625rem] gap-basalt-layout border-b border-basalt-border px-basalt-card py-basalt-card-sm text-basalt-sm text-basalt-muted-foreground">
						<span>Workspace</span>
						<span>Status</span>
						<span className="text-right">Requests</span>
					</div>
					{WORKSPACES.map((row, index) => (
						<div
							key={row.name}
							className="grid h-16 grid-cols-[minmax(0,1fr)_5.625rem_5.625rem] items-center gap-basalt-layout border-b border-basalt-border/60 px-basalt-card last:border-0"
						>
							<div className="flex items-center gap-basalt-space-lg">
								{busy ? (
									<BoneAvatar />
								) : (
									<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-basalt-full bg-basalt-muted text-basalt-sm font-medium">
										{row.name.slice(0, 2)}
									</div>
								)}
								{busy ? (
									<div className="min-w-0 flex-1 space-y-basalt-space-lg">
										<Skeleton width="44%" />
										<Skeleton width={`${62 - index * 8}%`} height={8} />
									</div>
								) : (
									<span className="text-basalt-base font-medium">{row.name}</span>
								)}
							</div>
							{busy ? <Skeleton width="70%" /> : <Badge variant="outline">{row.status}</Badge>}
							{busy ? (
								<Skeleton width="55%" className="ml-auto" />
							) : (
								<span className="text-right text-basalt-base tabular-nums">{row.requests}</span>
							)}
						</div>
					))}
				</LayerCard>
			</SectionRule>

			<SectionRule title="Detail">
				<div
					aria-busy={busy}
					data-loading-composition="detail"
					className="grid gap-basalt-layout lg:grid-cols-[minmax(0,1fr)_15rem]"
				>
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-basalt-lg bg-basalt-muted text-basalt-xl font-semibold">
								{busy ? <Skeleton variant="block" height={56} /> : "A"}
							</div>
							<div className="min-w-0 flex-1 space-y-basalt-space-lg">
								{busy ? (
									<>
										<Skeleton width="48%" height={18} />
										<Skeleton width="72%" />
									</>
								) : (
									<>
										<h2 className="text-basalt-xl font-semibold">Atlas production</h2>
										<p className="text-basalt-base text-basalt-muted-foreground">
											A shared home for production services.
										</p>
									</>
								)}
							</div>
						</LayerCard.Header>
						<LayerCard.Body>
							{busy ? (
								<div className="space-y-basalt-space-lg">
									<Skeleton width="100%" />
									<Skeleton width="86%" />
									<Skeleton width="64%" />
								</div>
							) : (
								<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
									Atlas handles production traffic across three regions. Deployments are reviewed
									before release.
								</p>
							)}
						</LayerCard.Body>
					</LayerCard>
					<LayerCard>
						{busy ? (
							<div className="space-y-basalt-space-lg">
								<Skeleton width="36%" />
								<Skeleton width="58%" />
								<Skeleton width="44%" />
								<Skeleton width="70%" />
							</div>
						) : (
							<DescriptionList columns={1}>
								<DescriptionList.Item term="Region">US East</DescriptionList.Item>
								<DescriptionList.Item term="Owner">Platform</DescriptionList.Item>
							</DescriptionList>
						)}
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title="Table">
				<LayerCard padding="none">
					<DataTable
						edge="attached"
						loading={busy}
						data={TABLE_ROWS}
						columns={[
							{
								id: "name",
								header: "Workspace",
								accessor: (row) => row.name,
							},
							{
								id: "region",
								header: "Region",
								accessor: (row) => row.region,
							},
							{
								id: "status",
								header: "Status",
								accessor: (row) => row.status,
							},
						]}
					/>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Full screen"
				hint="LoadingScreen fills the viewport as a route-level loading state."
			>
				<LayerCard>
					<div className="relative h-40 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
						<LoadingScreen
							label="Loading"
							mark={<BasaltMark className="h-basalt-8 w-basalt-8 text-basalt-foreground" />}
							className="absolute inset-0 z-0"
						/>
					</div>
				</LayerCard>
			</SectionRule>
		</ShowcasePage>
	);
}
