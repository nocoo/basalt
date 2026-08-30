import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import { Autocomplete } from "@nocoo/basalt/components/autocomplete";
import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { CodeBlock, CodeHighlighted } from "@nocoo/basalt/components/code";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Combobox } from "@nocoo/basalt/components/combobox";
import {
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandPalette,
} from "@nocoo/basalt/components/command-palette";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
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
import { Empty } from "@nocoo/basalt/components/empty";
import { Field } from "@nocoo/basalt/components/field";
import { Flow, FlowNode } from "@nocoo/basalt/components/flow";
import { Grid, GridItem } from "@nocoo/basalt/components/grid";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { Pagination } from "@nocoo/basalt/components/pagination";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@nocoo/basalt/components/popover";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { Separator } from "@nocoo/basalt/components/separator";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { Slider } from "@nocoo/basalt/components/slider";
import { Switch } from "@nocoo/basalt/components/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
import { Text } from "@nocoo/basalt/components/text";
import { toast } from "@nocoo/basalt/components/toast";
import { Toggle } from "@nocoo/basalt/components/toggle";
import { Toolbar } from "@nocoo/basalt/components/toolbar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import {
	AlertTriangle,
	Check,
	CircleAlert,
	CircleCheck,
	Inbox,
	Info,
	Plus,
	Search,
	X,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";

function Preview({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>;
}

function PaginationExample({
	page: initialPage = 1,
	pageCount = 10,
	simple = false,
}: {
	page?: number;
	pageCount?: number;
	simple?: boolean;
}) {
	const [page, setPage] = useState(initialPage);
	return <Pagination page={page} pageCount={pageCount} onPageChange={setPage} simple={simple} />;
}

function Stack({ children }: { children: ReactNode }) {
	return <div className="flex w-full flex-col gap-3">{children}</div>;
}

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

function CommandPaletteExample({ flat = false }: { flat?: boolean }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button variant="outline" onClick={() => setOpen(true)}>
				Search pages...
			</Button>
			<CommandPalette open={open} onOpenChange={setOpen}>
				<CommandInput placeholder="Search pages..." />
				<CommandList>
					<CommandEmpty>No results</CommandEmpty>
					{flat ? (
						<>
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</>
					) : (
						<CommandGroup heading="Pages">
							<CommandItem>Button</CommandItem>
							<CommandItem>Input</CommandItem>
						</CommandGroup>
					)}
				</CommandList>
			</CommandPalette>
		</>
	);
}

