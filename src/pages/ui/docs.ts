export interface CatalogDocs {
	description: string;
	usage: string;
	variants: string[];
	props: { name: string; type: string }[];
	source: { repo: string; sha: string; file: string };
}

function usage(name: string, from: string, sample: string): string {
	return `import { ${name} } from "${from}";\n\n${sample}`;
}

export const CATALOG_DOCS: Record<string, CatalogDocs> = {
	button: {
		description: "Primary actions, including loading and icon slots.",
		usage: usage(
			"Button",
			"@nocoo/basalt/components/button",
			'<Button icon="+" loading={false}>Save</Button>',
		),
		variants: ["default", "secondary", "destructive", "outline", "ghost", "link"],
		props: [
			{
				name: "variant",
				type: '"default" | "secondary" | "destructive" | "outline" | "ghost" | "link"',
			},
			{ name: "size", type: '"default" | "sm" | "lg" | "icon"' },
			{ name: "asChild", type: "boolean" },
			{ name: "loading", type: "boolean" },
			{ name: "icon", type: "ReactNode" },
		],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/button.tsx",
		},
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
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/button.tsx",
		},
	},
	text: {
		description: "Body copy with size and tone.",
		usage: usage("Text", "@nocoo/basalt/components/text", "<Text tone='muted'>Copy</Text>"),
		variants: ["xs", "sm", "md", "lg", "xl"],
		props: [
			{ name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"' },
			{ name: "tone", type: '"default" | "muted"' },
		],
		source: { repo: "basalt", sha: "2727ae6a8d3f", file: "src/index.css" },
	},
	label: {
		description: "Accessible label associated with a control.",
		usage: usage("Label", "@nocoo/basalt/components/label", '<Label htmlFor="email">Email</Label>'),
		variants: [],
		props: [{ name: "htmlFor", type: "string" }],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/label.tsx",
		},
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
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/separator.tsx",
		},
	},
	link: {
		description: "Inline navigation that respects LinkProvider.",
		usage: usage("Link", "@nocoo/basalt/components/link", '<Link href="/ui">Library</Link>'),
		variants: [],
		props: [{ name: "href", type: "string" }],
		source: {
			repo: "kumo",
			sha: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		},
	},
	tooltip: {
		description: "Short contextual help on hover or focus.",
		usage: usage(
			"Tooltip, TooltipTrigger, TooltipContent, TooltipProvider",
			"@nocoo/basalt/components/tooltip",
			"<Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip>",
		),
		variants: [],
		props: [{ name: "delayDuration", type: "number" }],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/tooltip.tsx",
		},
	},
	"theme-toggle": {
		description: "Cycles system, light, and dark theme.",
		usage: usage(
			"ThemeToggle",
			"@nocoo/basalt/components/theme-toggle",
			'<ThemeToggle aria-label="Toggle theme" />',
		),
		variants: ["system", "light", "dark"],
		props: [{ name: "aria-label", type: "string" }],
		source: { repo: "basalt", sha: "2727ae6a8d3f", file: "src/components/ThemeToggle.tsx" },
	},
	"layer-card": {
		description: "A surface for grouping content.",
		usage: usage(
			"LayerCard",
			"@nocoo/basalt/components/layer-card",
			'<LayerCard surface="bordered">Content</LayerCard>',
		),
		variants: ["plain", "bordered"],
		props: [{ name: "surface", type: '"plain" | "bordered"' }],
		source: { repo: "pika", sha: "d9b12caf26a4", file: "packages/web/src/components/ui/card.tsx" },
	},
	field: {
		description: "A labeled control with optional hint and error.",
		usage: usage(
			"Field",
			"@nocoo/basalt/components/field",
			'<Field label="Email" htmlFor="email" hint="Never shared"><Input id="email" /></Field>',
		),
		variants: [],
		props: [
			{ name: "label", type: "string" },
			{ name: "htmlFor", type: "string" },
			{ name: "hint", type: "string" },
			{ name: "error", type: "string" },
		],
		source: { repo: "signoff.now", sha: "92033c89d807", file: "apps/web/src/components/Field.tsx" },
	},
	input: {
		description: "A single-line text field. Light mode uses a white L3 surface.",
		usage: usage("Input", "@nocoo/basalt/components/input", '<Input placeholder="Jane Doe" />'),
		variants: [],
		props: [{ name: "type", type: "string" }],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/input.tsx",
		},
	},
	"input-area": {
		description: "A multi-line text field on the L3 surface.",
		usage: usage(
			"InputArea",
			"@nocoo/basalt/components/input-area",
			'<InputArea placeholder="Write a note" />',
		),
		variants: [],
		props: [{ name: "rows", type: "number" }],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/textarea.tsx",
		},
	},
	"input-group": {
		description: "Lay out an input beside an action.",
		usage: usage(
			"InputGroup",
			"@nocoo/basalt/components/input-group",
			"<InputGroup><Input /><Button>Go</Button></InputGroup>",
		),
		variants: [],
		props: [],
		source: { repo: "basalt", sha: "2727ae6a8d3f", file: "src/pages/FormsPage.tsx" },
	},
	"sensitive-input": {
		description: "A password field with a reveal control.",
		usage: usage(
			"SensitiveInput",
			"@nocoo/basalt/components/sensitive-input",
			'<SensitiveInput revealLabel="Show" hideLabel="Hide" />',
		),
		variants: [],
		props: [
			{ name: "revealLabel", type: "string" },
			{ name: "hideLabel", type: "string" },
		],
		source: { repo: "basalt", sha: "2727ae6a8d3f", file: "src/pages/FormsPage.tsx" },
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
		source: {
			repo: "pika",
			sha: "d9b12caf26a4",
			file: "packages/web/src/components/ui/checkbox.tsx",
		},
	},
	radio: {
		description: "A radio button used inside RadioGroup.",
		usage: usage(
			"Radio, RadioGroup",
			"@nocoo/basalt/components/radio",
			'<RadioGroup defaultValue="a"><Radio value="a" /></RadioGroup>',
		),
		variants: [],
		props: [{ name: "value", type: "string" }],
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/radio-group.tsx",
		},
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
		source: {
			repo: "meowth",
			sha: "bb02d5a18e00",
			file: "apps/dashboard/src/components/ui/switch.tsx",
		},
	},
	"theme-provider": {
		description: "Provides theme state without reading storage at module scope.",
		usage: usage(
			"ThemeProvider",
			"@nocoo/basalt/providers/theme",
			"<ThemeProvider>{children}</ThemeProvider>",
		),
		variants: ["system", "light", "dark"],
		props: [{ name: "children", type: "ReactNode" }],
		source: {
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/theme-provider.tsx",
		},
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
			{ name: "component", type: "ComponentType<{ href: string }>" },
			{ name: "children", type: "ReactNode" },
		],
		source: {
			repo: "kumo",
			sha: "1159868dfe32",
			file: "packages/kumo/src/utils/link-provider.tsx",
		},
	},
};
