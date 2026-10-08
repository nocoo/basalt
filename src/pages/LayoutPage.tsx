import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Grid } from "@nocoo/basalt/components/grid";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import { cn } from "@/lib/utils";

function Tile({ label, className = "" }: { label: string; className?: string }) {
	return (
		<LayerCard
			className={cn(
				"flex min-h-[5rem] items-center justify-center font-mono text-basalt-sm text-muted-foreground",
				className,
			)}
		>
			{label}
		</LayerCard>
	);
}

export default function LayoutPage() {
	const { t } = useTranslation();

	return (
		<ShowcasePage title={t("pages.layout.title")} description={t("pages.layout.description")}>
			<section aria-label="Full-page layout examples" className="flex flex-wrap gap-basalt-layout">
				<LinkButton href="/examples/reader" variant="outline">
					Immersive reader
				</LinkButton>
				<LinkButton href="/examples/list-detail" variant="outline">
					Mobile list / desktop panes
				</LinkButton>
				<LinkButton href="/examples/workspace" variant="outline">
					Workspace and form
				</LinkButton>
			</section>

			<SectionRule title={t("pages.layout.stack")} hint={t("pages.layout.stackDesc")}>
				<LayerCard padding="none">
					<LayerCard.Header>{t("pages.layout.l2Card")}</LayerCard.Header>
					<LayerCard.Well className="space-y-basalt-layout">
						<p className="text-basalt-base text-foreground">{t("pages.layout.l3Well")}</p>
						<LayerCard>
							<p className="text-basalt-sm text-muted-foreground">{t("pages.layout.l3Plus")}</p>
						</LayerCard>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.layout.bodyVsWell")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2">
					<LayerCard padding="none">
						<LayerCard.Header>{t("pages.layout.bodyTitle")}</LayerCard.Header>
						<LayerCard.Body>
							<p className="mb-basalt-space-lg text-basalt-sm text-muted-foreground">
								{t("pages.layout.bodyDesc")}
							</p>
							<DescriptionList columns={1}>
								<DescriptionList.Item term={t("pages.layout.termStatus")}>
									{t("pages.layout.valueActive")}
								</DescriptionList.Item>
								<DescriptionList.Item term={t("pages.layout.termPlan")}>
									{t("pages.layout.valueEnterprise")}
								</DescriptionList.Item>
							</DescriptionList>
						</LayerCard.Body>
					</LayerCard>
					<LayerCard padding="none">
						<LayerCard.Header>{t("pages.layout.wellTitle")}</LayerCard.Header>
						<LayerCard.Well>
							<p className="mb-basalt-space-lg text-basalt-sm text-muted-foreground">
								{t("pages.layout.wellDesc")}
							</p>
							<DescriptionList columns={1}>
								<DescriptionList.Item term={t("pages.layout.termStatus")}>
									{t("pages.layout.valueActive")}
								</DescriptionList.Item>
								<DescriptionList.Item term={t("pages.layout.termPlan")}>
									{t("pages.layout.valueEnterprise")}
								</DescriptionList.Item>
							</DescriptionList>
						</LayerCard.Well>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.layout.controls")} hint={t("pages.layout.controlsDesc")}>
				<LayerCard padding="none">
					<LayerCard.Header>{t("pages.layout.onL2")}</LayerCard.Header>
					<LayerCard.Body className="flex flex-wrap items-center gap-basalt-layout">
						<Input className="max-w-56" placeholder={t("pages.layout.onL2")} />
						<Button variant="outline">{t("common.cancel")}</Button>
					</LayerCard.Body>
					<LayerCard.Well className="flex flex-wrap items-center gap-basalt-layout">
						<Input className="max-w-56" placeholder={t("pages.layout.onL3")} />
						<Button variant="outline">{t("common.cancel")}</Button>
					</LayerCard.Well>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.layout.rules")}>
				<LayerCard>
					<DescriptionList>
						<DescriptionList.Item term={t("pages.layout.ruleRoot")}>
							{t("pages.layout.ruleRootValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.layout.ruleCard")}>
							{t("pages.layout.ruleCardValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.layout.ruleWell")}>
							{t("pages.layout.ruleWellValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.layout.ruleControl")}>
							{t("pages.layout.ruleControlValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.layout.ruleOverlay")}>
							{t("pages.layout.ruleOverlayValue")}
						</DescriptionList.Item>
					</DescriptionList>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.layout.equalColumns")}>
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

			<SectionRule title={t("pages.layout.asymmetricColumns")}>
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
				title={t("pages.layout.responsiveBreakpoints")}
				hint={t("pages.layout.responsiveDesc")}
			>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 lg:grid-cols-4">
					<Tile label="A" />
					<Tile label="B" />
					<Tile label="C" />
					<Tile label="D" />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.layout.spanningRowsCols")}>
				<div className="grid grid-cols-3 grid-rows-2 gap-basalt-layout">
					<Tile label={t("pages.layout.span2Rows")} className="row-span-2 min-h-[10rem]" />
					<Tile label="1x1" />
					<Tile label="1x1" />
					<Tile label={t("pages.layout.span2Cols")} className="col-span-2" />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.layout.dashboardComposition")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 lg:grid-cols-4">
					<LayerCard className="lg:col-span-2 min-h-[7.5rem]">
						<p className="text-basalt-sm font-medium text-foreground mb-basalt-space-sm">
							{t("pages.layout.wideCard")}
						</p>
						<p className="text-basalt-sm text-muted-foreground">{t("pages.layout.wideCardDesc")}</p>
					</LayerCard>
					<LayerCard className="min-h-[7.5rem]">
						<p className="text-basalt-sm font-medium text-foreground mb-basalt-space-sm">
							{t("pages.layout.metric")}
						</p>
						<p className="text-basalt-3xl font-semibold text-foreground">1,284</p>
					</LayerCard>
					<LayerCard className="min-h-[7.5rem]">
						<p className="text-basalt-sm font-medium text-foreground mb-basalt-space-sm">
							{t("pages.layout.metric")}
						</p>
						<p className="text-basalt-3xl font-semibold text-foreground">$42.5k</p>
					</LayerCard>
				</div>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					<LayerCard padding="none" className="md:col-span-2">
						<LayerCard.Header>{t("pages.layout.mainContentArea")}</LayerCard.Header>
						<LayerCard.Well className="min-h-[10rem]">
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.layout.mainContentDesc")}
							</p>
						</LayerCard.Well>
					</LayerCard>
					<LayerCard className="min-h-[12.5rem]">
						<p className="text-basalt-sm font-medium text-foreground mb-basalt-space-sm">
							{t("pages.layout.sidebar")}
						</p>
						<p className="text-basalt-sm text-muted-foreground">{t("pages.layout.sidebarDesc")}</p>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.layout.flexboxPatterns")}>
				<div className="space-y-basalt-layout">
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							justify-center
						</p>
						<div className="flex justify-center gap-basalt-layout">
							<Tile label="A" className="w-20 min-h-0" />
							<Tile label="B" className="w-20 min-h-0" />
							<Tile label="C" className="w-20 min-h-0" />
						</div>
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							justify-between
						</p>
						<div className="flex justify-between gap-basalt-layout">
							<Tile label={t("common.left")} className="w-24 min-h-0" />
							<Tile label={t("common.right")} className="w-24 min-h-0" />
						</div>
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							flex-wrap
						</p>
						<div className="flex flex-wrap gap-basalt-layout">
							{Array.from({ length: 8 }, (_, i) => (
								<Tile key={i} label={`${i + 1}`} className="w-20 min-h-0" />
							))}
						</div>
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							flex-col gap-basalt-layout
						</p>
						<div className="flex max-w-xs flex-col gap-basalt-layout">
							<Tile label={t("common.top")} className="min-h-0" />
							<Tile label={t("common.middle")} className="min-h-0" />
							<Tile label={t("common.bottom")} className="min-h-0" />
						</div>
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.layout.autoFitGrid")} hint={t("pages.layout.autoFitDesc")}>
				<div
					className="grid gap-basalt-layout"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
				>
					{Array.from({ length: 6 }, (_, i) => (
						<LayerCard key={i} className="min-h-[6.25rem]">
							<p className="text-basalt-sm font-medium text-foreground mb-basalt-space-sm">
								{t("pages.layout.cardN", { n: i + 1 })}
							</p>
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.layout.cardAutoDesc")}
							</p>
						</LayerCard>
					))}
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
