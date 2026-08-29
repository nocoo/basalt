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
import { Code, CodeBlock } from "@nocoo/basalt/components/code";
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
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
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
import { Tabs, TabsList, TabsTrigger } from "@nocoo/basalt/components/tabs";
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
import { AlertTriangle, Check, Inbox, Search, X } from "lucide-react";
import { type ComponentType, type ReactNode, useState } from "react";

function Preview({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>;
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
										<TableHead>Resource</TableHead>
										<TableHead>Region</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Latency</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>api-gateway-prod</TableCell>
										<TableCell>us-east-1</TableCell>
										<TableCell>Healthy</TableCell>
										<TableCell>12ms</TableCell>
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

type Example = { title: string; code: string; render: ComponentType };

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

export const KUMO_EXAMPLES: Record<string, Example[]> = {
	badge: [
		{
			title: "Primary Badges",
			code: "<Badge>Default</Badge>",
			render: () => <Badge>Default</Badge>,
		},
		{
			title: "Other color variants",
			code: `<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
			render: () => (
				<Preview>
					<Badge variant="secondary">Secondary</Badge>
					<Badge variant="success">Success</Badge>
					<Badge variant="warning">Warning</Badge>
					<Badge variant="destructive">Destructive</Badge>
					<Badge variant="outline">Outline</Badge>
				</Preview>
			),
		},
		{
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
			title: "In a sentence",
			code: "<Text>Status is <Badge>Stable</Badge></Text>",
			render: () => (
				<Text>
					Status is <Badge>Stable</Badge>
				</Text>
			),
		},
		{
			title: "With an icon",
			code: "<Badge><Check /> Verified</Badge>",
			render: () => (
				<Badge>
					<Check className="size-3" /> Verified
				</Badge>
			),
		},
		{
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
			title: "Basic",
			code: '<Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />',
			render: () => <Breadcrumbs items={[{ href: "#", label: "Home" }, { label: "Settings" }]} />,
		},
		{
			title: "Loading",
			code: "<Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />",
			render: () => <Breadcrumbs items={[{ label: <SkeletonLine minWidth={72} /> }]} />,
		},
	],
	checkbox: [
		{
			title: "Default",
			code: '<Checkbox aria-label="Subscribe" />',
			render: () => <Checkbox aria-label="Unchecked" />,
		},
		{
			title: "Checked",
			code: '<Checkbox defaultChecked aria-label="Subscribe" />',
			render: () => <Checkbox defaultChecked aria-label="Checked" />,
		},
		{
			title: "Indeterminate",
			code: '<Checkbox checked="indeterminate" aria-label="Partial" />',
			render: () => <Checkbox checked="indeterminate" aria-label="Partial" />,
		},
		{
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
			title: "Short Text",
			code: '<ClipboardText text="bun add @nocoo/basalt" />',
			render: () => <ClipboardText text="bun add @nocoo/basalt" />,
		},
		{
			title: "API Key",
			code: '<ClipboardText text="sk-••••••••" copyText="sk-live-secret" />',
			render: () => <ClipboardText text="sk-••••••••" copyText="sk-live-secret" />,
		},
		{
			title: "Copy Alternate Text",
			code: '<ClipboardText text="Visible label" copyText="copied-value" />',
			render: () => <ClipboardText text="Visible label" copyText="copied-value" />,
		},
		{
			title: "Long Text",
			code: '<ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />',
			render: () => <ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />,
		},
	],
	empty: [
		{
			title: "Basic",
			code: '<Empty title="No results" description="Try another query." />',
			render: () => <Empty title="No results" description="Try another query." />,
		},
		{
			title: "With icon",
			code: '<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />',
			render: () => (
				<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />
			),
		},
	],
	loader: [
		{
			title: "Default Size",
			code: "<Loader />",
			render: () => <Loader />,
		},
		{
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
			title: "Basic Meter",
			code: '<Meter value={40} label="Usage" />',
			render: () => <Meter value={40} label="Usage" />,
		},
		{
			title: "Custom Value Display",
			code: '<Meter value={12} label="Storage" customValue="12 GB" />',
			render: () => <Meter value={12} label="Storage" customValue="12 GB" />,
		},
		{
			title: "Hidden Value",
			code: '<Meter value={72} label="Progress" hideValue />',
			render: () => <Meter value={72} label="Progress" hideValue />,
		},
		{
			title: "Full Meter",
			code: '<Meter value={100} label="Complete" />',
			render: () => <Meter value={100} label="Complete" />,
		},
		{
			title: "Low Value",
			code: '<Meter value={8} label="Quota" />',
			render: () => <Meter value={8} label="Quota" />,
		},
	],
	pagination: [
		{
			title: "Full Controls (Default)",
			code: "<Pagination page={2} pageCount={10} />",
			render: () => <Pagination page={2} pageCount={10} />,
		},
		{
			title: "Simple Controls",
			code: "<Pagination page={2} pageCount={10} simple />",
			render: () => <Pagination page={2} pageCount={10} simple />,
		},
		{
			title: "Mid-Page State",
			code: "<Pagination page={5} pageCount={12} />",
			render: () => <Pagination page={5} pageCount={12} />,
		},
	],
	switch: [
		{
			title: "Off State",
			code: '<Switch aria-label="Notifications" />',
			render: () => <Switch aria-label="Off" />,
		},
		{
			title: "On State",
			code: '<Switch defaultChecked aria-label="Notifications" />',
			render: () => <Switch defaultChecked aria-label="On" />,
		},
		{
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
			title: "With Label and Description",
			code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-input-email" hint="Never shared">
					<Input id="ex-input-email" placeholder="you@example.com" />
				</Field>
			),
		},
		{
			title: "With Error (String)",
			code: '<Field label="Email" htmlFor="email" error="Required"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-input-err" error="Required">
					<Input id="ex-input-err" />
				</Field>
			),
		},
		{
			title: "Disabled",
			code: "<Input disabled />",
			render: () => <Input disabled value="Read only" aria-label="Disabled input" />,
		},
		{
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
			title: "Bare Input (No Label)",
			code: '<Input aria-label="Name" placeholder="Jane Doe" />',
			render: () => <Input aria-label="Name" placeholder="Jane Doe" />,
		},
	],
	"input-area": [
		{
			title: "With Label",
			code: '<Field label="Notes" htmlFor="notes"><InputArea id="notes" /></Field>',
			render: () => (
				<Field label="Notes" htmlFor="ex-notes">
					<InputArea id="ex-notes" />
				</Field>
			),
		},
		{
			title: "Custom Row Count",
			code: "<InputArea rows={6} />",
			render: () => <InputArea rows={6} aria-label="Tall notes" />,
		},
		{
			title: "Error State (String)",
			code: '<Field label="Bio" htmlFor="bio" error="Too short"><InputArea id="bio" /></Field>',
			render: () => (
				<Field label="Bio" htmlFor="ex-bio" error="Too short">
					<InputArea id="ex-bio" />
				</Field>
			),
		},
		{
			title: "Disabled",
			code: "<InputArea disabled />",
			render: () => <InputArea disabled aria-label="Disabled notes" value="Unavailable" />,
		},
	],
	"input-group": [
		{
			title: "Icon",
			code: "<InputGroup><Search /><Input /></InputGroup>",
			render: () => (
				<InputGroup className="w-full max-w-sm rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3">
					<Search className="size-4 text-basalt-muted-foreground" />
					<Input className="border-0 shadow-none" aria-label="Search group" placeholder="Search" />
				</InputGroup>
			),
		},
		{
			title: "Button",
			code: "<InputGroup><Input /><Button>Go</Button></InputGroup>",
			render: () => (
				<InputGroup>
					<Input aria-label="Query" />
					<Button>Go</Button>
				</InputGroup>
			),
		},
		{
			title: "Text",
			code: "<InputGroup><span>https://</span><Input /></InputGroup>",
			render: () => (
				<InputGroup>
					<span className="text-sm text-basalt-muted-foreground">https://</span>
					<Input aria-label="Host" placeholder="example.com" />
				</InputGroup>
			),
		},
		{
			title: "Loading",
			code: "<InputGroup><Input /><Loader /></InputGroup>",
			render: () => (
				<InputGroup>
					<Input aria-label="Loading query" />
					<Loader size={16} />
				</InputGroup>
			),
		},
	],
	label: [
		{
			title: "Standalone Label",
			code: '<Label htmlFor="email">Email</Label>',
			render: () => <Label htmlFor="ex-standalone-label">Email</Label>,
		},
		{
			title: "With Form Components (Recommended)",
			code: '<Field label="Email" htmlFor="email"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-label-field">
					<Input id="ex-label-field" />
				</Field>
			),
		},
	],
	text: [
		{
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
			title: "Restrictions",
			code: '<Text tone="muted">Muted supporting copy.</Text>',
			render: () => <Text tone="muted">Muted supporting copy.</Text>,
		},
	],
	link: [
		{
			title: "Basic Link",
			code: '<Link href="#section">Inline link</Link>',
			render: () => (
				<LinkProvider>
					<Link href="#section">Inline link</Link>
				</LinkProvider>
			),
		},
		{
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
			title: "Basic Card",
			code: "<LayerCard>Plain</LayerCard>",
			render: () => <LayerCard className="p-4">Plain</LayerCard>,
		},
		{
			title: "Surface-style Card",
			code: '<LayerCard surface="bordered">Bordered</LayerCard>',
			render: () => (
				<LayerCard surface="bordered" className="p-4">
					Bordered
				</LayerCard>
			),
		},
		{
			title: "Multiple Cards",
			code: "<LayerCard>A</LayerCard><LayerCard>B</LayerCard>",
			render: () => (
				<div className="grid w-full grid-cols-2 gap-3">
					<LayerCard className="p-4">Alpha</LayerCard>
					<LayerCard className="p-4">Beta</LayerCard>
				</div>
			),
		},
	],
	separator: [
		{
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
			title: "Default",
			code: "<SkeletonLine minWidth={120} />",
			render: () => <SkeletonLine minWidth={120} />,
		},
		{
			title: "Sizes",
			code: "<SkeletonLine minWidth={64} /><SkeletonLine minWidth={160} />",
			render: () => (
				<Stack>
					<SkeletonLine minWidth={64} />
					<SkeletonLine minWidth={120} />
					<SkeletonLine minWidth={200} />
				</Stack>
			),
		},
	],
	"sensitive-input": [
		{
			title: "Default",
			code: '<SensitiveInput revealLabel="Show" hideLabel="Hide" />',
			render: () => <SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />,
		},
		{
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
			title: "Searchable Select with Placeholder",
			code: '<Combobox items={["Apple", "Banana"]} placeholder="Select…" />',
			render: () => <Combobox items={["Apple", "Banana"]} placeholder="Select…" />,
		},
		{
			title: "Disabled",
			code: '<Combobox disabled items={["Apple"]} />',
			render: () => <Combobox disabled items={["Apple"]} placeholder="Disabled" />,
		},
	],
	autocomplete: [
		{
			title: "Default",
			code: '<Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />',
			render: () => <Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />,
		},
	],
	tabs: [
		{
			title: "Variants",
			code: "<Tabs defaultValue='a'><TabsList><TabsTrigger value='a'>Home</TabsTrigger></TabsList></Tabs>",
			render: () => (
				<Tabs defaultValue="a">
					<TabsList>
						<TabsTrigger value="a">Home</TabsTrigger>
						<TabsTrigger value="b">About</TabsTrigger>
					</TabsList>
				</Tabs>
			),
		},
		{
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
			title: "Title Only",
			code: '<Button onClick={() => toast("Saved")}>Toast</Button>',
			render: () => <Button onClick={() => toast("Saved")}>Title only</Button>,
		},
		{
			title: "Title and Description",
			code: 'toast("Saved", { description: "Worker updated." })',
			render: () => (
				<Button onClick={() => toast("Saved", { description: "Worker updated." })}>
					With description
				</Button>
			),
		},
		{
			title: "Success Variant",
			code: "toast.success('Deployed')",
			render: () => <Button onClick={() => toast.success("Deployed")}>Success</Button>,
		},
		{
			title: "Error Variant",
			code: "toast.error('Failed')",
			render: () => <Button onClick={() => toast.error("Failed")}>Error</Button>,
		},
		{
			title: "Warning Variant",
			code: "toast.warning('Expiring')",
			render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
		},
		{
			title: "Info Variant",
			code: "toast.info('Queued')",
			render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
		},
	],
	dialog: [
		{
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
			title: "Sizes",
			code: '<DialogContent size="sm">…</DialogContent>\n<DialogContent size="base">…</DialogContent>\n<DialogContent size="lg">…</DialogContent>\n<DialogContent size="xl">…</DialogContent>',
			render: () => <DialogSizesExample />,
		},
		{
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
			title: "Basic Popover",
			code: "<Popover><PopoverTrigger asChild><Button>Open</Button></PopoverTrigger><PopoverContent>Panel</PopoverContent></Popover>",
			render: () => (
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="outline">Open</Button>
					</PopoverTrigger>
					<PopoverContent>Panel</PopoverContent>
				</Popover>
			),
		},
	],
	"dropdown-menu": [
		{
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
			title: "With Default Styling",
			code: "<Collapsible><CollapsibleTrigger asChild><Button>Open</Button></CollapsibleTrigger><CollapsibleContent>Hidden</CollapsibleContent></Collapsible>",
			render: () => (
				<Collapsible>
					<CollapsibleTrigger asChild>
						<Button variant="outline">Open</Button>
					</CollapsibleTrigger>
					<CollapsibleContent>Hidden details</CollapsibleContent>
				</Collapsible>
			),
		},
		{
			title: "Custom Trigger",
			code: "<CollapsibleTrigger>Details</CollapsibleTrigger>",
			render: () => (
				<Collapsible>
					<CollapsibleTrigger className="text-sm font-medium">Details</CollapsibleTrigger>
					<CollapsibleContent>Expanded copy.</CollapsibleContent>
				</Collapsible>
			),
		},
	],
	table: [
		{
			title: "Basic",
			code: "<Table><TableHeader>…</TableHeader></Table>",
			render: () => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Worker</TableCell>
							<TableCell>Ready</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			),
		},
		{
			title: "Selected Row",
			code: '<TableRow className="bg-basalt-accent">…</TableRow>',
			render: () => (
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow className="bg-basalt-accent">
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
			title: "Input Shorthand",
			code: "<Toolbar><Input placeholder='Search…' /></Toolbar>",
			render: () => (
				<Toolbar>
					<Input aria-label="Search" placeholder="Search…" className="border-0 shadow-none" />
				</Toolbar>
			),
		},
		{
			title: "Button Actions",
			code: "<Toolbar><Button>Save</Button></Toolbar>",
			render: () => (
				<Toolbar>
					<Button size="sm">Save</Button>
					<Button size="sm" variant="outline">
						Cancel
					</Button>
				</Toolbar>
			),
		},
	],
	grid: [
		{
			title: "Grid",
			code: "<Grid><GridItem>1</GridItem></Grid>",
			render: () => (
				<Grid>
					<GridItem>1</GridItem>
					<GridItem>2</GridItem>
				</Grid>
			),
		},
	],
	flow: [
		{
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
			title: "Languages",
			code: "<Code>cn()</Code>",
			render: () => <Code>cn()</Code>,
		},
	],
	"code-block": [
		{
			title: "Line Numbers",
			code: "<CodeBlock>const n = 1</CodeBlock>",
			render: () => <CodeBlock>const n = 1</CodeBlock>,
		},
	],
	avatar: [
		{
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
			title: "Default",
			code: '<Slider defaultValue={[40]} aria-label="Volume" />',
			render: () => <Slider defaultValue={[40]} aria-label="Volume" />,
		},
		{
			title: "Disabled",
			code: "<Slider disabled defaultValue={[40]} />",
			render: () => <Slider disabled defaultValue={[40]} aria-label="Disabled volume" />,
		},
	],
	toggle: [
		{
			title: "Default",
			code: '<Toggle aria-label="Bold">B</Toggle>',
			render: () => <Toggle aria-label="Bold">B</Toggle>,
		},
		{
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
			title: "Single Date Selection",
			code: '<DatePicker aria-label="Date" />',
			render: () => <DatePicker aria-label="Date" />,
		},
	],
	"command-palette": [
		{
			title: "With Grouped Items",
			code: "<CommandPalette><CommandGroup heading='Pages'>…</CommandGroup></CommandPalette>",
			render: () => <CommandPaletteExample />,
		},
		{
			title: "Simple Flat List",
			code: "<CommandPalette><CommandItem>Button</CommandItem></CommandPalette>",
			render: () => <CommandPaletteExample flat />,
		},
	],
	"link-button": [
		{
			title: "Default",
			code: '<LinkButton href="#docs">Open docs</LinkButton>',
			render: () => <LinkButton href="#docs">Open docs</LinkButton>,
		},
		{
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
			title: "Hint",
			code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="kumo-ex-email" hint="Never shared">
					<Input id="kumo-ex-email" />
				</Field>
			),
		},
		{
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
