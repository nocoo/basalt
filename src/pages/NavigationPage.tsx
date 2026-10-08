import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Pagination } from "@nocoo/basalt/components/pagination";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { TablePager } from "@nocoo/basalt/components/table-pager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { CheckCircle2, FileText, FolderOpen, Home } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";

/* ── Stepper ── */
function Stepper({ steps, current }: { steps: string[]; current: number }) {
	return (
		<div className="flex items-center">
			{steps.map((step, i) => (
				<div key={step} className="flex items-center">
					<div className="flex items-center gap-basalt-space-lg">
						<div
							className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-basalt-full text-basalt-sm font-medium transition-colors basalt-motion ${
								i < current
									? "bg-primary text-primary-foreground"
									: i === current
										? "border-2 border-primary text-primary"
										: "border border-border text-muted-foreground"
							}`}
						>
							{i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
						</div>
						<div className="hidden sm:block">
							<p
								className={`text-basalt-sm font-medium ${i <= current ? "text-foreground" : "text-muted-foreground"}`}
							>
								{step}
							</p>
						</div>
					</div>
					{i < steps.length - 1 && (
						<div
							className={`mx-basalt-space-sm h-px w-2 sm:mx-basalt-space-lg sm:w-12 ${i < current ? "bg-primary" : "bg-border"}`}
						/>
					)}
				</div>
			))}
		</div>
	);
}

export default function NavigationPage() {
	const [period, setPeriod] = useState("day");
	const { t } = useTranslation();
	const [page1, setPage1] = useState(1);
	const [page2, setPage2] = useState(5);
	const [stepperIndex, setStepperIndex] = useState(1);

	const stepperSteps = [
		t("pages.navigation.account"),
		t("pages.navigation.profile"),
		t("pages.navigation.preferences"),
		t("pages.navigation.review"),
		t("pages.navigation.complete"),
	];

	const underlineTabs = [
		{ label: t("pages.navigation.all"), value: "all" },
		{ label: t("pages.navigation.activeTab"), value: "active" },
		{ label: t("pages.navigation.archived"), value: "archived" },
		{ label: t("pages.navigation.drafts"), value: "drafts" },
	];

	const pillTabs = [
		{ label: t("pages.navigation.day"), value: "day" },
		{ label: t("pages.navigation.week"), value: "week" },
		{ label: t("pages.navigation.month"), value: "month" },
		{ label: t("pages.navigation.year"), value: "year" },
	];

	return (
		<ShowcasePage
			title={t("pages.navigation.title")}
			description={t("pages.navigation.description")}
		>
			<SectionRule title={t("pages.navigation.breadcrumbs")}>
				<div className="space-y-basalt-space-lg">
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.simple")}
						</p>
						<Breadcrumbs
							className="flex-wrap gap-y-basalt-space-lg"
							items={[
								{ label: t("pages.navigation.home") },
								{ label: t("pages.navigation.products") },
								{ label: t("pages.navigation.electronics") },
								{ label: t("pages.navigation.headphones") },
							]}
						/>
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.withIcons")}
						</p>
						<Breadcrumbs
							className="flex-wrap gap-y-basalt-space-lg"
							items={[
								{
									label: t("pages.navigation.home"),
									icon: <Home className="h-3.5 w-3.5" strokeWidth={1.5} />,
								},
								{
									label: t("pages.navigation.documents"),
									icon: <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.5} />,
								},
								{
									label: t("pages.navigation.reports"),
									icon: <FolderOpen className="h-3.5 w-3.5" strokeWidth={1.5} />,
								},
								{
									label: t("pages.navigation.q4Summary"),
									icon: <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />,
								},
							]}
						/>
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.insideCard")}
						</p>
						<LayerCard>
							<Breadcrumbs
								className="flex-wrap gap-y-basalt-space-lg"
								items={[
									{ label: t("pages.navigation.dashboard") },
									{ label: t("pages.navigation.settings") },
									{ label: t("pages.navigation.notifications") },
								]}
							/>
							<p className="text-basalt-base text-foreground font-medium mt-basalt-space-lg">
								{t("pages.navigation.notificationPrefs")}
							</p>
							<p className="text-basalt-sm text-muted-foreground mt-basalt-space-sm">
								{t("pages.navigation.notificationPrefsDesc")}
							</p>
						</LayerCard>
					</div>
				</div>
			</SectionRule>

			{/* Pagination */}
			<SectionRule title={t("pages.navigation.pagination")}>
				<div className="space-y-basalt-space-lg">
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.short5Pages")}
						</p>
						<Pagination page={page1} pageCount={5} onPageChange={setPage1} />
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.long20Pages")}
						</p>
						<Pagination page={page2} pageCount={20} onPageChange={setPage2} />
					</div>
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.withContext")}
						</p>
						<LayerCard>
							<TablePager
								page={page2}
								pageSize={10}
								totalCount={200}
								onPageChange={setPage2}
								formatRange={({ start, end, totalCount }) => (
									<>
										{t("common.showing")}{" "}
										<span className="font-medium text-foreground">
											{start}-{end}
										</span>{" "}
										{t("common.of")}{" "}
										<span className="font-medium text-foreground">{totalCount}</span>{" "}
										{t("common.results")}
									</>
								)}
							/>
						</LayerCard>
					</div>
				</div>
			</SectionRule>

			{/* Stepper / Wizard */}
			<SectionRule title={t("pages.navigation.stepperWizard")}>
				<div className="space-y-basalt-space-lg">
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.horizontalStepper")}
						</p>
						<Stepper steps={stepperSteps} current={stepperIndex} />
						<div className="flex items-center gap-basalt-space-lg mt-basalt-space-lg">
							<Button
								variant="outline"
								size="sm"
								disabled={stepperIndex === 0}
								onClick={() => setStepperIndex((i) => i - 1)}
							>
								{t("common.back")}
							</Button>
							<Button
								size="sm"
								disabled={stepperIndex === stepperSteps.length - 1}
								onClick={() => setStepperIndex((i) => i + 1)}
							>
								{stepperIndex === stepperSteps.length - 2 ? t("common.finish") : t("common.next")}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="ml-auto"
								onClick={() => setStepperIndex(0)}
							>
								{t("common.reset")}
							</Button>
						</div>
					</div>

					{/* Vertical stepper */}
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.verticalStepper")}
						</p>
						<div className="max-w-sm">
							{stepperSteps.map((step, i) => (
								<div key={step} className="flex gap-basalt-space-lg">
									<div className="flex flex-col items-center">
										<div
											className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-basalt-full text-basalt-sm font-medium ${
												i < stepperIndex
													? "bg-primary text-primary-foreground"
													: i === stepperIndex
														? "border-2 border-primary text-primary"
														: "border border-border text-muted-foreground"
											}`}
										>
											{i < stepperIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
										</div>
										{i < stepperSteps.length - 1 && (
											<div
												className={`w-px flex-1 min-h-[1.5rem] ${i < stepperIndex ? "bg-primary" : "bg-border"}`}
											/>
										)}
									</div>
									<div className="pb-basalt-space-lg">
										<p
											className={`text-basalt-base font-medium ${i <= stepperIndex ? "text-foreground" : "text-muted-foreground"}`}
										>
											{step}
										</p>
										<p className="text-basalt-sm text-muted-foreground">
											{i < stepperIndex
												? t("pages.navigation.completed")
												: i === stepperIndex
													? t("pages.navigation.inProgress")
													: t("pages.navigation.pending")}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</SectionRule>

			{/* Tabs Variants */}
			<SectionRule title={t("pages.navigation.tabPatterns")}>
				<div className="space-y-basalt-space-lg">
					{/* Standard tabs */}
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.standardTabs")}
						</p>
						<Tabs defaultValue="overview">
							<TabsList>
								<TabsTrigger value="overview">{t("pages.navigation.overview")}</TabsTrigger>
								<TabsTrigger value="analytics">{t("pages.navigation.analytics")}</TabsTrigger>
								<TabsTrigger value="reports">{t("pages.navigation.reports")}</TabsTrigger>
								<TabsTrigger value="settings">{t("pages.navigation.settings")}</TabsTrigger>
							</TabsList>
							<TabsContent value="overview">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.overviewContent")}
									</p>
									<p className="text-basalt-sm text-muted-foreground mt-basalt-space-sm">
										{t("pages.navigation.overviewContentDesc")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="analytics">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.analyticsContent")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="reports">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.reportsContent")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="settings">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.settingsContent")}
									</p>
								</LayerCard>
							</TabsContent>
						</Tabs>
					</div>

					{/* Underline tabs */}
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.underlineStyle")}
						</p>
						<Tabs defaultValue="all">
							<TabsList>
								{underlineTabs.map((tab) => (
									<TabsTrigger key={tab.value} value={tab.value}>
										{tab.label}
									</TabsTrigger>
								))}
							</TabsList>
							<TabsContent value="all">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.showingAll")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="active">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.showingActive")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="archived">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.showingArchived")}
									</p>
								</LayerCard>
							</TabsContent>
							<TabsContent value="drafts">
								<LayerCard>
									<p className="text-basalt-base text-foreground">
										{t("pages.navigation.showingDrafts")}
									</p>
								</LayerCard>
							</TabsContent>
						</Tabs>
					</div>

					{/* Pill tabs */}
					<div>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg font-mono">
							{t("pages.navigation.pillStyle")}
						</p>
						<SegmentControl
							legend={t("pages.navigation.pillStyle")}
							options={pillTabs}
							value={period}
							onValueChange={setPeriod}
						/>
					</div>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
