import { Banner } from "@nocoo/basalt/components/banner";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Link } from "@nocoo/basalt/components/link";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { Text } from "@nocoo/basalt/components/text";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { AlertTriangle, CircleAlert, CircleCheck, Info, X } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { EXTRA_DEMOS, EXTRA_EXAMPLES } from "./catalog-ready";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";
import { KUMO_EXAMPLES } from "./kumo-examples";

function Preview({ children }: { children: ReactNode }) {
	return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

const BASE_DEMOS: Record<string, ComponentType> = {
	text: () => (
		<Preview>
			<Text>The quick brown fox jumps over the lazy dog.</Text>
			<Text tone="muted">Muted supporting copy.</Text>
		</Preview>
	),
	label: () => (
		<Preview>
			<Label htmlFor="demo-label">Email</Label>
			<Input id="demo-label" />
		</Preview>
	),
	separator: () => (
		<div className="w-full max-w-sm space-y-3">
			<Text>Above</Text>
			<Separator />
			<Text>Below</Text>
		</div>
	),
	button: () => (
		<Preview>
			<Button>Save</Button>
			<Button variant="secondary">Cancel</Button>
			<Button variant="outline">Outline</Button>
			<Button icon="+">With icon</Button>
			<Button loading>Saving</Button>
			<Button size="icon" aria-label="Add">
				+
			</Button>
			<Button disabled>Disabled</Button>
		</Preview>
	),
	"link-button": () => (
		<Preview>
			<LinkButton href="#docs">Open docs</LinkButton>
		</Preview>
	),
	link: () => (
		<LinkProvider>
			<Link href="#section">Inline link</Link>
		</LinkProvider>
	),
	"link-provider": () => (
		<LinkProvider>
			<Link href="#section">Rendered through LinkProvider</Link>
		</LinkProvider>
	),
	tooltip: () => (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Hover</Button>
				</TooltipTrigger>
				<TooltipContent>Helpful hint</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	),
	"theme-provider": () => (
		<ThemeProvider>
			<Text>ThemeProvider is active for the toggle on this page.</Text>
		</ThemeProvider>
	),
	"theme-toggle": () => (
		<ThemeProvider>
			<ThemeToggle aria-label="Toggle theme" />
		</ThemeProvider>
	),
	"layer-card": () => (
		<LayerCard className="w-[250px]">
			<LayerCard.Secondary>Next Steps</LayerCard.Secondary>
			<LayerCard.Primary>Hello</LayerCard.Primary>
		</LayerCard>
	),
	input: () => <Input aria-label="Name" placeholder="Jane Doe" />,
	"input-area": () => <InputArea aria-label="Notes" placeholder="Write a note" />,
	"input-group": () => (
		<InputGroup>
			<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
			<InputGroup.Suffix>.example.com</InputGroup.Suffix>
			<InputGroup.Addon align="end">
				<CircleCheck className="text-basalt-heatmap-green-3" />
			</InputGroup.Addon>
		</InputGroup>
	),
	"sensitive-input": () => (
		<SensitiveInput aria-label="Password" revealLabel="Show password" hideLabel="Hide password" />
	),
	field: () => (
		<Field label="Email" htmlFor="field-email" hint="We'll never share this.">
			<Input id="field-email" />
		</Field>
	),
	checkbox: () => <Checkbox aria-label="Subscribe" />,
	radio: () => (
		<RadioGroup defaultValue="a" className="flex gap-4">
			<Radio value="a" aria-label="Alpha" />
			<Radio value="b" aria-label="Beta" />
		</RadioGroup>
	),
	switch: () => <Switch aria-label="Notifications" />,
};

export const UI_DEMOS: Record<string, ComponentType> = { ...BASE_DEMOS, ...EXTRA_DEMOS };

const BASE_EXAMPLES: Record<string, CatalogScenario[]> = {
	button: [
		{
			id: catalogScenarioId("button", "variants"),
			title: "Variants",
			code: '<Button>Default</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="link">Link</Button>',
			render: () => (
				<Preview>
					<Button>Default</Button>
					<Button variant="secondary">Secondary</Button>
					<Button variant="destructive">Destructive</Button>
					<Button variant="outline">Outline</Button>
					<Button variant="ghost">Ghost</Button>
					<Button variant="link">Link</Button>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("button", "sizes"),
			title: "Sizes",
			code: '<Button size="sm">Small</Button>\n<Button>Default</Button>\n<Button size="lg">Large</Button>',
			render: () => (
				<Preview>
					<Button size="sm">Small</Button>
					<Button>Default</Button>
					<Button size="lg">Large</Button>
				</Preview>
			),
		},
		{
			id: catalogScenarioId("button", "with-icon"),
			title: "With Icon",
			code: '<Button icon="+">Add</Button>',
			render: () => <Button icon="+">Add</Button>,
		},
		{
			id: catalogScenarioId("button", "icon-only"),
			title: "Icon Only",
			code: '<Button size="icon" aria-label="Add">+</Button>',
			render: () => (
				<Button size="icon" aria-label="Add">
					+
				</Button>
			),
		},
		{
			id: catalogScenarioId("button", "loading-state"),
			title: "Loading State",
			code: "<Button loading>Saving</Button>",
			render: () => <Button loading>Saving</Button>,
		},
		{
			id: catalogScenarioId("button", "disabled-state"),
			title: "Disabled State",
			code: "<Button disabled>Disabled</Button>",
			render: () => <Button disabled>Disabled</Button>,
		},
		{
			id: catalogScenarioId("button", "title"),
			title: "Title",
			code: '<Button title="Creates a new project">Hover title</Button>',
			render: () => <Button title="Creates a new project">Hover title</Button>,
		},
		{
			id: catalogScenarioId("button", "link-as-button"),
			title: "Link as Button",
			code: '<Button asChild><a href="#docs">Open docs</a></Button>',
			render: () => (
				<Button asChild>
					<a href="#docs">Open docs</a>
				</Button>
			),
		},
		{
			id: catalogScenarioId("button", "link-with-tooltip"),
			title: "Link with Tooltip",
			code: "<Tooltip><TooltipTrigger asChild><LinkButton href='#docs'>Docs</LinkButton></TooltipTrigger><TooltipContent>Open documentation</TooltipContent></Tooltip>",
			render: () => (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<LinkButton href="#docs">Docs</LinkButton>
						</TooltipTrigger>
						<TooltipContent>Open documentation</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
		},
		{
			id: catalogScenarioId("button", "disabled-link"),
			title: "Disabled Link",
			code: '<LinkButton aria-disabled="true" tabIndex={-1} role="link">Disabled link</LinkButton>',
			render: () => (
				<LinkButton aria-disabled="true" tabIndex={-1} role="link" className="opacity-50">
					Disabled link
				</LinkButton>
			),
		},
	],
	"link-button": [
		{
			id: catalogScenarioId("link-button", "default"),
			title: "Default",
			code: '<LinkButton href="#docs">Open docs</LinkButton>',
			render: () => <LinkButton href="#docs">Open docs</LinkButton>,
		},
	],
	text: [
		{
			id: catalogScenarioId("text", "default"),
			title: "Default",
			code: "<Text>Body copy</Text>",
			render: () => <Text>Body copy</Text>,
		},
		{
			id: catalogScenarioId("text", "muted"),
			title: "Muted",
			code: '<Text tone="muted">Muted</Text>',
			render: () => <Text tone="muted">Muted</Text>,
		},
	],
	label: [
		{
			id: catalogScenarioId("label", "default-label"),
			title: "Default Label",
			code: "<Label>Default Label</Label>",
			render: () => <Label>Default Label</Label>,
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
			code: '<Label tooltip="More information">With Tooltip</Label>',
			render: () => <Label tooltip="More information">With Tooltip</Label>,
		},
	],
	separator: [
		{
			id: catalogScenarioId("separator", "horizontal"),
			title: "Horizontal",
			code: "<Separator />",
			render: () => <Separator />,
		},
	],
	link: [
		{
			id: catalogScenarioId("link", "default"),
			title: "Default",
			code: '<Link href="#section">Inline link</Link>',
			render: () => (
				<LinkProvider>
					<Link href="#section">Inline link</Link>
				</LinkProvider>
			),
		},
	],
	"link-provider": [
		{
			id: catalogScenarioId("link-provider", "default"),
			title: "Default",
			code: "<LinkProvider><Link href='#section'>Link</Link></LinkProvider>",
			render: () => (
				<LinkProvider>
					<Link href="#section">Link</Link>
				</LinkProvider>
			),
		},
	],
	tooltip: [
		{
			id: catalogScenarioId("tooltip", "default"),
			title: "Default",
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
	],
	"theme-provider": [
		{
			id: catalogScenarioId("theme-provider", "default"),
			title: "Default",
			code: "<ThemeProvider>{children}</ThemeProvider>",
			render: () => (
				<ThemeProvider>
					<Text>Provider is active.</Text>
				</ThemeProvider>
			),
		},
	],
	"theme-toggle": [
		{
			id: catalogScenarioId("theme-toggle", "default"),
			title: "Default",
			code: '<ThemeToggle aria-label="Toggle theme" />',
			render: () => (
				<ThemeProvider>
					<ThemeToggle aria-label="Toggle theme" />
				</ThemeProvider>
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
	],
	input: [
		{
			id: catalogScenarioId("input", "default"),
			title: "Default",
			code: '<Input aria-label="Name" placeholder="Jane Doe" />',
			render: () => <Input aria-label="Name" placeholder="Jane Doe" />,
		},
	],
	"input-area": [
		{
			id: catalogScenarioId("input-area", "default"),
			title: "Default",
			code: '<InputArea aria-label="Notes" />',
			render: () => <InputArea aria-label="Notes" />,
		},
	],
	"input-group": [
		{
			id: catalogScenarioId("input-group", "default"),
			title: "Default",
			code: `<InputGroup>
  <InputGroup.Input defaultValue="atlas" />
  <InputGroup.Suffix>.example.com</InputGroup.Suffix>
</InputGroup>`,
			render: () => (
				<InputGroup>
					<InputGroup.Input defaultValue="atlas" aria-label="Subdomain" />
					<InputGroup.Suffix>.example.com</InputGroup.Suffix>
					<InputGroup.Addon align="end">
						<CircleCheck className="text-basalt-heatmap-green-3" />
					</InputGroup.Addon>
				</InputGroup>
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
	],
	field: [
		{
			id: catalogScenarioId("field", "hint"),
			title: "Hint",
			code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-email" hint="Never shared">
					<Input id="ex-email" />
				</Field>
			),
		},
		{
			id: catalogScenarioId("field", "error"),
			title: "Error",
			code: '<Field label="Email" htmlFor="email" error="Required"><Input id="email" /></Field>',
			render: () => (
				<Field label="Email" htmlFor="ex-email-err" error="Required">
					<Input id="ex-email-err" />
				</Field>
			),
		},
	],
	checkbox: [
		{
			id: catalogScenarioId("checkbox", "unchecked"),
			title: "Unchecked",
			code: '<Checkbox aria-label="Subscribe" />',
			render: () => <Checkbox aria-label="Subscribe" />,
		},
		{
			id: catalogScenarioId("checkbox", "indeterminate"),
			title: "Indeterminate",
			code: '<Checkbox aria-label="Partial" checked="indeterminate" />',
			render: () => <Checkbox aria-label="Partial" checked="indeterminate" />,
		},
	],
	radio: [
		{
			id: catalogScenarioId("radio", "group"),
			title: "Group",
			code: '<RadioGroup defaultValue="a"><Radio value="a" /></RadioGroup>',
			render: () => (
				<RadioGroup defaultValue="a" className="flex gap-4">
					<Radio value="a" aria-label="Alpha" />
					<Radio value="b" aria-label="Beta" />
				</RadioGroup>
			),
		},
	],
	switch: [
		{
			id: catalogScenarioId("switch", "default"),
			title: "Default",
			code: '<Switch aria-label="Notifications" />',
			render: () => <Switch aria-label="Notifications" />,
		},
	],
	banner: [
		{
			id: catalogScenarioId("banner", "variants"),
			title: "Variants",
			code: `<Banner icon={<Info />} title="Update available" description="A new version is ready to install." />
<Banner icon={<AlertTriangle />} variant="alert" title="Session expiring" description="Your session will expire in 5 minutes." />
<Banner icon={<CircleAlert />} variant="error" title="Save failed" description="We couldn't save your changes. Please try again." />
<Banner icon={<Info />} variant="secondary" title="Maintenance scheduled" description="This service will be unavailable for 10 minutes." />`,
			render: () => (
				<div className="w-full space-y-3">
					<Banner
						icon={<Info />}
						title="Update available"
						description="A new version is ready to install."
					/>
					<Banner
						icon={<AlertTriangle />}
						variant="alert"
						title="Session expiring"
						description="Your session will expire in 5 minutes."
					/>
					<Banner
						icon={<CircleAlert />}
						variant="error"
						title="Save failed"
						description="We couldn't save your changes. Please try again."
					/>
					<Banner
						icon={<Info />}
						variant="secondary"
						title="Maintenance scheduled"
						description="This service will be unavailable for 10 minutes."
					/>
				</div>
			),
		},
		{
			id: catalogScenarioId("banner", "with-icon"),
			title: "With icon",
			code: '<Banner icon={<AlertTriangle />} variant="alert" title="Review required" description="Please review your billing information before proceeding." />',
			render: () => (
				<Banner
					icon={<AlertTriangle />}
					variant="alert"
					title="Review required"
					description="Please review your billing information before proceeding."
				/>
			),
		},
		{
			id: catalogScenarioId("banner", "with-action"),
			title: "With action",
			code: `<Banner
  icon={<Info />}
  title="Update available"
  description="A new version is ready to install."
  action={
    <>
      <Banner.Action>Update</Banner.Action>
      <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
    </>
  }
/>`,
			render: () => (
				<div className="w-full space-y-3">
					<Banner
						icon={<Info />}
						title="Update available"
						description="A new version is ready to install."
						action={
							<>
								<Banner.Action>Update</Banner.Action>
								<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
							</>
						}
					/>
					<Banner
						variant="error"
						icon={<CircleAlert />}
						title="Save failed"
						description="We couldn't save your changes. Please try again."
						action={
							<>
								<Banner.Action>Retry</Banner.Action>
								<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss error" />
							</>
						}
					/>
				</div>
			),
		},
		{
			id: catalogScenarioId("banner", "with-multiple-actions"),
			title: "With multiple actions",
			code: `<Banner
  icon={<AlertTriangle />}
  variant="error"
  title="Your account is 90 days past due."
  description="Pay now to avoid interruption."
  action={
    <>
      <Banner.Action>Pay now</Banner.Action>
      <Banner.Action variant="secondary">Go to billing</Banner.Action>
    </>
  }
/>`,
			render: () => (
				<Banner
					icon={<AlertTriangle />}
					variant="error"
					title="Your account is 90 days past due."
					description="Pay now to avoid interruption."
					action={
						<>
							<Banner.Action>Pay now</Banner.Action>
							<Banner.Action variant="secondary">Go to billing</Banner.Action>
						</>
					}
				/>
			),
		},
		{
			id: catalogScenarioId("banner", "compact-size"),
			title: "Compact size",
			code: `<Banner
  size="sm"
  description="A project named Atlas already exists."
  action={<Link href="#">Open project</Link>}
/>
<Banner
  size="sm"
  description="A project named Atlas already exists."
  action={
    <>
      <Banner.Action>Open project</Banner.Action>
      <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
    </>
  }
/>
<Banner size="sm" description="A project named Atlas already exists." />`,
			render: () => (
				<div className="w-full space-y-3">
					<Banner
						size="sm"
						description="A project named Atlas already exists."
						action={<Link href="#">Open project</Link>}
					/>
					<Banner
						size="sm"
						description="A project named Atlas already exists."
						action={
							<>
								<Banner.Action>Open project</Banner.Action>
								<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
							</>
						}
					/>
					<Banner size="sm" description="A project named Atlas already exists." />
				</div>
			),
		},
		{
			id: catalogScenarioId("banner", "custom-content"),
			title: "Custom content",
			code: `<Banner
  icon={<Info />}
  title="Custom content supported"
  description={
    <Text>
      This banner supports <strong>custom content</strong> with Text.
    </Text>
  }
/>`,
			render: () => (
				<Banner
					icon={<Info />}
					title="Custom content supported"
					description={
						<Text className="text-inherit">
							This banner supports <strong>custom content</strong> with Text.
						</Text>
					}
				/>
			),
		},
	],
};

export const UI_EXAMPLES: Record<string, CatalogScenario[]> = {
	...EXTRA_EXAMPLES,
	...BASE_EXAMPLES,
	...KUMO_EXAMPLES,
};
