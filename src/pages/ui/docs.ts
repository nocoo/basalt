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
	button: {
		description: "Primary actions, including loading and icon slots.",
		usage: usage(
			"Button",
			"@nocoo/basalt/components/button",
			'<Button icon="+" loading={false}>Save</Button>',
		),
		variants: ["default", "secondary", "destructive", "outline", "ghost", "link"],
		props: CATALOG_API.button,
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/button.tsx",
		}),
	},
	"link-button": {
		description: "A link that looks like a Button.",
		usage: usage(
			"LinkButton",
			"@nocoo/basalt/components/button",
			'<LinkButton href="/docs">Docs</LinkButton>',
		),
		variants: ["default", "secondary", "destructive", "outline", "ghost", "link"],
		props: [
			{
				name: "variant",
				type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
			},
			{ name: "size", type: '"default" | "sm" | "lg" | "icon"' },
			{ name: "icon", type: "ReactNode" },
			{ name: "href", type: "string" },
		],
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/button.tsx",
		}),
	},
	text: {
		description: "Body copy with size and tone.",
		usage: usage("Text", "@nocoo/basalt/components/text", "<Text tone='muted'>Copy</Text>"),
		variants: ["xs", "sm", "md", "lg", "xl"],
		props: [
			{ name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"' },
			{ name: "tone", type: '"default" | "muted"' },
		],
		provenance: provenanceFromLegacy({
			repo: "basalt",
			sha: "2727ae6a8d3f",
			file: "src/index.css",
		}),
	},
	label: {
		description: "Accessible label associated with a control.",
		usage: usage("Label", "@nocoo/basalt/components/label", '<Label htmlFor="email">Email</Label>'),
		variants: [],
		props: [
			{ name: "htmlFor", type: "string" },
			{
				name: "showOptional",
				type: "boolean",
				default: "false",
				description: "Show gray (optional) after the label.",
			},
			{
				name: "tooltip",
				type: "ReactNode",
				description: "Info icon with hover text.",
			},
		],
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/label.tsx",
		}),
	},
	separator: {
		description: "A visual divider between content.",
		usage: usage(
			"Separator",
			"@nocoo/basalt/components/separator",
			"<Separator orientation='horizontal' />",
		),
		variants: ["horizontal", "vertical"],
		props: [
			{ name: "orientation", type: '"horizontal" | "vertical"' },
			{ name: "decorative", type: "boolean" },
		],
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/separator.tsx",
		}),
	},
	link: {
		description: "Inline navigation that respects LinkProvider.",
		usage: usage(
			"Link",
			"@nocoo/basalt/components/link",
			'<LinkProvider><Link href="/ui">Library</Link></LinkProvider>',
			'import { LinkProvider } from "@nocoo/basalt/providers/link";',
		),
		variants: [],
		props: [{ name: "href", type: "string" }],
		provenance: provenanceFromLegacy({
			repo: "kumo",
			sha: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		}),
	},
	tooltip: {
		description: "Short contextual help on hover or focus.",
		usage: usage(
			"Tooltip, TooltipTrigger, TooltipContent, TooltipProvider",
			"@nocoo/basalt/components/tooltip",
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
			'import { Button } from "@nocoo/basalt/components/button";',
		),
		variants: [],
		props: [
			{
				name: "delayDuration",
				type: "number",
				default: "700",
				description: "Delay before the tooltip opens, in milliseconds.",
			},
		],
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/tooltip.tsx",
		}),
	},
	"theme-toggle": {
		description: "Cycles system, light, and dark theme.",
		usage: usage(
			"ThemeToggle",
			"@nocoo/basalt/components/theme-toggle",
			'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
			'import { ThemeProvider } from "@nocoo/basalt/providers/theme";',
		),
		variants: ["system", "light", "dark"],
		props: [
			{
				name: "aria-label",
				type: "string",
				description: "Accessible name for the toggle.",
			},
		],
		provenance: provenanceFromLegacy({
			repo: "basalt",
			sha: "2727ae6a8d3f",
			file: "src/components/ThemeToggle.tsx",
		}),
	},
	"layer-card": {
		description: "A card with a layered visual effect for headers and raised content.",
		usage: usage(
			"LayerCard",
			"@nocoo/basalt/components/layer-card",
			"<LayerCard><LayerCard.Secondary>Next Steps</LayerCard.Secondary><LayerCard.Primary>Hello</LayerCard.Primary></LayerCard>",
		),
		variants: [],
		props: [{ name: "className", type: "string" }],
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/card.tsx",
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
		props: [
			{ name: "label", type: "string", description: "Visible label text." },
			{
				name: "htmlFor",
				type: "string",
				description: "Associates the label and described-by ids.",
			},
			{ name: "hint", type: "string", description: "Supporting text when there is no error." },
			{
				name: "error",
				type: "string",
				description: "Replaces the hint and marks the control invalid.",
			},
		],
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
		props: [{ name: "type", type: "string" }],
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
		props: [{ name: "rows", type: "number" }],
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
		props: [
			{ name: "InputGroup.Input", type: "input", description: "The editable value." },
			{
				name: "InputGroup.Suffix",
				type: "ReactNode",
				description: "Inline text that sits against the value, such as a domain.",
			},
			{
				name: "InputGroup.Addon",
				type: '"start" | "end"',
				description: "Leading or trailing icons, text, or buttons.",
			},
			{ name: "InputGroup.Button", type: "button", description: "Compact action inside an addon." },
		],
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
		props: [
			{ name: "revealLabel", type: "string" },
			{ name: "hideLabel", type: "string" },
		],
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
		props: [{ name: "checked", type: 'boolean | "indeterminate"' }],
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
		props: [{ name: "value", type: "string" }],
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
		props: [{ name: "checked", type: "boolean" }],
		provenance: provenanceFromLegacy({
			repo: "zhe",
			sha: "c31c239f01c9",
			file: "components/ui/switch.tsx",
		}),
	},
	"theme-provider": {
		description: "Provides theme state without reading storage at module scope.",
		usage: usage(
			"ThemeProvider",
			"@nocoo/basalt/providers/theme",
			"<ThemeProvider><span>Content</span></ThemeProvider>",
		),
		variants: ["system", "light", "dark"],
		props: [{ name: "children", type: "ReactNode" }],
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/theme-provider.tsx",
		}),
	},
	"link-provider": {
		description: "Injects the app Link renderer into Basalt Link.",
		usage: usage(
			"LinkProvider",
			"@nocoo/basalt/providers/link",
			"<LinkProvider>{children}</LinkProvider>",
		),
		variants: [],
		props: [
			{
				name: "render",
				type: 'ComponentType<{ href: string }> | "a"',
				default: '"a"',
				description: "Link renderer injected into Basalt Link.",
			},
			{ name: "children", type: "ReactNode" },
		],
		provenance: provenanceFromLegacy({
			repo: "kumo",
			sha: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		}),
	},
};

export const CATALOG_DOCS: Record<string, CatalogDocs> = catalogDocsWithImplementation({
	...EXTRA_DOCS,
	...BASE_DOCS,
});
