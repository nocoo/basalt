import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { DataTable } from "@nocoo/basalt/components/data-table";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { LoadingScreen } from "@nocoo/basalt/components/loading-screen";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { StatStrip } from "@nocoo/basalt/components/stat-strip";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useLoadingShowcaseViewModel } from "@/viewmodels/useLoadingShowcaseViewModel";

const METRICS = [
	{ labelKey: "pages.loadingStates.metricRequests", value: "148,290", width: 70 },
	{ labelKey: "pages.loadingStates.metricProjects", value: "24", width: 48 },
	{ labelKey: "pages.loadingStates.metricSuccess", value: "99.98%", width: 62 },
	{ labelKey: "pages.loadingStates.metricLatency", value: "42 ms", width: 55 },
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
	return (
		<SkeletonLine
			minWidth={100}
			maxWidth={100}
			height={36}
			className="rounded-basalt-full"
			style={{ width: 36, flexShrink: 0 }}
		/>
	);
}

export default function LoadingStatesPage() {
	const { t } = useTranslation();
	const { busy, toggleBusy } = useLoadingShowcaseViewModel();

	return (
		<ShowcasePage
			title={t("pages.loadingStates.title")}
			description={t("pages.loadingStates.description")}
			actions={
				<Button size="sm" variant="outline" onClick={toggleBusy}>
					{busy ? t("pages.loadingStates.showLoaded") : t("pages.loadingStates.replay")}
				</Button>
			}
		>
			<div role="status" aria-live="polite" className="sr-only">
				{busy ? t("pages.loadingStates.statusLoading") : t("pages.loadingStates.statusLoaded")}
			</div>

			<SectionRule
				title={t("pages.loadingStates.primitives")}
				hint={t("pages.loadingStates.primitivesHint")}
			>
				<div className="grid gap-basalt-layout lg:grid-cols-2">
					<LayerCard className="space-y-basalt-space-lg">
						<SkeletonLine minWidth={40} maxWidth={40} />
						<SkeletonLine minWidth={88} maxWidth={88} />
						<SkeletonLine minWidth={64} maxWidth={64} />
						<div className="flex items-center gap-basalt-space-lg pt-basalt-space-lg">
							<BoneAvatar />
							<div className="min-w-0 flex-1 space-y-basalt-space-lg">
								<SkeletonLine minWidth={52} maxWidth={52} />
								<SkeletonLine minWidth={70} maxWidth={70} height={8} />
							</div>
						</div>
					</LayerCard>
					<LayerCard>
						<LayerCard.Loading label={t("pages.loadingStates.cardLoadingLabel")} />
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule
				title={t("pages.loadingStates.spinners")}
				hint={t("pages.loadingStates.spinnersHint")}
			>
				<div className="flex flex-wrap items-center gap-basalt-space-lg">
					<Loader size={16} showLabel={false} showElapsed={false} />
					<Loader size={24} />
					<Loader size={36} />
					<Button loading>{t("pages.loadingStates.buttonBusy")}</Button>
					<InputGroup className="max-w-56">
						<InputGroup.Input defaultValue="atlas" aria-label={t("pages.loadingStates.query")} />
						<InputGroup.Addon align="end">
							<Loader size={16} showLabel={false} showElapsed={false} />
						</InputGroup.Addon>
					</InputGroup>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.loadingStates.metrics")}>
				<StatStrip
					loading={busy}
					items={METRICS.map((metric) => ({
						label: t(metric.labelKey),
						value: metric.value,
					}))}
				/>
			</SectionRule>

			<SectionRule
				title={t("pages.loadingStates.dashboard")}
				hint={t("pages.loadingStates.dashboardHint")}
			>
				<div
					aria-busy={busy}
					data-loading-composition="dashboard"
					className="space-y-basalt-space-lg"
				>
					<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 xl:grid-cols-4">
						{METRICS.map((metric) => (
							<LayerCard key={metric.labelKey} className="h-28 space-y-basalt-space-lg">
								{busy ? (
									<>
										<SkeletonLine minWidth={metric.width} maxWidth={metric.width} height={10} />
										<SkeletonLine minWidth={50} maxWidth={50} height={24} />
										<SkeletonLine minWidth={38} maxWidth={38} height={9} />
									</>
								) : (
									<>
										<p className="text-basalt-sm text-basalt-muted-foreground">
											{t(metric.labelKey)}
										</p>
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
									<SkeletonLine
										key={height}
										minWidth={100}
										maxWidth={100}
										className="flex-1 rounded-t-basalt-md"
										style={{ height: `${height}%` }}
									/>
								))}
							</div>
						) : (
							<p className="text-basalt-base text-basalt-muted-foreground">
								{t("pages.loadingStates.dashboardLoaded")}
							</p>
						)}
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.loadingStates.list")}>
				<LayerCard padding="none" aria-busy={busy} data-loading-composition="list">
					<div className="grid grid-cols-[minmax(0,1fr)_5.625rem_5.625rem] gap-basalt-layout border-b border-basalt-border px-basalt-space-lg py-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
						<span>{t("pages.loadingStates.colWorkspace")}</span>
						<span>{t("pages.loadingStates.colStatus")}</span>
						<span className="text-right">{t("pages.loadingStates.colRequests")}</span>
					</div>
					{WORKSPACES.map((row, index) => (
						<div
							key={row.name}
							className="grid h-16 grid-cols-[minmax(0,1fr)_5.625rem_5.625rem] items-center gap-basalt-layout border-b border-basalt-border/60 px-basalt-space-lg last:border-0"
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
										<SkeletonLine minWidth={44} maxWidth={44} />
										<SkeletonLine minWidth={62 - index * 8} maxWidth={62 - index * 8} height={8} />
									</div>
								) : (
									<span className="text-basalt-base font-medium">{row.name}</span>
								)}
							</div>
							{busy ? (
								<SkeletonLine minWidth={70} maxWidth={70} />
							) : (
								<Badge variant="outline">{row.status}</Badge>
							)}
							{busy ? (
								<SkeletonLine minWidth={55} maxWidth={55} className="ml-auto" />
							) : (
								<span className="text-right text-basalt-base tabular-nums">{row.requests}</span>
							)}
						</div>
					))}
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.loadingStates.detail")}>
				<div
					aria-busy={busy}
					data-loading-composition="detail"
					className="grid gap-basalt-layout lg:grid-cols-[minmax(0,1fr)_15rem]"
				>
					<LayerCard>
						<LayerCard.Header className="items-center justify-start">
							<div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-basalt-lg bg-basalt-muted text-basalt-2xl font-semibold">
								{busy ? <SkeletonLine minWidth={100} maxWidth={100} height={56} /> : "A"}
							</div>
							<div className="min-w-0 flex-1 space-y-basalt-space-lg">
								{busy ? (
									<>
										<SkeletonLine minWidth={48} maxWidth={48} height={18} />
										<SkeletonLine minWidth={72} maxWidth={72} />
									</>
								) : (
									<>
										<h2 className="text-basalt-2xl font-semibold">
											{t("pages.loadingStates.detailTitle")}
										</h2>
										<p className="text-basalt-base text-basalt-muted-foreground">
											{t("pages.loadingStates.detailBody")}
										</p>
									</>
								)}
							</div>
						</LayerCard.Header>
						<LayerCard.Body>
							{busy ? (
								<div className="space-y-basalt-space-lg">
									<SkeletonLine minWidth={100} maxWidth={100} />
									<SkeletonLine minWidth={86} maxWidth={86} />
									<SkeletonLine minWidth={64} maxWidth={64} />
								</div>
							) : (
								<p className="text-basalt-base leading-basalt-relaxed text-basalt-muted-foreground">
									{t("pages.loadingStates.detailCopy")}
								</p>
							)}
						</LayerCard.Body>
					</LayerCard>
					<LayerCard>
						{busy ? (
							<div className="space-y-basalt-space-lg">
								<SkeletonLine minWidth={36} maxWidth={36} />
								<SkeletonLine minWidth={58} maxWidth={58} />
								<SkeletonLine minWidth={44} maxWidth={44} />
								<SkeletonLine minWidth={70} maxWidth={70} />
							</div>
						) : (
							<DescriptionList columns={1}>
								<DescriptionList.Item term={t("pages.loadingStates.region")}>
									US East
								</DescriptionList.Item>
								<DescriptionList.Item term={t("pages.loadingStates.owner")}>
									Platform
								</DescriptionList.Item>
							</DescriptionList>
						)}
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.loadingStates.table")}>
				<DataTable
					loading={busy}
					data={TABLE_ROWS}
					columns={[
						{
							id: "name",
							header: t("pages.loadingStates.colWorkspace"),
							accessor: (row) => row.name,
						},
						{
							id: "region",
							header: t("pages.loadingStates.region"),
							accessor: (row) => row.region,
						},
						{
							id: "status",
							header: t("pages.loadingStates.colStatus"),
							accessor: (row) => row.status,
						},
					]}
				/>
			</SectionRule>

			<SectionRule
				title={t("pages.loadingStates.screen")}
				hint={t("pages.loadingStates.screenHint")}
			>
				<div className="space-y-basalt-space-lg">
					<div className="relative h-40 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
						<LoadingScreen
							label={t("pages.loadingStates.screenLabel")}
							className="absolute inset-0 z-0"
						/>
					</div>
					<Link href="/loading">{t("pages.loadingStates.openScreen")}</Link>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
