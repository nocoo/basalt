import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import { Button } from "@nocoo/basalt/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Combobox } from "@nocoo/basalt/components/combobox";
import {
	ContextMenu,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "@nocoo/basalt/components/context-menu";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	type DialogSize,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@nocoo/basalt/components/hover-card";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@nocoo/basalt/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@nocoo/basalt/components/sheet";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import { provenanceFromLegacy } from "../../catalog-source";
import { CONFIRM_DIALOG_EXAMPLES } from "../../examples/confirm-dialog";
import { TOOLTIP_EXAMPLES } from "../../examples/tooltip";
import { API as confirmDialogApi } from "../../generated/catalog-api/confirm-dialog";
import { API as tooltipApi } from "../../generated/catalog-api/tooltip";

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

function Preview({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>;
}

const EXTRA_PROVENANCE = provenanceFromLegacy({
	repo: "pew",
	sha: "97a890fabe6e",
	file: "packages/web/src/components",
});

const DIALOG_LOREM =
	"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function DialogCloseButton() {
	return (
		<DialogClose asChild>
			<Button variant="outline" size="icon" aria-label="Close">
				<X />
			</Button>
		</DialogClose>
	);
}

function DialogHeaderRow({ title }: { title: string }) {
	return (
		<div className="mb-4 flex items-start justify-between gap-4">
			<DialogTitle>{title}</DialogTitle>
			<DialogCloseButton />
		</div>
	);
}

function DialogFooter({
	cancel = "Cancel",
	action = "Delete",
	actionVariant = "destructive",
}: {
	cancel?: string;
	action?: string;
	actionVariant?: "default" | "destructive";
}) {
	return (
		<div className="mt-8 flex justify-end gap-2">
			<DialogClose asChild>
				<Button variant="outline">{cancel}</Button>
			</DialogClose>
			<DialogClose asChild>
				<Button variant={actionVariant}>{action}</Button>
			</DialogClose>
		</div>
	);
}

function DialogSizesExample() {
	const sizes: { size: DialogSize; label: string; width: string }[] = [
		{ size: "sm", label: "Small", width: "288px" },
		{ size: "base", label: "Base", width: "384px" },
		{ size: "lg", label: "Large", width: "512px" },
		{ size: "xl", label: "Extra Large", width: "768px" },
	];
	return (
		<Preview>
			{sizes.map(({ size, label, width }) => (
				<Dialog key={size}>
					<DialogTrigger asChild>
						<Button variant="outline">
							{label} ({width})
						</Button>
					</DialogTrigger>
					<DialogContent size={size}>
						<DialogHeaderRow title={`${label} Dialog`} />
						<DialogDescription>
							This size="{size}" dialog stays {width} wide on desktop.
						</DialogDescription>
						<div className="mt-4 overflow-auto rounded-basalt-md ring-1 ring-basalt-border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Project</TableHead>
										<TableHead>Owner</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Updated</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>northwind-analytics</TableCell>
										<TableCell>Ada Lovelace</TableCell>
										<TableCell>On track</TableCell>
										<TableCell>Mon</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
						<div className="mt-6 flex justify-end">
							<DialogClose asChild>
								<Button variant="outline">Close</Button>
							</DialogClose>
						</div>
					</DialogContent>
				</Dialog>
			))}
		</Preview>
	);
}

export default catalogContentFamily({
	tooltip: {
		docs: {
			description: "Short contextual help on hover or focus.",
			usage: usage(
				"Tooltip, TooltipTrigger, TooltipContent, TooltipProvider",
				"@nocoo/basalt/components/tooltip",
				"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
				'import { Button } from "@nocoo/basalt/components/button";',
			),
			variants: [],
			api: tooltipApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/tooltip.tsx",
			}),
		},
		examples: TOOLTIP_EXAMPLES,
	},
	accordion: {
		docs: {
			description: "Expandable sections.",
			usage: usage("Accordion", "@nocoo/basalt/components/accordion", "<Accordion />"),
			variants: [],
			api: [
				{
					name: "Accordion",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("accordion", "default"),
				title: "Default",
				code: `import { Accordion } from "@nocoo/basalt/components/accordion";

export default function Example() {
	return <Accordion />;
}`,
				render: () => (
					<Accordion type="single" collapsible>
						<AccordionItem value="a">
							<AccordionTrigger>Item</AccordionTrigger>
							<AccordionContent>Body</AccordionContent>
						</AccordionItem>
					</Accordion>
				),
			},
		],
	},
	dialog: {
		docs: {
			description:
				"A window overlaid on the primary window, rendering the content underneath inert.",
			usage: `import { Button } from "@nocoo/basalt/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";

export default function Example() {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Delete</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogTitle>Delete Resource?</DialogTitle>
				<DialogDescription>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit.
				</DialogDescription>
				<div className="mt-8 flex justify-end gap-2">
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button variant="destructive">Delete</Button>
					</DialogClose>
				</div>
			</DialogContent>
		</Dialog>
	);
}`,
			variants: [],
			api: [
				{
					name: "Dialog",
					props: [
						{
							name: "size",
							type: '"sm" | "base" | "lg" | "xl"',
							default: '"base"',
							description: "Fixed desktop width. Overflowing content scrolls inside the panel.",
						},
						{
							name: "disablePointerDismissal",
							type: "boolean",
							default: "false",
							description: "When true, clicking outside does not close the dialog.",
						},
						{ name: "className", type: "string", description: "className" },
					],
				},
			],
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/dialog/dialog.tsx",
			}),
		},
		examples: [
			{
				id: catalogScenarioId("dialog", "basic-dialog"),
				title: "Basic Dialog",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Click me</Button>
  </DialogTrigger>
  <DialogContent>
    <div className="mb-4 flex items-start justify-between gap-4">
      <DialogTitle>Modal Title</DialogTitle>
      <DialogClose asChild>
        <Button variant="outline" size="icon" aria-label="Close"><X /></Button>
      </DialogClose>
    </div>
    <DialogDescription>${DIALOG_LOREM}</DialogDescription>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Click me</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeaderRow title="Modal Title" />
							<DialogDescription>{DIALOG_LOREM}</DialogDescription>
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "sizes"),
				title: "Sizes",
				code: `<>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Small (288px)</Button>
    </DialogTrigger>
    <DialogContent size="sm">
      <DialogTitle>Small Dialog</DialogTitle>
      <DialogDescription>This size="sm" dialog stays 288px wide on desktop.</DialogDescription>
    </DialogContent>
  </Dialog>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Base (384px)</Button>
    </DialogTrigger>
    <DialogContent size="base">
      <DialogTitle>Base Dialog</DialogTitle>
      <DialogDescription>This size="base" dialog stays 384px wide on desktop.</DialogDescription>
    </DialogContent>
  </Dialog>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Large (512px)</Button>
    </DialogTrigger>
    <DialogContent size="lg">
      <DialogTitle>Large Dialog</DialogTitle>
      <DialogDescription>This size="lg" dialog stays 512px wide on desktop.</DialogDescription>
    </DialogContent>
  </Dialog>
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">Extra Large (768px)</Button>
    </DialogTrigger>
    <DialogContent size="xl">
      <DialogTitle>Extra Large Dialog</DialogTitle>
      <DialogDescription>This size="xl" dialog stays 768px wide on desktop.</DialogDescription>
    </DialogContent>
  </Dialog>
</>`,
				render: () => <DialogSizesExample />,
			},
			{
				id: catalogScenarioId("dialog", "alert-dialog"),
				title: "Alert Dialog",
				code: `<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Delete Account?</AlertDialogTitle>
    <AlertDialogDescription>
      This action cannot be undone. All your data will be permanently removed from our servers. Are you sure you want to proceed?
    </AlertDialogDescription>
    <AlertDialogCancel>Cancel</AlertDialogCancel>
    <AlertDialogAction>Delete Account</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>`,
				render: () => (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">Delete Account</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-basalt-destructive/20">
									<AlertTriangle className="size-5 text-basalt-destructive" />
								</div>
								<AlertDialogTitle className="text-xl">Delete Account?</AlertDialogTitle>
							</div>
							<AlertDialogDescription>
								This action cannot be undone. All your data will be permanently removed from our
								servers. Are you sure you want to proceed?
							</AlertDialogDescription>
							<div className="mt-8 flex justify-end gap-2">
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction>Delete Account</AlertDialogAction>
							</div>
						</AlertDialogContent>
					</AlertDialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "confirmation-dialog"),
				title: "Confirmation Dialog",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Project</Button>
  </DialogTrigger>
  <DialogContent disablePointerDismissal>
    <DialogTitle>Delete Project?</DialogTitle>
    <DialogDescription>
      This action cannot be undone. This will permanently delete the project and all associated data.
    </DialogDescription>
    <div className="mt-8 flex justify-end gap-2">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button variant="destructive">Delete</Button></DialogClose>
    </div>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="destructive">Delete Project</Button>
						</DialogTrigger>
						<DialogContent disablePointerDismissal>
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-basalt-destructive/20">
									<AlertTriangle className="size-5 text-basalt-destructive" />
								</div>
								<DialogTitle className="text-xl">Delete Project?</DialogTitle>
							</div>
							<DialogDescription>
								This action cannot be undone. This will permanently delete the project and all
								associated data.
							</DialogDescription>
							<DialogFooter action="Delete" />
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "with-actions"),
				title: "With Actions",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Delete</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Delete Resource?</DialogTitle>
    <DialogDescription>${DIALOG_LOREM}</DialogDescription>
    <div className="mt-8 flex justify-end gap-2">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <DialogClose asChild><Button variant="destructive">Delete</Button></DialogClose>
    </div>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Delete</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeaderRow title="Delete Resource?" />
							<DialogDescription>{DIALOG_LOREM}</DialogDescription>
							<DialogFooter />
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "custom-max-width"),
				title: "Custom Max Width",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open capped dialog</Button>
  </DialogTrigger>
  <DialogContent size="xl" className="max-w-lg">
    <DialogTitle>Max width override</DialogTitle>
    <DialogDescription>
      This dialog uses className="max-w-lg" and stays capped around 512px on desktop.
    </DialogDescription>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open capped dialog</Button>
						</DialogTrigger>
						<DialogContent size="xl" className="max-w-lg">
							<DialogHeaderRow title="Max width override" />
							<DialogDescription>
								This dialog uses className="max-w-lg" and stays capped around 512px on desktop.
							</DialogDescription>
							<div className="mt-4 truncate rounded-basalt-md bg-basalt-secondary p-3 font-mono text-sm ring-1 ring-basalt-border">
								abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
							</div>
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "with-select"),
				title: "With Select",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Form</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Create Resource</DialogTitle>
    <DialogDescription>Select a region for your new resource.</DialogDescription>
    <Select>
      <SelectTrigger aria-label="Region">
        <SelectValue placeholder="Select region..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="us-east">US East</SelectItem>
        <SelectItem value="us-west">US West</SelectItem>
        <SelectItem value="eu-west">EU West</SelectItem>
      </SelectContent>
    </Select>
    <div className="mt-8 flex justify-end gap-2">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Create</Button>
    </div>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open Form</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeaderRow title="Create Resource" />
							<DialogDescription className="mb-4">
								Select a region for your new resource.
							</DialogDescription>
							<Select>
								<SelectTrigger aria-label="Region">
									<SelectValue placeholder="Select region..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="us-east">US East</SelectItem>
									<SelectItem value="us-west">US West</SelectItem>
									<SelectItem value="eu-west">EU West</SelectItem>
								</SelectContent>
							</Select>
							<div className="mt-8 flex justify-end gap-2">
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button>Create</Button>
							</div>
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "with-combobox"),
				title: "With Combobox",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Form</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Create Resource</DialogTitle>
    <DialogDescription>Search and select a region for your new resource.</DialogDescription>
    <Combobox items={["US East", "US West", "EU West"]} placeholder="Search regions..." />
    <div className="mt-8 flex justify-end gap-2">
      <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
      <Button>Create</Button>
    </div>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open Form</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeaderRow title="Create Resource" />
							<DialogDescription className="mb-4">
								Search and select a region for your new resource.
							</DialogDescription>
							<Combobox items={["US East", "US West", "EU West"]} placeholder="Search regions..." />
							<div className="mt-8 flex justify-end gap-2">
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<Button>Create</Button>
							</div>
						</DialogContent>
					</Dialog>
				),
			},
			{
				id: catalogScenarioId("dialog", "with-dropdown"),
				title: "With Dropdown",
				code: `<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Form</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogTitle>Resource Actions</DialogTitle>
    <DialogDescription>Choose an action for the selected resource.</DialogDescription>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem>Duplicate</DropdownMenuItem>
        <DropdownMenuItem>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <div className="mt-8 flex justify-end">
      <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
    </div>
  </DialogContent>
</Dialog>`,
				render: () => (
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open Form</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeaderRow title="Resource Actions" />
							<DialogDescription className="mb-4">
								Choose an action for the selected resource.
							</DialogDescription>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button>Actions</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem>Edit</DropdownMenuItem>
									<DropdownMenuItem>Duplicate</DropdownMenuItem>
									<DropdownMenuItem>Delete</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
							<div className="mt-8 flex justify-end">
								<DialogClose asChild>
									<Button variant="outline">Close</Button>
								</DialogClose>
							</div>
						</DialogContent>
					</Dialog>
				),
			},
		],
	},
	"alert-dialog": {
		docs: {
			description: "Confirm destructive work. Not dismissible by clicking outside.",
			usage: usage("AlertDialog", "@nocoo/basalt/components/alert-dialog", "<AlertDialog />"),
			variants: [],
			api: [
				{
					name: "AlertDialog",
					props: [
						{
							name: "size",
							type: '"sm" | "base" | "lg" | "xl"',
							default: '"base"',
							description: "Fixed desktop width, shared with Dialog.",
						},
					],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("alert-dialog", "default"),
				title: "Default",
				code: `import { AlertDialog } from "@nocoo/basalt/components/alert-dialog";

export default function Example() {
	return <AlertDialog />;
}`,
				render: () => (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive">Delete Account</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<div className="mb-4 flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-basalt-destructive/20">
									<AlertTriangle className="size-5 text-basalt-destructive" />
								</div>
								<AlertDialogTitle className="text-xl">Delete Account?</AlertDialogTitle>
							</div>
							<AlertDialogDescription>
								This action cannot be undone. All your data will be permanently removed from our
								servers.
							</AlertDialogDescription>
							<div className="mt-8 flex justify-end gap-2">
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction>Delete Account</AlertDialogAction>
							</div>
						</AlertDialogContent>
					</AlertDialog>
				),
			},
		],
	},
	popover: {
		docs: {
			description: "Floating panel with a title, description, and arrow.",
			usage: `import { Button } from "@nocoo/basalt/components/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@nocoo/basalt/components/popover";

export default function Example() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline">Open Popover</Button>
			</PopoverTrigger>
			<PopoverContent>
				<PopoverTitle>Popover Title</PopoverTitle>
				<PopoverDescription>This is a popover.</PopoverDescription>
			</PopoverContent>
		</Popover>
	);
}`,
			variants: [],
			api: [
				{
					name: "Popover",
					props: [
						{
							name: "side",
							type: '"top" | "bottom" | "left" | "right"',
							default: '"bottom"',
							description: "Which side of the trigger the popover appears on.",
						},
					],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("popover", "basic-popover"),
				title: "Basic Popover",
				code: `<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">Open Popover</Button>
  </PopoverTrigger>
  <PopoverContent>
    <PopoverTitle>Popover Title</PopoverTitle>
    <PopoverDescription>This is a popover.</PopoverDescription>
  </PopoverContent>
</Popover>`,
				render: () => (
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline">Open Popover</Button>
						</PopoverTrigger>
						<PopoverContent>
							<PopoverTitle>Popover Title</PopoverTitle>
							<PopoverDescription>This is a popover.</PopoverDescription>
						</PopoverContent>
					</Popover>
				),
			},
			{
				id: catalogScenarioId("popover", "sides"),
				title: "Sides",
				code: `<>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Bottom</Button>
    </PopoverTrigger>
    <PopoverContent side="bottom">
      <PopoverTitle>Bottom</PopoverTitle>
      <PopoverDescription>Popover on bottom.</PopoverDescription>
    </PopoverContent>
  </Popover>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Top</Button>
    </PopoverTrigger>
    <PopoverContent side="top">
      <PopoverTitle>Top</PopoverTitle>
      <PopoverDescription>Popover on top.</PopoverDescription>
    </PopoverContent>
  </Popover>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Left</Button>
    </PopoverTrigger>
    <PopoverContent side="left">
      <PopoverTitle>Left</PopoverTitle>
      <PopoverDescription>Popover on left.</PopoverDescription>
    </PopoverContent>
  </Popover>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">Right</Button>
    </PopoverTrigger>
    <PopoverContent side="right">
      <PopoverTitle>Right</PopoverTitle>
      <PopoverDescription>Popover on right.</PopoverDescription>
    </PopoverContent>
  </Popover>
</>`,
				render: () => (
					<div className="flex flex-wrap items-center justify-center gap-4 py-16">
						{(["bottom", "top", "left", "right"] as const).map((side) => (
							<Popover key={side}>
								<PopoverTrigger asChild>
									<Button variant="outline">{side[0].toUpperCase() + side.slice(1)}</Button>
								</PopoverTrigger>
								<PopoverContent side={side}>
									<PopoverTitle>{side[0].toUpperCase() + side.slice(1)}</PopoverTitle>
									<PopoverDescription>Popover on {side}.</PopoverDescription>
								</PopoverContent>
							</Popover>
						))}
					</div>
				),
			},
		],
	},
	"dropdown-menu": {
		docs: {
			description: "Action menu.",
			usage: `import { Button } from "@nocoo/basalt/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";

export default function Example() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem>Copy</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}`,
			variants: [],
			api: [
				{
					name: "DropdownMenu",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("dropdown-menu", "basic-dropdown"),
				title: "Basic Dropdown",
				code: `<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Copy</DropdownMenuItem>
    <DropdownMenuItem>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
				render: () => (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline">Open</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuItem>Copy</DropdownMenuItem>
							<DropdownMenuItem>Delete</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				),
			},
		],
	},
	"context-menu": {
		docs: {
			description: "Right-click menu.",
			usage: usage("ContextMenu", "@nocoo/basalt/components/context-menu", "<ContextMenu />"),
			variants: [],
			api: [
				{
					name: "ContextMenu",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("context-menu", "default"),
				title: "Default",
				code: `import { ContextMenu } from "@nocoo/basalt/components/context-menu";

export default function Example() {
	return <ContextMenu />;
}`,
				render: () => (
					<ContextMenu>
						<ContextMenuTrigger asChild>
							<Button variant="outline">Right click</Button>
						</ContextMenuTrigger>
						<ContextMenuPanel>
							<ContextMenuItem>Copy</ContextMenuItem>
						</ContextMenuPanel>
					</ContextMenu>
				),
			},
		],
	},
	"hover-card": {
		docs: {
			description: "Preview on hover.",
			usage: usage("HoverCard", "@nocoo/basalt/components/hover-card", "<HoverCard />"),
			variants: [],
			api: [
				{
					name: "HoverCard",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("hover-card", "default"),
				title: "Default",
				code: `import { HoverCard } from "@nocoo/basalt/components/hover-card";

export default function Example() {
	return <HoverCard />;
}`,
				render: () => (
					<HoverCard>
						<HoverCardTrigger asChild>
							<Button variant="outline">Hover</Button>
						</HoverCardTrigger>
						<HoverCardContent>Preview</HoverCardContent>
					</HoverCard>
				),
			},
		],
	},
	sheet: {
		docs: {
			description: "Side panel.",
			usage: usage(
				"Sheet",
				"@nocoo/basalt/components/sheet",
				'<Sheet><SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger></Sheet>',
			),
			variants: [],
			api: [
				{
					name: "Sheet",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("sheet", "default"),
				title: "Default",
				code: `import { Sheet } from "@nocoo/basalt/components/sheet";

export default function Example() {
	return <Sheet><SheetTrigger asChild><Button variant="outline">Open</Button></SheetTrigger></Sheet>;
}`,
				render: () => (
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline">Open</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetTitle>Panel</SheetTitle>
						</SheetContent>
					</Sheet>
				),
			},
		],
	},
	collapsible: {
		docs: {
			description: "A composable disclosure for showing and hiding content.",
			usage: `import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";

export default function Example() {
	return (
		<Collapsible>
			<CollapsibleTrigger>How does this project work?</CollapsibleTrigger>
			<CollapsibleContent>This project is a React component library.</CollapsibleContent>
		</Collapsible>
	);
}`,
			variants: [],
			api: [
				{
					name: "Collapsible",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("collapsible", "with-default-styling"),
				title: "With Default Styling",
				code: "<Collapsible><CollapsibleTrigger>How does this project work?</CollapsibleTrigger><CollapsibleContent>This project is a React component library.</CollapsibleContent></Collapsible>",
				render: () => (
					<Collapsible>
						<CollapsibleTrigger>How does this project work?</CollapsibleTrigger>
						<CollapsibleContent>This project is a React component library.</CollapsibleContent>
					</Collapsible>
				),
			},
			{
				id: catalogScenarioId("collapsible", "custom-trigger"),
				title: "Custom Trigger",
				code: `<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="outline" size="sm">Show details</Button>
  </CollapsibleTrigger>
  <CollapsibleContent>Expanded copy.</CollapsibleContent>
</Collapsible>`,
				render: () => (
					<Collapsible>
						<CollapsibleTrigger asChild>
							<Button variant="outline" size="sm">
								Show details
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>Expanded copy.</CollapsibleContent>
					</Collapsible>
				),
			},
		],
	},
	"confirm-dialog": {
		docs: {
			description:
				"A controlled confirmation dialog with explicit loading and a Promise-based hook.",
			usage: usage(
				"ConfirmDialog",
				"@nocoo/basalt/components/confirm-dialog",
				'<ConfirmDialog open={open} title="Delete project?" description="This cannot be undone." onOpenChange={setOpen} onConfirm={onConfirm} />',
			),
			variants: ["default", "destructive"],
			api: confirmDialogApi,
			provenance: provenanceFromLegacy({
				repo: "meowth",
				sha: "bb02d5a18e00",
				file: "apps/dashboard/src/components/ui/confirm-dialog.tsx",
			}),
		},
		examples: CONFIRM_DIALOG_EXAMPLES,
	},
});
