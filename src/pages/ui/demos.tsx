import { Banner } from "@nocoo/basalt/components/banner";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Link } from "@nocoo/basalt/components/link";
import { Radio, RadioGroup } from "@nocoo/basalt/components/radio";
import { SensitiveInput } from "@nocoo/basalt/components/sensitive-input";
import { Switch } from "@nocoo/basalt/components/switch";
import { Text } from "@nocoo/basalt/components/text";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { AlertTriangle, CircleAlert, Info, X } from "lucide-react";
import { EXTRA_EXAMPLES } from "./catalog-ready";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";
import { BASALT_MARK_EXAMPLES } from "./examples/basalt-mark";
import { BUTTON_EXAMPLES } from "./examples/button";
import { FIELD_EXAMPLES } from "./examples/field";
import { INPUT_EXAMPLES } from "./examples/input";
import { INPUT_AREA_EXAMPLES } from "./examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "./examples/input-group";
import { LABEL_EXAMPLES } from "./examples/label";
import { LAYER_CARD_EXAMPLES } from "./examples/layer-card";
import { LINK_EXAMPLES } from "./examples/link";
import { LINK_BUTTON_EXAMPLES } from "./examples/link-button";
import { SEPARATOR_EXAMPLES } from "./examples/separator";
import { TEXT_EXAMPLES } from "./examples/text";
import { THEME_TOGGLE_EXAMPLES } from "./examples/theme-toggle";
import { TOOLTIP_EXAMPLES } from "./examples/tooltip";
import { KUMO_EXAMPLES } from "./kumo-examples";

const BASE_EXAMPLES: Record<string, CatalogScenario[]> = {
	button: BUTTON_EXAMPLES,
	"link-button": LINK_BUTTON_EXAMPLES,
	text: TEXT_EXAMPLES,
	label: LABEL_EXAMPLES,
	separator: SEPARATOR_EXAMPLES,
	link: LINK_EXAMPLES,
	tooltip: TOOLTIP_EXAMPLES,
	"theme-toggle": THEME_TOGGLE_EXAMPLES,
	"layer-card": LAYER_CARD_EXAMPLES,
	"basalt-mark": BASALT_MARK_EXAMPLES,
	field: FIELD_EXAMPLES,
	input: INPUT_EXAMPLES,
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
	"input-area": INPUT_AREA_EXAMPLES,
	"input-group": INPUT_GROUP_EXAMPLES,
	"sensitive-input": [
		{
			id: catalogScenarioId("sensitive-input", "default"),
			title: "Default",
			code: '<SensitiveInput revealLabel="Show" hideLabel="Hide" />',
			render: () => <SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />,
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
    <Text className="text-inherit">
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

export function catalogHeroScenario(slug: string): CatalogScenario | undefined {
	return UI_EXAMPLES[slug]?.[0];
}
