import { EXTRA_DOCS } from "./catalog-ready";
import {
	type CatalogDocs,
	type CatalogDocsDraft,
	catalogDocsWithImplementation,
	provenanceFromLegacy,
} from "./catalog-source";
import { CATALOG_API } from "./generated/catalog-api";

export type { CatalogDocs };

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

const BASE_DOCS: Record<string, CatalogDocsDraft> = {
	tooltip: {
		description: "Short contextual help on hover or focus.",
		usage: usage(
			"Tooltip, TooltipTrigger, TooltipContent, TooltipProvider",
			"@nocoo/basalt/components/tooltip",
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
			'import { Button } from "@nocoo/basalt/components/button";',
		),
		variants: [],
		api: CATALOG_API.tooltip,
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/tooltip.tsx",
		}),
	},
	field: {
		description: "A labeled control with optional hint and error.",
		usage: usage(
			"Field",
			"@nocoo/basalt/components/field",
			'<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
			'import { Input } from "@nocoo/basalt/components/input";',
		),
		variants: [],
		api: CATALOG_API.field,
		provenance: provenanceFromLegacy({
			repo: "signoff.now",
			sha: "92033c89d807",
			file: "apps/web/src/components/Field.tsx",
		}),
	},
	input: {
		description: "A single-line text field. Light mode uses a white L3 surface.",
		usage: usage(
			"Input",
			"@nocoo/basalt/components/input",
			'<Input aria-label="Name" placeholder="Jane Doe" />',
		),
		variants: [],
		api: CATALOG_API.input,
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/input.tsx",
		}),
	},
	"input-area": {
		description: "A multi-line text field on the L3 surface.",
		usage: usage(
			"InputArea",
			"@nocoo/basalt/components/input-area",
			'<InputArea aria-label="Notes" placeholder="Write a note" />',
		),
		variants: [],
		api: CATALOG_API["input-area"],
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/textarea.tsx",
		}),
	},
	"input-group": {
		description: "Compose an input with addons, an inline suffix, and status icons.",
		usage: usage(
			"InputGroup",
			"@nocoo/basalt/components/input-group",
			"<InputGroup><InputGroup.Input defaultValue='atlas' aria-label='Subdomain' /><InputGroup.Suffix>.example.com</InputGroup.Suffix></InputGroup>",
		),
		variants: [],
		api: CATALOG_API["input-group"],
		provenance: provenanceFromLegacy({
			repo: "basalt",
			sha: "2727ae6a8d3f",
			file: "src/pages/FormsPage.tsx",
		}),
	},
	"sensitive-input": {
		description: "A password field with a reveal control.",
		usage: usage(
			"SensitiveInput",
			"@nocoo/basalt/components/sensitive-input",
			'<SensitiveInput aria-label="Password" revealLabel="Show" hideLabel="Hide" />',
		),
		variants: [],
		api: CATALOG_API["sensitive-input"],
		provenance: provenanceFromLegacy({
			repo: "basalt",
			sha: "2727ae6a8d3f",
			file: "src/pages/FormsPage.tsx",
		}),
	},
	checkbox: {
		description: "A check control with an indeterminate state.",
		usage: usage(
			"Checkbox",
			"@nocoo/basalt/components/checkbox",
			'<Checkbox aria-label="Subscribe" />',
		),
		variants: ["checked", "unchecked", "indeterminate"],
		api: CATALOG_API.checkbox,
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/checkbox.tsx",
		}),
	},
	radio: {
		description: "A radio button used inside RadioGroup.",
		usage: usage(
			"Radio, RadioGroup",
			"@nocoo/basalt/components/radio",
			'<RadioGroup defaultValue="a"><Radio value="a" aria-label="Alpha" /><Radio value="b" aria-label="Beta" /></RadioGroup>',
		),
		variants: [],
		api: CATALOG_API.radio,
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components",
		}),
	},
	switch: {
		description: "A binary toggle.",
		usage: usage(
			"Switch",
			"@nocoo/basalt/components/switch",
			'<Switch aria-label="Notifications" />',
		),
		variants: ["checked", "unchecked"],
		api: CATALOG_API.switch,
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/switch.tsx",
		}),
	},
	select: {
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
		api: CATALOG_API.select,
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components",
		}),
	},
};

export const CATALOG_DOCS: Record<string, CatalogDocs> = catalogDocsWithImplementation({
	...EXTRA_DOCS,
	...BASE_DOCS,
});
