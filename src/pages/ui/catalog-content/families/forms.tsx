import { Autocomplete } from "@nocoo/basalt/components/autocomplete";
import { Combobox } from "@nocoo/basalt/components/combobox";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
import { Slider } from "@nocoo/basalt/components/slider";
import { Toggle } from "@nocoo/basalt/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@nocoo/basalt/components/toggle-group";
import type { ReactNode } from "react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import { provenanceFromLegacy } from "../../catalog-source";
import { CHECKBOX_EXAMPLES } from "../../examples/checkbox";
import { FIELD_EXAMPLES } from "../../examples/field";
import { INPUT_EXAMPLES } from "../../examples/input";
import { INPUT_AREA_EXAMPLES } from "../../examples/input-area";
import { INPUT_GROUP_EXAMPLES } from "../../examples/input-group";
import { RADIO_EXAMPLES } from "../../examples/radio";
import { SEGMENT_CONTROL_EXAMPLES } from "../../examples/segment-control";
import { SELECT_EXAMPLES } from "../../examples/select";
import { SENSITIVE_INPUT_EXAMPLES } from "../../examples/sensitive-input";
import { SWITCH_EXAMPLES } from "../../examples/switch";
import { API as checkboxApi } from "../../generated/catalog-api/checkbox";
import { API as fieldApi } from "../../generated/catalog-api/field";
import { API as inputApi } from "../../generated/catalog-api/input";
import { API as inputAreaApi } from "../../generated/catalog-api/input-area";
import { API as inputGroupApi } from "../../generated/catalog-api/input-group";
import { API as radioApi } from "../../generated/catalog-api/radio";
import { API as segmentControlApi } from "../../generated/catalog-api/segment-control";
import { API as selectApi } from "../../generated/catalog-api/select";
import { API as sensitiveInputApi } from "../../generated/catalog-api/sensitive-input";
import { API as switchApi } from "../../generated/catalog-api/switch";

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

