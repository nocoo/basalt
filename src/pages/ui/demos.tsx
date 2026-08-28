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
import type { ComponentType, ReactNode } from "react";

function Preview({ children }: { children: ReactNode }) {
	return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

export const UI_DEMOS: Record<string, ComponentType> = {
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
		<div className="grid gap-3 sm:grid-cols-2 w-full">
			<LayerCard className="p-4">Plain surface</LayerCard>
			<LayerCard surface="bordered" className="p-4">
				Bordered surface
			</LayerCard>
		</div>
	),
	input: () => <Input aria-label="Name" placeholder="Jane Doe" />,
	"input-area": () => <InputArea aria-label="Notes" placeholder="Write a note" />,
	"input-group": () => (
		<InputGroup>
			<Input aria-label="Query" placeholder="Search" />
			<Button>Go</Button>
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

export const UI_EXAMPLES: Record<string, { title: string; code: string; render: ComponentType }[]> =
	{
		button: [
			{ title: "Default", code: "<Button>Save</Button>", render: () => <Button>Save</Button> },
			{
				title: "Secondary",
				code: '<Button variant="secondary">Cancel</Button>',
				render: () => <Button variant="secondary">Cancel</Button>,
			},
			{
				title: "Loading",
				code: "<Button loading>Saving</Button>",
				render: () => <Button loading>Saving</Button>,
			},
		],
		"link-button": [
			{
				title: "Default",
				code: '<LinkButton href="#docs">Open docs</LinkButton>',
				render: () => <LinkButton href="#docs">Open docs</LinkButton>,
			},
		],
		text: [
			{ title: "Default", code: "<Text>Body copy</Text>", render: () => <Text>Body copy</Text> },
			{
				title: "Muted",
				code: '<Text tone="muted">Muted</Text>',
				render: () => <Text tone="muted">Muted</Text>,
			},
		],
		label: [
			{
				title: "Associated",
				code: '<Label htmlFor="email">Email</Label>',
				render: () => <Label htmlFor="demo-ex-label">Email</Label>,
			},
		],
		separator: [{ title: "Horizontal", code: "<Separator />", render: () => <Separator /> }],
		link: [
			{
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
				title: "Plain",
				code: "<LayerCard>Plain</LayerCard>",
				render: () => <LayerCard className="p-4">Plain</LayerCard>,
			},
			{
				title: "Bordered",
				code: '<LayerCard surface="bordered">Bordered</LayerCard>',
				render: () => (
					<LayerCard surface="bordered" className="p-4">
						Bordered
					</LayerCard>
				),
			},
		],
		input: [
			{
				title: "Default",
				code: '<Input aria-label="Name" placeholder="Jane Doe" />',
				render: () => <Input aria-label="Name" placeholder="Jane Doe" />,
			},
		],
		"input-area": [
			{
				title: "Default",
				code: '<InputArea aria-label="Notes" />',
				render: () => <InputArea aria-label="Notes" />,
			},
		],
		"input-group": [
			{
				title: "Default",
				code: "<InputGroup><Input /><Button>Go</Button></InputGroup>",
				render: () => (
					<InputGroup>
						<Input aria-label="Query" />
						<Button>Go</Button>
					</InputGroup>
				),
			},
		],
		"sensitive-input": [
			{
				title: "Default",
				code: '<SensitiveInput revealLabel="Show" hideLabel="Hide" />',
				render: () => <SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />,
			},
		],
		field: [
			{
				title: "Hint",
				code: '<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
				render: () => (
					<Field label="Email" htmlFor="ex-email" hint="Never shared">
						<Input id="ex-email" />
					</Field>
				),
			},
			{
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
				title: "Unchecked",
				code: '<Checkbox aria-label="Subscribe" />',
				render: () => <Checkbox aria-label="Subscribe" />,
			},
			{
				title: "Indeterminate",
				code: '<Checkbox aria-label="Partial" checked="indeterminate" />',
				render: () => <Checkbox aria-label="Partial" checked="indeterminate" />,
			},
		],
		radio: [
			{
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
				title: "Default",
				code: '<Switch aria-label="Notifications" />',
				render: () => <Switch aria-label="Notifications" />,
			},
		],
	};