export const KUMO_EXAMPLES: Record<string, CatalogScenario[]> = {
	badge: [
		{
			id: catalogScenarioId("badge", "primary-badges"),
			title: "Primary Badges",
			code: "<Badge>Default</Badge>",
			render: () => <Badge>Default</Badge>,
		},
		{
			id: catalogScenarioId("badge", "other-color-variants"),
			title: "Other color variants",
			code: `<Badge variant="secondary">Secondary</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
			render: () => (
				<Preview>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="info">Info</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="error">Error</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "color-tokens"),
			title: "Color tokens",
			code: `<Badge variant="red">Red</Badge>
<Badge variant="orange">Orange</Badge>
<Badge variant="teal">Teal</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="purple">Purple</Badge>`,
			render: () => (
				<Preview>
					<Badge variant="red">Red</Badge>
					<Badge variant="orange">Orange</Badge>
					<Badge variant="teal">Teal</Badge>
					<Badge variant="blue">Blue</Badge>
					<Badge variant="purple">Purple</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "dot-badges"),
			title: "Dot badges",
			code: "<Badge dot>Live</Badge>",
			render: () => (
				<Preview>
					<Badge dot>Live</Badge>
					<Badge dot variant="success">
						Healthy
					</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "in-a-sentence"),
			title: "In a sentence",
			code: "<Text>Status is <Badge>Stable</Badge></Text>",
			render: () => (
				<Text>
					Status is <Badge>Stable</Badge>
				</Text>
			),
		},
		{
			id: catalogScenarioId("badge", "with-an-icon"),
			title: "With an icon",
			code: "<Badge><Check /> Verified</Badge>",
			render: () => (
				<Preview>
					<Badge>
						<Check className="size-3" /> Verified
					</Badge>
					<Badge variant="success">
						<Check className="size-3" /> Healthy
					</Badge>
					<Badge variant="warning">
						<AlertTriangle className="size-3" /> Warning
					</Badge>
					<Badge variant="error">
						<CircleAlert className="size-3" /> Error
					</Badge>
					<Badge variant="info">
						<Info className="size-3" /> Info
					</Badge>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("badge", "linked-badge"),
			title: "Linked badge",
			code: '<Link href="#"><Badge>Docs</Badge></Link>',
			render: () => (
				<Link href="#">
					<Badge>Docs</Badge>
				</Link>
			),
		},
	],
	breadcrumbs: [
		{
			id: catalogScenarioId("breadcrumbs", "basic"),
			title: "Basic",
			code: '<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
			render: () => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
		},
		{
			id: catalogScenarioId("breadcrumbs", "loading"),
			title: "Loading",
			code: "<Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />",
			render: () => <Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />,
		},
	],
	checkbox: [
		{
			id: catalogScenarioId("checkbox", "default"),
			title: "Default",
			code: '<Checkbox aria-label="Subscribe" />',
			render: () => <Checkbox aria-label="Unchecked" />,
		},
		{
			id: catalogScenarioId("checkbox", "checked"),
			title: "Checked",
			code: '<Checkbox defaultChecked aria-label="Subscribe" />',
			render: () => <Checkbox defaultChecked aria-label="Checked" />,
		},
		{
			id: catalogScenarioId("checkbox", "indeterminate"),
			title: "Indeterminate",
			code: '<Checkbox checked="indeterminate" aria-label="Partial" />',
			render: () => <Checkbox checked="indeterminate" aria-label="Partial" />,
		},
		{
			id: catalogScenarioId("checkbox", "disabled"),
			title: "Disabled",
			code: "<Checkbox disabled />",
			render: () => (
				<Preview>
					<Checkbox disabled aria-label="Disabled off" />
					<Checkbox disabled defaultChecked aria-label="Disabled on" />
				</Preview>
			),
		},
		{
			id: catalogScenarioId("checkbox", "error"),
			title: "Error",
			code: '<Field label="Terms" htmlFor="terms" error="Required"><Checkbox id="terms" /></Field>',
			render: () => (
				<Field label="Terms" htmlFor="ex-terms" error="Required">
					<Checkbox id="ex-terms" aria-label="Terms" />
				</Field>
			),
		},
	],
	"clipboard-text": [
		{
			id: catalogScenarioId("clipboard-text", "short-text"),
			title: "Short Text",
			code: '<ClipboardText text="bun add @nocoo/basalt" />',
			render: () => <ClipboardText text="bun add @nocoo/basalt" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "api-key"),
			title: "API Key",
			code: '<ClipboardText text="sk-••••••••" copyText="sk-live-secret" />',
			render: () => <ClipboardText text="sk-••••••••" copyText="sk-live-secret" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "copy-alternate-text"),
			title: "Copy Alternate Text",
			code: '<ClipboardText text="Visible label" copyText="copied-value" />',
			render: () => <ClipboardText text="Visible label" copyText="copied-value" />,
		},
		{
			id: catalogScenarioId("clipboard-text", "long-text"),
			title: "Long Text",
			code: '<ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />',
			render: () => <ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />,
		},
	],
	empty: [
		{
			id: catalogScenarioId("empty", "basic"),
			title: "Basic",
			code: '<Empty title="No results" description="Try another query." />',
			render: () => <Empty title="No results" description="Try another query." />,
		},
		{
			id: catalogScenarioId("empty", "with-icon"),
			title: "With icon",
			code: '<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />',
			render: () => (
				<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />
			),
		},
	],
	loader: [
		{
			id: catalogScenarioId("loader", "default-size"),
			title: "Default Size",
			code: "<Loader />",
			render: () => <Loader />,
		},
		{
			id: catalogScenarioId("loader", "custom-size"),
			title: "Custom Size",
			code: "<Loader size={32} />",
			render: () => (
				<Preview>
					<Loader size={16} />
					<Loader size={24} />
					<Loader size={32} />
				</Preview>
			),
		},
	],
	meter: [
		{
			id: catalogScenarioId("meter", "basic-meter"),
			title: "Basic Meter",
			code: '<Meter value={40} label="Usage" />',
			render: () => <Meter value={40} label="Usage" />,
		},
		{
			id: catalogScenarioId("meter", "custom-value-display"),
			title: "Custom Value Display",
			code: '<Meter value={12} label="Storage" customValue="12 GB" />',
			render: () => <Meter value={12} label="Storage" customValue="12 GB" />,
		},
		{
			id: catalogScenarioId("meter", "hidden-value"),
			title: "Hidden Value",
			code: '<Meter value={72} label="Progress" hideValue />',
			render: () => <Meter value={72} label="Progress" hideValue />,
		},
		{
			id: catalogScenarioId("meter", "full-meter"),
			title: "Full Meter",
			code: '<Meter value={100} label="Complete" />',
			render: () => <Meter value={100} label="Complete" />,
		},
		{
			id: catalogScenarioId("meter", "low-value"),
			title: "Low Value",
			code: '<Meter value={8} label="Quota" />',
			render: () => <Meter value={8} label="Quota" />,
		},
	],
	pagination: [
		{
			id: catalogScenarioId("pagination", "full-controls-default"),
			title: "Full Controls (Default)",
			code: "<Pagination page={1} pageCount={10} onPageChange={setPage} />",
			render: () => <PaginationExample page={1} pageCount={10} />,
		},
		{
			id: catalogScenarioId("pagination", "simple-controls"),
			title: "Simple Controls",
			code: "<Pagination page={2} pageCount={10} simple onPageChange={setPage} />",
			render: () => <PaginationExample page={2} pageCount={10} simple />,
		},
		{
			id: catalogScenarioId("pagination", "mid-page-state"),
			title: "Mid-Page State",
			code: "<Pagination page={5} pageCount={12} onPageChange={setPage} />",
			render: () => <PaginationExample page={5} pageCount={12} />,
		},
	],
	switch: [
		{
			id: catalogScenarioId("switch", "off-state"),
			title: "Off State",
			code: '<Switch aria-label="Notifications" />',
			render: () => <Switch aria-label="Off" />,
		},
		{
			id: catalogScenarioId("switch", "on-state"),
			title: "On State",
			code: '<Switch defaultChecked aria-label="Notifications" />',
			render: () => <Switch defaultChecked aria-label="On" />,
		},
		{
			id: catalogScenarioId("switch", "disabled"),
			title: "Disabled",
			code: "<Switch disabled />",
			render: () => (
				<Preview>
					<Switch disabled aria-label="Disabled off" />
					<Switch disabled defaultChecked aria-label="Disabled on" />
				</Preview>
			),
		},
		{
			id: catalogScenarioId("switch", "sizes"),
			title: "Sizes",
			code: '<Switch size="sm" /><Switch />',
			render: () => (
				<Preview>
					<Switch size="sm" aria-label="Small" defaultChecked />
					<Switch aria-label="Default size" defaultChecked />
				</Preview>
			),
		},
	],
	input: [
		{
			id: catalogScenarioId("input", "with-label-and-description"),
			title: "With Label and Description",
			code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-input-email" hint="Never shared">
					<Input id="ex-input-email" placeholder="you@example.com" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("input", "with-error-string"),
			title: "With Error (String)",
			code: '<Field label="Email" htmlFor="email" error="Required"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-input-err" error="Required">
					<Input id="ex-input-err" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("input", "disabled"),
			title: "Disabled",
			code: "<Input disabled />",
			render: () => <Input disabled value="Read only" aria-label="Disabled input" />,
		},
		{
			id: catalogScenarioId("input", "input-types"),
			title: "Input Types",
			code: '<Input type="email" /><Input type="password" />',
			render: () => (
				<Stack>
					<Input type="email" placeholder="Email" aria-label="Email type" />
					<Input type="password" placeholder="Password" aria-label="Password type" />
					<Input type="search" placeholder="Search" aria-label="Search type" />
				</Stack>
			),
		},
		{
			id: catalogScenarioId("input", "bare-input-no-label"),
			title: "Bare Input (No Label)",
			code: '<Input aria-label="Name" placeholder="Jane Doe" />',
			render: () => <Input aria-label="Name" placeholder="Jane Doe" />,
		},
	],
	"input-area": [
		{
			id: catalogScenarioId("input-area", "with-label"),
			title: "With Label",
			code: '<Field label="Notes" htmlFor="notes"><InputArea id="notes" /></Field>',
			render: () => (
				<Field label="Notes" htmlFor="ex-notes">
					<InputArea id="ex-notes" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("input-area", "custom-row-count"),
			title: "Custom Row Count",
			code: "<InputArea rows={6} />",
			render: () => <InputArea rows={6} aria-label="Tall notes" />,
		},
		{
			id: catalogScenarioId("input-area", "error-state-string"),
			title: "Error State (String)",
			code: '<Field label="Bio" htmlFor="bio" error="Too short"><InputArea id="bio" /></Field>',
			render: () => (
				<Field label="Bio" htmlFor="ex-bio" error="Too short">
					<InputArea id="ex-bio" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("input-area", "disabled"),
			title: "Disabled",
			code: "<InputArea disabled />",
			render: () => <InputArea disabled aria-label="Disabled notes" value="Unavailable" />,
		},
	],
	"input-group": [
		{
			id: catalogScenarioId("input-group", "inline-suffix"),
			title: "Inline Suffix",
			code: `<InputGroup>
  <InputGroup.Input defaultValue="atlas" />
  <InputGroup.Suffix>.example.com</InputGroup.Suffix>
  <InputGroup.Addon align="end"><CircleCheck /></InputGroup.Addon>
</InputGroup>`,
			render: () => (
				<InputGroup className="max-w-sm">
					<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
					<InputGroup.Suffix>.example.com</InputGroup.Suffix>
					<InputGroup.Addon align="end">
						<CircleCheck className="text-basalt-heatmap-green-3" />
					</InputGroup.Addon>
				</InputGroup>
			),
		},
		{
			id: catalogScenarioId("input-group", "icon"),
			title: "Icon",
			code: `<InputGroup>
  <InputGroup.Addon><Search /></InputGroup.Addon>
  <InputGroup.Input placeholder="Search" />
</InputGroup>`,
			render: () => (
				<InputGroup className="max-w-sm">
					<InputGroup.Addon>
						<Search />
					</InputGroup.Addon>
					<InputGroup.Input aria-label="Search" placeholder="Search" />
				</InputGroup>
			),
		},
		{
			id: catalogScenarioId("input-group", "text"),
			title: "Text",
			code: `<InputGroup>
  <InputGroup.Addon>https://</InputGroup.Addon>
  <InputGroup.Input placeholder="example.com" />
</InputGroup>`,
			render: () => (
				<InputGroup className="max-w-sm">
					<InputGroup.Addon>https://</InputGroup.Addon>
					<InputGroup.Input aria-label="Host" placeholder="example.com" />
				</InputGroup>
			),
		},
		{
			id: catalogScenarioId("input-group", "button"),
			title: "Button",
			code: `<InputGroup>
  <InputGroup.Input placeholder="Search" />
  <InputGroup.Addon align="end">
    <InputGroup.Button icon={<Search />} aria-label="Search" />
  </InputGroup.Addon>
</InputGroup>`,
			render: () => (
				<InputGroup className="max-w-sm">
					<InputGroup.Input aria-label="Query" placeholder="Search" />
					<InputGroup.Addon align="end">
						<InputGroup.Button icon={<Search />} aria-label="Search" />
					</InputGroup.Addon>
				</InputGroup>
			),
		},
		{
			id: catalogScenarioId("input-group", "loading"),
			title: "Loading",
			code: `<InputGroup>
  <InputGroup.Input defaultValue="atlas" />
  <InputGroup.Addon align="end"><Loader /></InputGroup.Addon>
</InputGroup>`,
			render: () => (
				<InputGroup className="max-w-sm">
					<InputGroup.Input defaultValue="atlas" aria-label="Loading query" />
					<InputGroup.Addon align="end">
						<Loader size={16} />
					</InputGroup.Addon>
				</InputGroup>
			),
		},
	],
	label: [
		{
			id: catalogScenarioId("label", "default-label"),
			title: "Default Label",
			code: "<Label>Default Label</Label>",
			render: () => (
				<Stack>
					<Label>Default Label</Label>
				</Stack>
			),
		},
		{
			id: catalogScenarioId("label", "optional-field"),
			title: "Optional Field",
			code: "<Label showOptional>Optional Field</Label>",
			render: () => <Label showOptional>Optional Field</Label>,
		},
		{
			id: catalogScenarioId("label", "with-tooltip"),
			title: "With Tooltip",
			code: '<Label tooltip="More information about this field">With Tooltip</Label>',
			render: () => <Label tooltip="More information about this field">With Tooltip</Label>,
		},
	],
	text: [
		{
			id: catalogScenarioId("text", "sizes"),
			title: "Semantic HTML",
			code: "<Text>Body copy</Text>",
			render: () => (
				<Stack>
					<Text size="xl">Extra large</Text>
					<Text size="lg">Large</Text>
					<Text>Body copy</Text>
					<Text size="sm">Small</Text>
					<Text size="xs">Extra small</Text>
				</Stack>
			),
		},
		{
			id: catalogScenarioId("text", "muted-tone"),
			title: "Restrictions",
			code: '<Text tone="muted">Muted supporting copy.</Text>',
			render: () => <Text tone="muted">Muted supporting copy.</Text>,
		},
	],
	link: [
		{
			id: catalogScenarioId("link", "basic-link"),
			title: "Basic Link",
			code: '<Link href="#section">Inline link</Link>',
			render: () => (
				<LinkProvider>
					<Link href="#section">Inline link</Link>
				</LinkProvider>
			),
		},
		{
			id: catalogScenarioId("link", "inline-in-paragraph"),
			title: "Inline in Paragraph",
			code: "<Text>Read the <Link href='#docs'>docs</Link>.</Text>",
			render: () => (
				<LinkProvider>
					<Text>
						Read the <Link href="#docs">docs</Link>.
					</Text>
				</LinkProvider>
			),
		},
		{
			id: catalogScenarioId("link", "external-links"),
			title: "External Links",
			code: '<Link href="https://example.com">Example</Link>',
			render: () => (
				<LinkProvider>
					<Link href="https://example.com">Example</Link>
				</LinkProvider>
			),
		},
	],
	tooltip: [
		{
			id: catalogScenarioId("tooltip", "basic-tooltip"),
			title: "Basic Tooltip",
			code: "<Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip>",
			render: () => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button variant="outline">Hover</Button>
						</TooltipTrigger>
						<TooltipContent>Hint</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
		},
		{
			id: catalogScenarioId("tooltip", "multiple-tooltips"),
			title: "Multiple Tooltips",
			code: "<Tooltip>…</Tooltip><Tooltip>…</Tooltip>",
			render: () => (
				<TooltipProvider>
					<Preview>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline">One</Button>
							</TooltipTrigger>
							<TooltipContent>First</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="outline">Two</Button>
							</TooltipTrigger>
							<TooltipContent>Second</TooltipContent>
						</Tooltip>
					</Preview>
				</TooltipProvider>
			),
		},
	],
	"layer-card": [
		{
			id: catalogScenarioId("layer-card", "basic-card"),
			title: "Basic Card",
			code: "<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
			render: () => (
				<LayerCard className="w-[250px]">
					<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
					<LayerCard.Primary>Hello</LayerCard.Primary>
				</LayerCard>
			),
		},
		{
			id: catalogScenarioId("layer-card", "surface-style-card"),
			title: "Surface-style Card",
			code: "<LayerCard className='p-4'>Quick start guide</LayerCard>",
			render: () => <LayerCard className="w-[250px] p-4">Quick start guide</LayerCard>,
		},
		{
			id: catalogScenarioId("layer-card", "multiple-cards"),
			title: "Multiple Cards",
			code: "<LayerCard><LayerCard.Secondary>Components</LayerCard.Secondary><LayerCard.Primary>Browse</LayerCard.Primary></LayerCard>",
			render: () => (
				<div className="flex w-full gap-4">
					<LayerCard className="w-[200px]">
						<LayerCard.Secondary>Components</LayerCard.Secondary>
						<LayerCard.Primary>Browse all components</LayerCard.Primary>
					</LayerCard>
					<LayerCard className="w-[200px]">
						<LayerCard.Secondary>Examples</LayerCard.Secondary>
						<LayerCard.Primary>View code examples</LayerCard.Primary>
					</LayerCard>
				</div>
			),
		},
	],
	separator: [
		{
			id: catalogScenarioId("separator", "horizontal"),
			title: "Horizontal",
			code: "<Separator />",
			render: () => (
				<div className="w-full max-w-sm space-y-3">
					<Text>Above</Text>
					<Separator />
					<Text>Below</Text>
				</div>
			),
		},
	],
	"skeleton-line": [
		{
			id: catalogScenarioId("skeleton-line", "default"),
			title: "Default",
			code: "<SkeletonLine /><SkeletonLine /><SkeletonLine />",
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine minWidth={40} maxWidth={55} />
					<SkeletonLine minWidth={75} maxWidth={90} />
					<SkeletonLine minWidth={90} maxWidth={100} />
				</div>
			),
		},
		{
			id: catalogScenarioId("skeleton-line", "width"),
			title: "Width",
			code: "<SkeletonLine minWidth={80} maxWidth={100} />",
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine minWidth={80} maxWidth={100} />
					<SkeletonLine minWidth={60} maxWidth={80} />
					<SkeletonLine minWidth={40} maxWidth={60} />
				</div>
			),
		},
		{
			id: catalogScenarioId("skeleton-line", "height"),
			title: "Height",
			code: '<SkeletonLine className="h-2" />',
			render: () => (
				<div className="flex w-64 flex-col gap-3">
					<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
					<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />
				</div>
			),
		},
	],
	"sensitive-input": [
		{
			id: catalogScenarioId("sensitive-input", "default"),
			title: "Default",
			code: '<SensitiveInput revealLabel="Show" hideLabel="Hide" />',
			render: () => <SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />,
		},
		{
			id: catalogScenarioId("sensitive-input", "disabled"),
			title: "Disabled",
			code: "<SensitiveInput disabled />",
			render: () => (
				<SensitiveInput
					aria-label="Disabled password"
					disabled
					revealLabel="Show"
					hideLabel="Hide"
				/>
			),
		},
	],
	radio: [
		{
			id: catalogScenarioId("radio", "default-vertical"),
			title: "Default (Vertical)",
			code: '<RadioGroup defaultValue="a"><Radio value="a" /><Radio value="b" /></RadioGroup>',
			render: () => (
				<RadioGroup defaultValue="a" className="flex flex-col gap-2">
					<Label className="flex items-center gap-2">
						<Radio value="a" /> Alpha
					</Label>
					<Label className="flex items-center gap-2">
						<Radio value="b" /> Beta
					</Label>
				</RadioGroup>
			),
		},
		{
			id: catalogScenarioId("radio", "horizontal"),
			title: "Horizontal",
			code: '<RadioGroup className="flex gap-4">…</RadioGroup>',
			render: () => (
				<RadioGroup defaultValue="a" className="flex gap-4">
					<Label className="flex items-center gap-2">
						<Radio value="a" /> Alpha
					</Label>
					<Label className="flex items-center gap-2">
						<Radio value="b" /> Beta
					</Label>
				</RadioGroup>
			),
		},
		{
			id: catalogScenarioId("radio", "disabled"),
			title: "Disabled",
			code: "<Radio disabled />",
			render: () => (
				<RadioGroup defaultValue="a" className="flex gap-4">
					<Radio value="a" disabled aria-label="Disabled A" />
					<Radio value="b" disabled aria-label="Disabled B" />
				</RadioGroup>
			),
		},
	],
	select: [
		{
			id: catalogScenarioId("select", "basic"),
			title: "Basic",
			code: "<Select><SelectTrigger><SelectValue /></SelectTrigger></Select>",
			render: () => (
				<Select>
					<SelectTrigger aria-label="Version" className="w-48">
						<SelectValue placeholder="Select version" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1">v1</SelectItem>
						<SelectItem value="2">v2</SelectItem>
					</SelectContent>
				</Select>
			),
		},
		{
			id: catalogScenarioId("select", "placeholder"),
			title: "Placeholder",
			code: '<SelectValue placeholder="Choose…" />',
			render: () => (
				<Select>
					<SelectTrigger aria-label="Empty select" className="w-48">
						<SelectValue placeholder="Choose…" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="a">Alpha</SelectItem>
					</SelectContent>
				</Select>
			),
		},
		{
			id: catalogScenarioId("select", "disabled-options"),
			title: "Disabled Options",
			code: '<SelectItem value="b" disabled>Beta</SelectItem>',
			render: () => (
				<Select>
					<SelectTrigger aria-label="Disabled option" className="w-48">
						<SelectValue placeholder="Choose…" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="a">Alpha</SelectItem>
						<SelectItem value="b" disabled>
							Beta
						</SelectItem>
					</SelectContent>
				</Select>
			),
		},
	],
	combobox: [
		{
			id: catalogScenarioId("combobox", "searchable-select-with-placeholder"),
			title: "Searchable Select with Placeholder",
			code: '<Combobox items={["Apple", "Banana"]} placeholder="Select…" />',
			render: () => <Combobox items={["Apple", "Banana"]} placeholder="Select…" />,
		},
		{
			id: catalogScenarioId("combobox", "disabled"),
			title: "Disabled",
			code: '<Combobox disabled items={["Apple"]} />',
			render: () => <Combobox disabled items={["Apple"]} placeholder="Disabled" />,
		},
	],
	autocomplete: [
		{
			id: catalogScenarioId("autocomplete", "default"),
			title: "Default",
			code: '<Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />',
			render: () => <Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />,
		},
	],
	tabs: [
		{
			id: catalogScenarioId("tabs", "variants"),
			title: "Variants",
			code: "<Tabs defaultValue='a'><TabsList><TabsTrigger value='a'>Home</TabsTrigger></TabsList></Tabs>",
			render: () => (
				<Tabs defaultValue="a">
					<TabsList>
						<TabsTrigger value="a">Home</TabsTrigger>
						<TabsTrigger value="b">About</TabsTrigger>
					</TabsList>
					<TabsContent value="a">Home overview and getting started.</TabsContent>
					<TabsContent value="b">About this project and its goals.</TabsContent>
				</Tabs>
			),
		},
		{
			id: catalogScenarioId("tabs", "many-tabs"),
			title: "Many Tabs",
			code: "<TabsTrigger>…</TabsTrigger>",
			render: () => (
				<Tabs defaultValue="a">
					<TabsList>
						{["Overview", "Usage", "API", "Accessibility", "Changelog"].map((label) => (
							<TabsTrigger key={label} value={label.toLowerCase()}>
								{label}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>
			),
		},
	],
	toast: [
		{
			id: catalogScenarioId("toast", "title-only"),
			title: "Title Only",
			code: '<Button onClick={() => toast("Saved")}>Toast</Button>',
			render: () => <Button onClick={() => toast("Saved")}>Title only</Button>,
		},
		{
			id: catalogScenarioId("toast", "title-and-description"),
			title: "Title and Description",
			code: 'toast("Saved", { description: "Project updated." })',
			render: () => (
				<Button onClick={() => toast("Saved", { description: "Project updated." })}>
					With description
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "success-variant"),
			title: "Success Variant",
			code: "toast.success('Deployed')",
			render: () => <Button onClick={() => toast.success("Deployed")}>Success</Button>,
		},
		{
			id: catalogScenarioId("toast", "error-variant"),
			title: "Error Variant",
			code: "toast.error('Failed')",
			render: () => <Button onClick={() => toast.error("Failed")}>Error</Button>,
		},
		{
			id: catalogScenarioId("toast", "warning-variant"),
			title: "Warning Variant",
			code: "toast.warning('Expiring')",
			render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
		},
		{
			id: catalogScenarioId("toast", "info-variant"),
			title: "Info Variant",
			code: "toast.info('Queued')",
			render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
		},
		{
			id: catalogScenarioId("toast", "close-button"),
			title: "Close button",
			code: 'toast("Saved", { close: true })',
			render: () => (
				<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>
					With close
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "hidden-close"),
			title: "Hidden close",
			code: 'toast("Saved", { close: false })',
			render: () => (
				<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>
					No close
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "custom-icon"),
			title: "Custom icon",
			code: 'toast.success("Verified", { icon: <Check /> })',
			render: () => (
				<Button
					onClick={() =>
						toast.success("Verified", {
							icon: <Check className="size-4" />,
							description: "Custom icon passed as a parameter.",
						})
					}
				>
					Custom icon
				</Button>
			),
		},
		{
			id: catalogScenarioId("toast", "hidden-icon"),
			title: "Hidden icon",
			code: 'toast.success("Deployed", { icon: false })',
			render: () => (
				<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>
			),
		},
	],
	dialog: [
		{
			id: catalogScenarioId("dialog", "basic-dialog"),
			title: "Basic Dialog",
			code: `<Dialog>
  <DialogTrigger asChild>
    <Button>Click me</Button>
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
			code: '<DialogContent size="sm">…</DialogContent>\n<DialogContent size="base">…</DialogContent>\n<DialogContent size="lg">…</DialogContent>\n<DialogContent size="xl">…</DialogContent>',
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
    <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
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
    <DialogDescription>This action cannot be undone.</DialogDescription>
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
    <Button>Delete</Button>
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
			code: '<DialogContent size="xl" className="max-w-lg">…</DialogContent>',
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
			code: `<DialogContent>
  <DialogTitle>Create Resource</DialogTitle>
  <Select>
    <SelectTrigger aria-label="Region"><SelectValue placeholder="Select region..." /></SelectTrigger>
    <SelectContent><SelectItem value="us-east">US East</SelectItem></SelectContent>
  </Select>
</DialogContent>`,
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
			code: `<DialogContent>
  <DialogTitle>Create Resource</DialogTitle>
  <Combobox items={["US East", "US West", "EU West"]} placeholder="Search regions..." />
</DialogContent>`,
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
			code: `<DialogContent>
  <DialogTitle>Resource Actions</DialogTitle>
  <DropdownMenu>
    <DropdownMenuTrigger asChild><Button>Actions</Button></DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem>Edit</DropdownMenuItem>
      <DropdownMenuItem>Delete</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</DialogContent>`,
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
	popover: [
		{
			id: catalogScenarioId("popover", "basic-popover"),
			title: "Basic Popover",
			code: `<Popover>
  <PopoverTrigger asChild><Button>Open Popover</Button></PopoverTrigger>
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
			code: '<PopoverContent side="top">…</PopoverContent>',
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
	"dropdown-menu": [
		{
			id: catalogScenarioId("dropdown-menu", "basic-dropdown"),
			title: "Basic Dropdown",
			code: "<DropdownMenu><DropdownMenuTrigger asChild><Button>Open</Button></DropdownMenuTrigger><DropdownMenuContent><DropdownMenuItem>Item</DropdownMenuItem></DropdownMenuContent></DropdownMenu>",
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
	collapsible: [
		{
			id: catalogScenarioId("collapsible", "with-default-styling"),
			title: "With Default Styling",
			code: "<Collapsible><CollapsibleTrigger>How does this project work?</CollapsibleTrigger><CollapsibleContent>…</CollapsibleContent></Collapsible>",
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
			code: "<CollapsibleTrigger asChild><Button>Show details</Button></CollapsibleTrigger>",
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
	table: [
		{
			id: catalogScenarioId("table", "basic"),
			title: "Basic",
			code: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Report 1</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
			render: () => (
				<Table className="w-[200px]">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Report 1</TableCell>
							<TableCell>Active</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Report 2</TableCell>
							<TableCell>Paused</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Report 3</TableCell>
							<TableCell>Active</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
		{
			id: catalogScenarioId("table", "selected-row"),
			title: "Selected Row",
			code: '<TableRow variant="selected">…</TableRow>',
			render: () => (
				<Table className="w-[200px]">
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow variant="selected">
							<TableCell>Selected</TableCell>
						</TableRow>
						<TableRow>
							<TableCell>Idle</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
	],
	"table-of-contents": [
		{
			id: catalogScenarioId("table-of-contents", "options"),
			title: "Options",
			code: "<TableOfContents><TableOfContentsItem active>Intro</TableOfContentsItem></TableOfContents>",
			render: () => (
				<TableOfContents>
					<TableOfContentsItem active>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "no-active-item"),
			title: "No active item",
			code: "<TableOfContentsItem>Intro</TableOfContentsItem>",
			render: () => (
				<TableOfContents>
					<TableOfContentsItem>Intro</TableOfContentsItem>
					<TableOfContentsItem>Usage</TableOfContentsItem>
				</TableOfContents>
			),
		},
		{
			id: catalogScenarioId("table-of-contents", "without-title"),
			title: "Without title",
			code: '<TableOfContents title="">…</TableOfContents>',
			render: () => (
				<TableOfContents title="">
					<TableOfContentsItem active>Intro</TableOfContentsItem>
				</TableOfContents>
			),
		},
	],
	toolbar: [
		{
			id: catalogScenarioId("toolbar", "input-shorthand"),
			title: "Input Shorthand",
			code: '<Toolbar><Toolbar.Input placeholder="Search..." /><Toolbar.Button aria-label="Search" /><Toolbar.Button aria-label="Add" /></Toolbar>',
			render: () => (
				<Toolbar className="w-full max-w-md">
					<Toolbar.Input aria-label="Search records" placeholder="Search..." className="flex-1" />
					<Toolbar.Button icon={<Search />} aria-label="Search" />
					<Toolbar.Button icon={<Plus />} aria-label="Add" />
				</Toolbar>
			),
		},
		{
			id: catalogScenarioId("toolbar", "button-actions"),
			title: "Button Actions",
			code: "<Toolbar><Toolbar.Button>Upload</Toolbar.Button><Toolbar.Button>Download</Toolbar.Button></Toolbar>",
			render: () => (
				<Toolbar>
					<Toolbar.Button>Upload</Toolbar.Button>
					<Toolbar.Button>Download</Toolbar.Button>
				</Toolbar>
			),
		},
	],
	grid: [
		{
			id: catalogScenarioId("grid", "grid"),
			title: "Grid",
			code: `<Grid>
  <GridItem>1</GridItem>
  <GridItem>2</GridItem>
  <GridItem>3</GridItem>
  <GridItem>4</GridItem>
</Grid>`,
			render: () => (
				<Grid className="w-full max-w-sm">
					<GridItem>1</GridItem>
					<GridItem>2</GridItem>
					<GridItem>3</GridItem>
					<GridItem>4</GridItem>
				</Grid>
			),
		},
	],
	flow: [
		{
			id: catalogScenarioId("flow", "sequential-flow"),
			title: "Sequential Flow",
			code: "<Flow><FlowNode>Step 1</FlowNode><FlowNode>Step 2</FlowNode></Flow>",
			render: () => (
				<Flow>
					<FlowNode>Step 1</FlowNode>
					<FlowNode>Step 2</FlowNode>
				</Flow>
			),
		},
	],
	code: [
		{
			id: catalogScenarioId("code", "typescript"),
			title: "TypeScript",
			code: '<CodeHighlighted code="export async function fetchUser(id: string) { … }" />',
			render: () => (
				<CodeHighlighted
					code={`export async function fetchUser(id: string, retries = 3) {
  // Resolve a profile, then return a display name.
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: \`\${user.firstName} \${user.lastName}\`,
  };
}`}
				/>
			),
		},
		{
			id: catalogScenarioId("code", "react"),
			title: "React",
			code: '<CodeHighlighted code="export function Counter() { … }" />',
			render: () => (
				<CodeHighlighted
					code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}`}
				/>
			),
		},
	],
	"code-block": [
		{
			id: catalogScenarioId("code-block", "basic"),
			title: "Line Numbers",
			code: "<CodeBlock>const n = 1</CodeBlock>",
			render: () => <CodeBlock>const n = 1</CodeBlock>,
		},
	],
	avatar: [
		{
			id: catalogScenarioId("avatar", "fallback"),
			title: "Fallback",
			code: "<Avatar><AvatarFallback>ZL</AvatarFallback></Avatar>",
			render: () => (
				<Avatar>
					<AvatarFallback>ZL</AvatarFallback>
				</Avatar>
			),
		},
	],
	slider: [
		{
			id: catalogScenarioId("slider", "default"),
			title: "Default",
			code: '<Slider defaultValue={[40]} aria-label="Volume" />',
			render: () => <Slider defaultValue={[40]} aria-label="Volume" />,
		},
		{
			id: catalogScenarioId("slider", "disabled"),
			title: "Disabled",
			code: "<Slider disabled defaultValue={[40]} />",
			render: () => <Slider disabled defaultValue={[40]} aria-label="Disabled volume" />,
		},
	],
	toggle: [
		{
			id: catalogScenarioId("toggle", "default"),
			title: "Default",
			code: '<Toggle aria-label="Bold">B</Toggle>',
			render: () => <Toggle aria-label="Bold">B</Toggle>,
		},
		{
			id: catalogScenarioId("toggle", "sizes"),
			title: "Sizes",
			code: '<Toggle size="sm">B</Toggle>',
			render: () => (
				<Preview>
					<Toggle size="sm" aria-label="Small bold">
						B
					</Toggle>
					<Toggle aria-label="Default bold">B</Toggle>
					<Toggle size="lg" aria-label="Large bold">
						B
					</Toggle>
				</Preview>
			),
		},
	],
	"date-picker": [
		{
			id: catalogScenarioId("date-picker", "single-date-selection"),
			title: "Single Date Selection",
			code: '<DatePicker aria-label="Date" />',
			render: () => <DatePicker aria-label="Date" />,
		},
	],
	"command-palette": [
		{
			id: catalogScenarioId("command-palette", "with-grouped-items"),
			title: "With Grouped Items",
			code: "<CommandPalette><CommandGroup heading='Pages'>…</CommandGroup></CommandPalette>",
			render: () => <CommandPaletteExample />,
		},
		{
			id: catalogScenarioId("command-palette", "simple-flat-list"),
			title: "Simple Flat List",
			code: "<CommandPalette><CommandItem>Button</CommandItem></CommandPalette>",
			render: () => <CommandPaletteExample flat />,
		},
	],
	"link-button": [
		{
			id: catalogScenarioId("link-button", "default"),
			title: "Default",
			code: '<LinkButton href="#docs">Open docs</LinkButton>',
			render: () => <LinkButton href="#docs">Open docs</LinkButton>,
		},
		{
			id: catalogScenarioId("link-button", "disabled-link"),
			title: "Disabled Link",
			code: '<LinkButton aria-disabled="true" tabIndex={-1} role="link">Disabled link</LinkButton>',
			render: () => (
				<LinkButton aria-disabled="true" tabIndex={-1} role="link" className="opacity-50">
					Disabled link
				</LinkButton>
			),
		},
	],
	field: [
		{
			id: catalogScenarioId("field", "hint"),
			title: "Hint",
			code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="kumo-ex-email" hint="Never shared">
					<Input id="kumo-ex-email" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("field", "error"),
			title: "Error",
			code: '<Field label="Email" htmlFor="email" error="Required"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="kumo-ex-email-err" error="Required">
					<Input id="kumo-ex-email-err" />
				</Field>
			),
		},
	],
};
