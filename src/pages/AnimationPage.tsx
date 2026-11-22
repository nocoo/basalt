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
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { toast } from "@nocoo/basalt/components/toast";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useAnimationShowcaseViewModel } from "@/viewmodels/useAnimationShowcaseViewModel";

export default function AnimationPage() {
	const { paused, togglePaused } = useAnimationShowcaseViewModel();

	return (
		<ShowcasePage
			title="Animation"
			description="Overlay, collapse, tab and continuous motion from the library. Pause to inspect the resting frame."
			actions={
				<Button variant="outline" onClick={togglePaused}>
					{paused ? "Play motion" : "Pause motion"}
				</Button>
			}
		>
			<div
				data-motion={paused ? "paused" : "running"}
				className={
					paused ? "space-y-basalt-layout-lg [&_*]:![animation:none]" : "space-y-basalt-layout-lg"
				}
			>
				<SectionRule
					title="Continuous"
					hint="Loader spin, skeleton shimmer and button busy share motion-reduce:animate-none."
				>
					<div className="grid gap-basalt-layout md:grid-cols-3">
						<LayerCard className="flex flex-col items-center gap-basalt-card-sm">
							<Loader size={32} />
							<p className="text-basalt-sm text-basalt-muted-foreground">Loader</p>
						</LayerCard>
						<LayerCard className="space-y-basalt-card-sm">
							<Skeleton width="88%" />
							<Skeleton width="64%" />
							<Skeleton width="72%" />
							<p className="text-basalt-sm text-basalt-muted-foreground">Shimmer</p>
						</LayerCard>
						<LayerCard className="flex flex-col items-center justify-center gap-basalt-card-sm">
							<Button loading>Saving</Button>
							<p className="text-basalt-sm text-basalt-muted-foreground">Button loading</p>
						</LayerCard>
					</div>
				</SectionRule>

				<SectionRule
					title="Overlays"
					hint="Dialog, sheet, popover and toast enter and leave with overlay tokens."
				>
					<LayerCard>
						<div className="flex flex-wrap gap-basalt-space-lg">
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="outline">Open dialog</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogTitle>Motion dialog</DialogTitle>
									<DialogDescription>
										Overlay fade and dialog scale use the library tokens.
									</DialogDescription>
									<div className="mt-basalt-card flex justify-end">
										<DialogClose asChild>
											<Button>Close</Button>
										</DialogClose>
									</div>
								</DialogContent>
							</Dialog>
							<Sheet>
								<SheetTrigger asChild>
									<Button variant="outline">Open sheet</Button>
								</SheetTrigger>
								<SheetContent>
									<SheetTitle>Motion sheet</SheetTitle>
									<SheetDescription>Sheets slide in from the edge.</SheetDescription>
									<div className="mt-basalt-card flex justify-end">
										<SheetClose asChild>
											<Button variant="outline">Close</Button>
										</SheetClose>
									</div>
								</SheetContent>
							</Sheet>
							<Popover>
								<PopoverTrigger asChild>
									<Button variant="outline">Open popover</Button>
								</PopoverTrigger>
								<PopoverContent>
									<PopoverTitle>Motion popover</PopoverTitle>
									<PopoverDescription>Popovers use the overlay in and out pair.</PopoverDescription>
								</PopoverContent>
							</Popover>
							<Button
								variant="secondary"
								onClick={() => toast.success("Saved with overlay motion.")}
							>
								Toast
							</Button>
						</div>
					</LayerCard>
				</SectionRule>

				<SectionRule
					title="Collapse"
					hint="Accordion and collapsible animate height. Tabs slide the indicator."
				>
					<div className="grid gap-basalt-layout lg:grid-cols-2">
						<LayerCard>
							<Accordion type="single" collapsible defaultValue="one">
								<AccordionItem value="one">
									<AccordionTrigger>First item</AccordionTrigger>
									<AccordionContent>Height animates open and closed.</AccordionContent>
								</AccordionItem>
								<AccordionItem value="two">
									<AccordionTrigger>Second item</AccordionTrigger>
									<AccordionContent>Items share the same motion.</AccordionContent>
								</AccordionItem>
							</Accordion>
						</LayerCard>
						<LayerCard className="space-y-basalt-card">
							<Collapsible defaultOpen>
								<CollapsibleTrigger>Details</CollapsibleTrigger>
								<CollapsibleContent>
									<p className="text-basalt-base text-basalt-muted-foreground">
										Extra context revealed with collapsible motion.
									</p>
								</CollapsibleContent>
							</Collapsible>
							<Tabs defaultValue="overview">
								<TabsList>
									<TabsTrigger value="overview">Overview</TabsTrigger>
									<TabsTrigger value="activity">Activity</TabsTrigger>
								</TabsList>
								<TabsContent value="overview">
									<p className="pt-basalt-card-sm text-basalt-base text-basalt-muted-foreground">
										Tab panels fade in.
									</p>
								</TabsContent>
								<TabsContent value="activity">
									<p className="pt-basalt-card-sm text-basalt-base text-basalt-muted-foreground">
										The underline tracks the active tab.
									</p>
								</TabsContent>
							</Tabs>
						</LayerCard>
					</div>
				</SectionRule>
			</div>

			<SectionRule
				title="Reduced motion"
				hint="prefers-reduced-motion already stops these animations in the library."
			>
				<LayerCard>
					<p className="text-basalt-base text-basalt-muted-foreground">
						The pause control on this page is a demo overlay. Real products should keep the
						operating-system setting; do not add a second motion preference.
					</p>
				</LayerCard>
			</SectionRule>
		</ShowcasePage>
	);
}
