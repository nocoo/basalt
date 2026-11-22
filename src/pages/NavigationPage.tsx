import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import { TablePager } from "@nocoo/basalt/components/table-pager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { CheckCircle2, FileText, FolderOpen, Home } from "lucide-react";
import { useState } from "react";
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
									? "bg-basalt-primary text-basalt-primary-foreground"
									: i === current
										? "border-2 border-basalt-primary text-basalt-link"
										: "border border-basalt-border text-basalt-muted-foreground"
							}`}
						>
							{i < current ? <CheckCircle2 className="size-basalt-icon-lg" /> : i + 1}
						</div>
						<div className="hidden sm:block">
							<p
								className={`text-basalt-sm font-medium ${i <= current ? "text-basalt-foreground" : "text-basalt-muted-foreground"}`}
							>
								{step}
							</p>
						</div>
					</div>
					{i < steps.length - 1 && (
						<div
							className={`mx-basalt-space-sm h-px w-2 sm:mx-basalt-space-lg sm:w-12 ${i < current ? "bg-basalt-primary" : "bg-basalt-border"}`}
						/>
					)}
				</div>
			))}
		</div>
	);
}

export default function NavigationPage() {
	const [period, setPeriod] = useState("day");
	const [page1, setPage1] = useState(1);
	const [page2, setPage2] = useState(5);
	const [stepperIndex, setStepperIndex] = useState(1);

	const stepperSteps = ["Account", "Profile", "Preferences", "Review", "Complete"];

	const underlineTabs = [
		{ label: "All", value: "all" },
		{ label: "Active", value: "active" },
		{ label: "Archived", value: "archived" },
		{ label: "Drafts", value: "drafts" },
	];

	const pillTabs = [
		{ label: "Day", value: "day" },
		{ label: "Week", value: "week" },
		{ label: "Month", value: "month" },
		{ label: "Year", value: "year" },
	];

	return (
		<ShowcasePage
			title="Navigation and wayfinding"
			description="Breadcrumbs, pagination, steppers, and tab patterns for guiding users through hierarchies and multi-step flows."
		>
			<SectionRule title="Breadcrumbs">
				<div className="space-y-basalt-card">
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">simple</p>
						<Breadcrumbs
							className="flex-wrap gap-y-basalt-space-lg"
							items={[
								{ label: "Home" },
								{ label: "Products" },
								{ label: "Electronics" },
								{ label: "Headphones" },
							]}
						/>
					</LayerCard>
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">with icons</p>
						<Breadcrumbs
							className="flex-wrap gap-y-basalt-space-lg"
							items={[
								{
									label: "Home",
									icon: <Home className="size-basalt-icon" />,
								},
								{
									label: "Documents",
									icon: <FolderOpen className="size-basalt-icon" />,
								},
								{
									label: "Reports",
									icon: <FolderOpen className="size-basalt-icon" />,
								},
								{
									label: "Q4 Summary.pdf",
									icon: <FileText className="size-basalt-icon" />,
								},
							]}
						/>
					</LayerCard>
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">inside a card</p>
						<div>
							<Breadcrumbs
								className="flex-wrap gap-y-basalt-space-lg"
								items={[{ label: "Dashboard" }, { label: "Settings" }, { label: "Notifications" }]}
							/>
							<p className="text-basalt-base text-basalt-foreground font-medium mt-basalt-card-sm">
								Notification Preferences
							</p>
							<p className="text-basalt-sm text-basalt-muted-foreground mt-basalt-space-sm">
								Choose how you want to be notified about updates.
							</p>
						</div>
					</LayerCard>
				</div>
			</SectionRule>

			{/* Pagination */}
			<SectionRule title="Pagination">
				<div className="space-y-basalt-card">
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">short (5 pages)</p>
						<TablePager page={page1} pageSize={10} totalCount={50} onPageChange={setPage1} />
					</LayerCard>
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">long (20 pages)</p>
						<TablePager page={page2} pageSize={10} totalCount={200} onPageChange={setPage2} />
					</LayerCard>
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">with context</p>
						<TablePager
							page={page2}
							pageSize={10}
							totalCount={200}
							onPageChange={setPage2}
							formatRange={({ start, end, totalCount }) => (
								<>
									Showing{" "}
									<span className="font-medium text-basalt-foreground">
										{start}-{end}
									</span>{" "}
									of <span className="font-medium text-basalt-foreground">{totalCount}</span>{" "}
									results
								</>
							)}
						/>
					</LayerCard>
				</div>
			</SectionRule>

			{/* Stepper / Wizard */}
			<SectionRule title="Stepper / Wizard">
				<div className="space-y-basalt-card">
					<LayerCard className="space-y-basalt-card">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">
							horizontal stepper
						</p>
						<Stepper steps={stepperSteps} current={stepperIndex} />
						<div className="flex items-center gap-basalt-space-lg mt-basalt-card-sm">
							<Button
								variant="outline"
								size="sm"
								disabled={stepperIndex === 0}
								onClick={() => setStepperIndex((i) => i - 1)}
							>
								Back
							</Button>
							<Button
								size="sm"
								disabled={stepperIndex === stepperSteps.length - 1}
								onClick={() => setStepperIndex((i) => i + 1)}
							>
								{stepperIndex === stepperSteps.length - 2 ? "Finish" : "Next"}
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="ml-auto"
								onClick={() => setStepperIndex(0)}
							>
								Reset
							</Button>
						</div>
					</LayerCard>

					{/* Vertical stepper */}
					<LayerCard className="space-y-basalt-card">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">
							vertical stepper
						</p>
						<div className="max-w-sm">
							{stepperSteps.map((step, i) => (
								<div key={step} className="flex gap-basalt-space-lg">
									<div className="flex flex-col items-center">
										<div
											className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-basalt-full text-basalt-sm font-medium ${
												i < stepperIndex
													? "bg-basalt-primary text-basalt-primary-foreground"
													: i === stepperIndex
														? "border-2 border-basalt-primary text-basalt-link"
														: "border border-basalt-border text-basalt-muted-foreground"
											}`}
										>
											{i < stepperIndex ? <CheckCircle2 className="size-basalt-icon" /> : i + 1}
										</div>
										{i < stepperSteps.length - 1 && (
											<div
												className={`w-px flex-1 min-h-[1.5rem] ${i < stepperIndex ? "bg-basalt-primary" : "bg-basalt-border"}`}
											/>
										)}
									</div>
									<div className="pb-basalt-card">
										<p
											className={`text-basalt-base font-medium ${i <= stepperIndex ? "text-basalt-foreground" : "text-basalt-muted-foreground"}`}
										>
											{step}
										</p>
										<p className="text-basalt-sm text-basalt-muted-foreground">
											{i < stepperIndex
												? "Completed"
												: i === stepperIndex
													? "In progress"
													: "Pending"}
										</p>
									</div>
								</div>
							))}
						</div>
					</LayerCard>
				</div>
			</SectionRule>

			{/* Tabs Variants */}
			<SectionRule title="Tab Patterns">
				<div className="space-y-basalt-card">
					{/* Standard tabs */}
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">standard tabs</p>
						<Tabs defaultValue="overview">
							<TabsList>
								<TabsTrigger value="overview">Overview</TabsTrigger>
								<TabsTrigger value="analytics">Analytics</TabsTrigger>
								<TabsTrigger value="reports">Reports</TabsTrigger>
								<TabsTrigger value="settings">Settings</TabsTrigger>
							</TabsList>
							<TabsContent value="overview">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Overview content area</p>
									<p className="text-basalt-sm text-basalt-muted-foreground mt-basalt-space-sm">
										Tab panels hold the content for each section.
									</p>
								</div>
							</TabsContent>
							<TabsContent value="analytics">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Analytics content area</p>
								</div>
							</TabsContent>
							<TabsContent value="reports">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Reports content area</p>
								</div>
							</TabsContent>
							<TabsContent value="settings">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Settings content area</p>
								</div>
							</TabsContent>
						</Tabs>
					</LayerCard>

					{/* Underline tabs */}
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">underline style</p>
						<Tabs defaultValue="all">
							<TabsList>
								{underlineTabs.map((tab) => (
									<TabsTrigger key={tab.value} value={tab.value}>
										{tab.label}
									</TabsTrigger>
								))}
							</TabsList>
							<TabsContent value="all">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Showing all items</p>
								</div>
							</TabsContent>
							<TabsContent value="active">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Showing active items</p>
								</div>
							</TabsContent>
							<TabsContent value="archived">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Showing archived items</p>
								</div>
							</TabsContent>
							<TabsContent value="drafts">
								<div className="pt-basalt-card-sm">
									<p className="text-basalt-base text-basalt-foreground">Showing draft items</p>
								</div>
							</TabsContent>
						</Tabs>
					</LayerCard>

					{/* Pill tabs */}
					<LayerCard className="space-y-basalt-space-sm">
						<p className="text-basalt-sm text-basalt-muted-foreground font-mono">pill style</p>
						<SegmentControl
							legend="pill style"
							options={pillTabs}
							value={period}
							onValueChange={setPeriod}
						/>
					</LayerCard>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
