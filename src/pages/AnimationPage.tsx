import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import { Button } from "@nocoo/basalt/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@nocoo/basalt/components/popover";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@nocoo/basalt/components/sheet";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { toast } from "@nocoo/basalt/components/toast";
import { useTranslation } from "react-i18next";
import { useAnimationShowcaseViewModel } from "@/viewmodels/useAnimationShowcaseViewModel";

export default function AnimationPage() {
	const { t } = useTranslation();
	const { paused, togglePaused } = useAnimationShowcaseViewModel();

	return (
		<div className="space-y-8">
			<PageHeader
				title={t("pages.animation.title")}
				description={t("pages.animation.description")}
				actions={
					<Button size="sm" variant="outline" onClick={togglePaused}>
						{paused ? t("pages.animation.play") : t("pages.animation.pause")}
					</Button>
				}
			/>

			<div
				data-motion={paused ? "paused" : "running"}
				className={paused ? "space-y-8 [&_*]:![animation:none]" : "space-y-8"}
			>
				<SectionRule
					title={t("pages.animation.continuous")}
					hint={t("pages.animation.continuousHint")}
				>
					<div className="grid gap-4 md:grid-cols-3">
						<LayerCard className="flex flex-col items-center gap-3">
							<Loader size={32} />
							<p className="text-xs text-basalt-muted-foreground">
								{t("pages.animation.loaderLabel")}
							</p>
						</LayerCard>
						<LayerCard className="space-y-3">
							<SkeletonLine minWidth={88} maxWidth={88} />
							<SkeletonLine minWidth={64} maxWidth={64} />
							<SkeletonLine minWidth={72} maxWidth={72} />
							<p className="text-xs text-basalt-muted-foreground">
								{t("pages.animation.shimmerLabel")}
							</p>
						</LayerCard>
						<LayerCard className="flex flex-col items-center justify-center gap-3">
							<Button loading>{t("pages.animation.buttonBusy")}</Button>
							<p className="text-xs text-basalt-muted-foreground">
								{t("pages.animation.buttonHint")}
							</p>
						</LayerCard>
					</div>
				</SectionRule>

				<SectionRule title={t("pages.animation.overlays")} hint={t("pages.animation.overlaysHint")}>
					<div className="flex flex-wrap gap-3">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline" size="sm">
									{t("pages.animation.openDialog")}
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>{t("pages.animation.dialogTitle")}</DialogTitle>
								<DialogDescription>{t("pages.animation.dialogBody")}</DialogDescription>
								<div className="mt-6 flex justify-end">
									<DialogClose asChild>
										<Button size="sm">{t("common.close")}</Button>
									</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
						<Sheet>
							<SheetTrigger asChild>
								<Button variant="outline" size="sm">
									{t("pages.animation.openSheet")}
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetTitle>{t("pages.animation.sheetTitle")}</SheetTitle>
								<SheetDescription>{t("pages.animation.sheetBody")}</SheetDescription>
								<div className="mt-6 flex justify-end">
									<SheetClose asChild>
										<Button size="sm" variant="outline">
											{t("common.close")}
										</Button>
									</SheetClose>
								</div>
							</SheetContent>
						</Sheet>
						<Popover>
							<PopoverTrigger asChild>
								<Button variant="outline" size="sm">
									{t("pages.animation.openPopover")}
								</Button>
							</PopoverTrigger>
							<PopoverContent>
								<PopoverTitle>{t("pages.animation.popoverTitle")}</PopoverTitle>
								<PopoverDescription>{t("pages.animation.popoverBody")}</PopoverDescription>
							</PopoverContent>
						</Popover>
						<Button
							size="sm"
							variant="secondary"
							onClick={() => toast.success(t("pages.animation.toastMessage"))}
						>
							{t("pages.animation.toast")}
						</Button>
					</div>
				</SectionRule>

				<SectionRule title={t("pages.animation.collapse")} hint={t("pages.animation.collapseHint")}>
					<div className="grid gap-4 lg:grid-cols-2">
						<LayerCard>
							<Accordion type="single" collapsible defaultValue="one">
								<AccordionItem value="one">
									<AccordionTrigger>{t("pages.animation.accordionOne")}</AccordionTrigger>
									<AccordionContent>{t("pages.animation.accordionOneBody")}</AccordionContent>
								</AccordionItem>
								<AccordionItem value="two">
									<AccordionTrigger>{t("pages.animation.accordionTwo")}</AccordionTrigger>
									<AccordionContent>{t("pages.animation.accordionTwoBody")}</AccordionContent>
								</AccordionItem>
							</Accordion>
						</LayerCard>
						<LayerCard className="space-y-4">
							<Collapsible defaultOpen>
								<CollapsibleTrigger>{t("pages.animation.collapsible")}</CollapsibleTrigger>
								<CollapsibleContent>
									<p className="text-sm text-basalt-muted-foreground">
										{t("pages.animation.collapsibleBody")}
									</p>
								</CollapsibleContent>
							</Collapsible>
							<Tabs defaultValue="overview">
								<TabsList>
									<TabsTrigger value="overview">{t("pages.animation.tabOverview")}</TabsTrigger>
									<TabsTrigger value="activity">{t("pages.animation.tabActivity")}</TabsTrigger>
								</TabsList>
								<TabsContent value="overview">
									<p className="pt-3 text-sm text-basalt-muted-foreground">
										{t("pages.animation.tabOverviewBody")}
									</p>
								</TabsContent>
								<TabsContent value="activity">
									<p className="pt-3 text-sm text-basalt-muted-foreground">
										{t("pages.animation.tabActivityBody")}
									</p>
								</TabsContent>
							</Tabs>
						</LayerCard>
					</div>
				</SectionRule>
			</div>

			<SectionRule title={t("pages.animation.reduced")} hint={t("pages.animation.reducedHint")}>
				<LayerCard>
					<p className="text-sm text-basalt-muted-foreground">{t("pages.animation.reducedCopy")}</p>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