export default catalogContentFamily({
	field: {
		docs: {
			description: "Accessible association and metadata for a labeled control.",
			usage: usage(
				"Field",
				"@nocoo/basalt/components/field",
				'<Field label="Email"><Input /></Field>',
				'import { Input } from "@nocoo/basalt/components/input";',
			),
			variants: [],
			api: fieldApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/field/field.tsx",
			}),
		},
		examples: FIELD_EXAMPLES,
	},
	input: {
		docs: {
			description: "A sized native single-line control on the L3 surface.",
			usage: usage(
				"Input",
				"@nocoo/basalt/components/input",
				'<Input aria-label="Name" placeholder="Jane Doe" />',
			),
			variants: ["sm", "default", "lg"],
			api: inputApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/input/input.tsx",
			}),
		},
		examples: INPUT_EXAMPLES,
	},
	"input-area": {
		docs: {
			description: "A sized native multi-line control on the L3 surface.",
			usage: usage(
				"InputArea",
				"@nocoo/basalt/components/input-area",
				'<InputArea aria-label="Notes" placeholder="Write a note" />',
			),
			variants: ["sm", "default", "lg"],
			api: inputAreaApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/input-area/input-area.tsx",
			}),
		},
		examples: INPUT_AREA_EXAMPLES,
	},
	"input-group": {
		docs: {
			description: "Compose an input with addons, an inline suffix, and status icons.",
			usage: usage(
				"InputGroup",
				"@nocoo/basalt/components/input-group",
				"<InputGroup><InputGroup.Input defaultValue='atlas' aria-label='Subdomain' /><InputGroup.Suffix>.example.com</InputGroup.Suffix></InputGroup>",
			),
			variants: [],
			api: inputGroupApi,
			provenance: provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/pages/FormsPage.tsx",
			}),
		},
		examples: INPUT_GROUP_EXAMPLES,
	},
	"sensitive-input": {
		docs: {
			description: "A password field with a reveal control.",
			usage: usage(
				"SensitiveInput",
				"@nocoo/basalt/components/sensitive-input",
				'<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />',
			),
			variants: [],
			api: sensitiveInputApi,
			provenance: provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/pages/FormsPage.tsx",
			}),
		},
		examples: SENSITIVE_INPUT_EXAMPLES,
	},
	checkbox: {
		docs: {
			description: "A check control with group, legend, size, and error.",
			usage: usage(
				"Checkbox",
				"@nocoo/basalt/components/checkbox",
				'<Checkbox aria-label="Subscribe" />',
			),
			variants: ["checked", "unchecked", "indeterminate", "sm", "default"],
			api: checkboxApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/checkbox/checkbox.tsx",
			}),
		},
		examples: CHECKBOX_EXAMPLES,
	},
	radio: {
		docs: {
			description: "A radio control with group, legend, size, and error.",
			usage: usage(
				"Radio",
				"@nocoo/basalt/components/radio",
				'<Radio.Group defaultValue="a"><Radio value="a" aria-label="Alpha" /><Radio value="b" aria-label="Beta" /></Radio.Group>',
			),
			variants: ["sm", "default"],
			api: radioApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/radio/radio.tsx",
			}),
		},
		examples: RADIO_EXAMPLES,
	},
	switch: {
		docs: {
			description: "A binary toggle with group, legend, size, and error.",
			usage: usage(
				"Switch",
				"@nocoo/basalt/components/switch",
				'<Switch aria-label="Notifications" />',
			),
			variants: ["checked", "unchecked", "sm", "default"],
			api: switchApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/components/switch/switch.tsx",
			}),
		},
		examples: SWITCH_EXAMPLES,
	},
	select: {
		docs: {
			description: "Choose one option.",
			usage: `import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function Example() {
	return (
		<Select>
			<SelectTrigger aria-label="Version">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">v1</SelectItem>
			</SelectContent>
		</Select>
	);
}`,
			variants: [],
			api: selectApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components",
			}),
		},
		examples: SELECT_EXAMPLES,
	},
	combobox: {
		docs: {
			description: "Searchable select.",
			usage: `import { Combobox } from "@nocoo/basalt/components/combobox";

export default function Example() {
	return <Combobox items={["Apple", "Banana"]} placeholder="Select…" />;
}`,
			variants: [],
			api: [
				{
					name: "Combobox",
					props: [
						{ name: "items", type: "string[]", description: "items" },
						{ name: "value", type: "string", description: "value" },
						{ name: "defaultValue", type: "string", description: "defaultValue" },
						{
							name: "onValueChange",
							type: "(value: string) => void",
							description: "onValueChange",
						},
						{ name: "name", type: "string", description: "name" },
						{ name: "placeholder", type: "string", description: "placeholder" },
					],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("combobox", "searchable-select-with-placeholder"),
				title: "Searchable Select with Placeholder",
				code: '<Combobox items={["Apple", "Banana"]} placeholder="Select…" />',
				render: () => <Combobox items={["Apple", "Banana"]} placeholder="Select…" />,
			},
			{
				id: catalogScenarioId("combobox", "disabled"),
				title: "Disabled",
				code: '<Combobox disabled items={["Apple"]} placeholder="Disabled" />',
				render: () => <Combobox disabled items={["Apple"]} placeholder="Disabled" />,
			},
		],
	},
	autocomplete: {
		docs: {
			description: "Typeahead list.",
			usage: usage(
				"Autocomplete",
				"@nocoo/basalt/components/autocomplete",
				'<Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />',
			),
			variants: [],
			api: [
				{
					name: "Autocomplete",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("autocomplete", "default"),
				title: "Default",
				code: '<Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />',
				render: () => <Autocomplete items={["Apple", "Banana"]} placeholder="Search fruits" />,
			},
		],
	},
	"date-picker": {
		docs: {
			description: "Pick a date.",
			usage: `import { DatePicker } from "@nocoo/basalt/components/date-picker";

export default function Example() {
	return <DatePicker aria-label="Date" />;
}`,
			variants: [],
			api: [
				{
					name: "DatePicker",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("date-picker", "single-date-selection"),
				title: "Single Date Selection",
				code: '<DatePicker aria-label="Date" />',
				render: () => <DatePicker aria-label="Date" />,
			},
		],
	},
	slider: {
		docs: {
			description: "Range slider.",
			usage: usage("Slider", "@nocoo/basalt/components/slider", "<Slider />"),
			variants: [],
			api: [
				{
					name: "Slider",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
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
	},
	toggle: {
		docs: {
			description: "Pressed toggle.",
			usage: usage("Toggle", "@nocoo/basalt/components/toggle", "<Toggle>B</Toggle>"),
			variants: [],
			api: [
				{
					name: "Toggle",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
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
	},
	"toggle-group": {
		docs: {
			description: "Segmented tabs for switching a compact set of modes.",
			usage: usage(
				"ToggleGroup",
				"@nocoo/basalt/components/toggle-group",
				'<ToggleGroup type="single" defaultValue="live"><ToggleGroupItem value="live">Live</ToggleGroupItem></ToggleGroup>',
			),
			variants: [],
			api: [
				{
					name: "ToggleGroup",
					props: [{ name: "className", type: "string", description: "className" }],
				},
			],
			provenance: EXTRA_PROVENANCE,
		},
		examples: [
			{
				id: catalogScenarioId("toggle-group", "default"),
				title: "Default",
				code: `import { ToggleGroup } from "@nocoo/basalt/components/toggle-group";

export default function Example() {
	return <ToggleGroup type="single" defaultValue="live"><ToggleGroupItem value="live">Live</ToggleGroupItem></ToggleGroup>;
}`,
				render: () => (
					<ToggleGroup type="single" defaultValue="live" aria-label="Mode">
						<ToggleGroupItem value="live">Live</ToggleGroupItem>
						<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
						<ToggleGroupItem value="snapshot">Snapshot</ToggleGroupItem>
					</ToggleGroup>
				),
			},
		],
	},
	"segment-control": {
		docs: {
			description:
				"A controlled, labelled segmented filter with an optional All choice and horizontal overflow.",
			usage: usage(
				"SegmentControl",
				"@nocoo/basalt/components/segment-control",
				'<SegmentControl legend="Status" value="all" onValueChange={setStatus} allOption={{ value: "all" }} options={[{ value: "ready", label: "Ready" }]} />',
			),
			variants: ["all", "overflow", "disabled"],
			api: segmentControlApi,
			provenance: provenanceFromLegacy({
				repo: "basalt",
				sha: "23046c3",
				file: "src/pages/ui/UiIndexPage.tsx",
			}),
		},
		examples: SEGMENT_CONTROL_EXAMPLES,
	},
});
