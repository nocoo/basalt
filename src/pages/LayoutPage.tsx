import { Button } from "@nocoo/basalt/components/button";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Grid } from "@nocoo/basalt/components/grid";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import {
	AlignHorizontalDistributeCenter,
	Columns3,
	Grid3X3,
	Layers,
	LayoutGrid,
	ListChecks,
	Maximize2,
	Rows3,
	SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageIntro } from "@/components/PageIntro";
import { cn } from "@/lib/utils";

function Section({
	title,
	icon: Icon,
	hint,
	children,
}: {
	title: string;
	icon: React.ElementType;
	hint?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
				<p className="text-sm text-muted-foreground">{title}</p>
			</div>
			{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
			{children}
		</div>
	);
}

function Tile({ label, className = "" }: { label: string; className?: string }) {
	return (
		<LayerCard
			className={cn(
				"flex min-h-[80px] items-center justify-center font-mono text-xs text-muted-foreground",
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
		<div className="space-y-4">
			<PageIntro
				title={t("pages.layout.title")}
				description={t("pages.layout.description")}
				eyebrow={t("pages.layout.eyebrow")}
				icon={LayoutGrid}
			/>

			<Section title={t("pages.layout.stack")} icon={Layers} hint={t("pages.layout.stackDesc")}>
				<LayerCard padding="none">
					<LayerCard.Header>{t("pages.layout.l2Card")}</LayerCard.Header>
					<LayerCard.Well className="space-y-3">
						<p className="text-sm text-foreground">{t("pages.layout.l3Well")}</p>
						<LayerCard>
							<p className="text-xs text-muted-foreground">{t("pages.layout.l3Plus")}</p>
						</LayerCard>
					</LayerCard.Well>
				</LayerCard>
			</Section>

			<Section title={t("pages.layout.bodyVsWell")} icon={Rows3}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<LayerCard padding="none">
						<LayerCard.Header>{t("pages.layout.bodyTitle")}</LayerCard.Header>
						<LayerCard.Body>
							<p className="mb-3 text-xs text-muted-foreground">{t("pages.layout.bodyDesc")}</p>
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
							<p className="mb-3 text-xs text-muted-foreground">{t("pages.layout.wellDesc")}</p>
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
			</Section>

			<Section
				title={t("pages.layout.controls")}
				icon={SlidersHorizontal}
				hint={t("pages.layout.controlsDesc")}
			>
				<LayerCard padding="none">
					<LayerCard.Header>{t("pages.layout.onL2")}</LayerCard.Header>
					<LayerCard.Body className="flex flex-wrap items-center gap-3">
						<Input className="max-w-56" placeholder={t("pages.layout.onL2")} />
						<Button variant="outline">{t("common.cancel")}</Button>
					</LayerCard.Body>
					<LayerCard.Well className="flex flex-wrap items-center gap-3">
						<Input className="max-w-56" placeholder={t("pages.layout.onL3")} />
						<Button variant="outline">{t("common.cancel")}</Button>
					</LayerCard.Well>
				</LayerCard>
			</Section>

			<Section title={t("pages.layout.rules")} icon={ListChecks}>
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
			</Section>

			<Section title={t("pages.layout.equalColumns")} icon={Grid3X3}>
				<div className="space-y-4">
					<Grid columns={2} className="gap-4">
						<Tile label="1/2" />
						<Tile label="1/2" />
					</Grid>
					<Grid columns={3} className="gap-4">
						<Tile label="1/3" />
						<Tile label="1/3" />
						<Tile label="1/3" />
					</Grid>
					<Grid columns={4} className="gap-4">
						<Tile label="1/4" />
						<Tile label="1/4" />
						<Tile label="1/4" />
						<Tile label="1/4" />
					</Grid>
				</div>
			</Section>

			<Section title={t("pages.layout.asymmetricColumns")} icon={Columns3}>
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<Tile label="1/3" />
						<Tile label="2/3" className="col-span-2" />
					</div>
					<div className="grid grid-cols-4 gap-4">
						<Tile label="1/4" />
						<Tile label="3/4" className="col-span-3" />
					</div>
					<div className="grid grid-cols-12 gap-4">
						<Tile label="5 cols" className="col-span-5" />
						<Tile label="7 cols" className="col-span-7" />
					</div>
				</div>
			</Section>

			<Section
				title={t("pages.layout.responsiveBreakpoints")}
				icon={Maximize2}
				hint={t("pages.layout.responsiveDesc")}
			>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<Tile label="A" />
					<Tile label="B" />
					<Tile label="C" />
					<Tile label="D" />
				</div>
			</Section>

			<Section title={t("pages.layout.spanningRowsCols")} icon={Rows3}>
				<div className="grid grid-cols-3 grid-rows-2 gap-4">
					<Tile label={t("pages.layout.span2Rows")} className="row-span-2 min-h-[160px]" />
					<Tile label="1x1" />
					<Tile label="1x1" />
					<Tile label={t("pages.layout.span2Cols")} className="col-span-2" />
				</div>
			</Section>

			<Section title={t("pages.layout.dashboardComposition")} icon={LayoutGrid}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
					<LayerCard className="lg:col-span-2 min-h-[120px]">
						<p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.wideCard")}</p>
						<p className="text-xs text-muted-foreground">{t("pages.layout.wideCardDesc")}</p>
					</LayerCard>
					<LayerCard className="min-h-[120px]">
						<p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.metric")}</p>
						<p className="text-2xl font-semibold text-foreground">1,284</p>
					</LayerCard>
					<LayerCard className="min-h-[120px]">
						<p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.metric")}</p>
						<p className="text-2xl font-semibold text-foreground">$42.5k</p>
					</LayerCard>
				</div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
					<LayerCard padding="none" className="md:col-span-2">
						<LayerCard.Header>{t("pages.layout.mainContentArea")}</LayerCard.Header>
						<LayerCard.Well className="min-h-[160px]">
							<p className="text-xs text-muted-foreground">{t("pages.layout.mainContentDesc")}</p>
						</LayerCard.Well>
					</LayerCard>
					<LayerCard className="min-h-[200px]">
						<p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.sidebar")}</p>
						<p className="text-xs text-muted-foreground">{t("pages.layout.sidebarDesc")}</p>
					</LayerCard>
				</div>
			</Section>

			<Section title={t("pages.layout.flexboxPatterns")} icon={AlignHorizontalDistributeCenter}>
				<div className="space-y-4">
					<div>
						<p className="text-xs text-muted-foreground mb-2 font-mono">justify-center</p>
						<div className="flex justify-center gap-3">
							<Tile label="A" className="w-20 min-h-0" />
							<Tile label="B" className="w-20 min-h-0" />
							<Tile label="C" className="w-20 min-h-0" />
						</div>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-2 font-mono">justify-between</p>
						<div className="flex justify-between gap-3">
							<Tile label={t("common.left")} className="w-24 min-h-0" />
							<Tile label={t("common.right")} className="w-24 min-h-0" />
						</div>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-2 font-mono">flex-wrap</p>
						<div className="flex flex-wrap gap-3">
							{Array.from({ length: 8 }, (_, i) => (
								<Tile key={i} label={`${i + 1}`} className="w-20 min-h-0" />
							))}
						</div>
					</div>
					<div>
						<p className="text-xs text-muted-foreground mb-2 font-mono">flex-col gap-3</p>
						<div className="flex max-w-xs flex-col gap-3">
							<Tile label={t("common.top")} className="min-h-0" />
							<Tile label={t("common.middle")} className="min-h-0" />
							<Tile label={t("common.bottom")} className="min-h-0" />
						</div>
					</div>
				</div>
			</Section>

			<Section
				title={t("pages.layout.autoFitGrid")}
				icon={Grid3X3}
				hint={t("pages.layout.autoFitDesc")}
			>
				<div
					className="grid gap-4"
					style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
				>
					{Array.from({ length: 6 }, (_, i) => (
						<LayerCard key={i} className="min-h-[100px]">
							<p className="text-xs font-medium text-foreground mb-1">
								{t("pages.layout.cardN", { n: i + 1 })}
							</p>
							<p className="text-xs text-muted-foreground">{t("pages.layout.cardAutoDesc")}</p>
						</LayerCard>
					))}
				</div>
			</Section>
		</div>
	);
}
