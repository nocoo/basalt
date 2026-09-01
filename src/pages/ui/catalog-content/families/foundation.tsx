import { Link } from "@nocoo/basalt/components/link";
import { Text } from "@nocoo/basalt/components/text";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import { provenanceFromLegacy } from "../../catalog-source";
import { BASALT_MARK_EXAMPLES } from "../../examples/basalt-mark";
import { BUTTON_EXAMPLES } from "../../examples/button";
import { LABEL_EXAMPLES } from "../../examples/label";
import { LAYER_CARD_EXAMPLES } from "../../examples/layer-card";
import { LINK_EXAMPLES } from "../../examples/link";
import { LINK_BUTTON_EXAMPLES } from "../../examples/link-button";
import { SEPARATOR_EXAMPLES } from "../../examples/separator";
import { TEXT_EXAMPLES } from "../../examples/text";
import { THEME_TOGGLE_EXAMPLES } from "../../examples/theme-toggle";
import { API as basaltMarkApi } from "../../generated/catalog-api/basalt-mark";
import { API as buttonApi } from "../../generated/catalog-api/button";
import { API as labelApi } from "../../generated/catalog-api/label";
import { API as layerCardApi } from "../../generated/catalog-api/layer-card";
import { API as linkApi } from "../../generated/catalog-api/link";
import { API as linkButtonApi } from "../../generated/catalog-api/link-button";
import { API as separatorApi } from "../../generated/catalog-api/separator";
import { API as textApi } from "../../generated/catalog-api/text";
import { API as themeToggleApi } from "../../generated/catalog-api/theme-toggle";

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

export default catalogContentFamily({
	button: {
		docs: {
			description: "Primary actions, including loading and icon slots.",
			usage: usage(
				"Button",
				"@nocoo/basalt/components/button",
				'<Button icon="+" loading={false}>Save</Button>',
			),
			variants: ["default", "secondary", "destructive", "outline", "ghost", "link"],
			api: buttonApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		},
		examples: BUTTON_EXAMPLES,
	},
	"link-button": {
		docs: {
			description: "A link that looks like a Button.",
			usage: usage(
				"LinkButton",
				"@nocoo/basalt/components/button",
				'<LinkButton href="/docs">Docs</LinkButton>',
			),
			variants: ["default", "secondary", "destructive", "outline", "ghost", "link"],
			api: linkButtonApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/button.tsx",
			}),
		},
		examples: LINK_BUTTON_EXAMPLES,
	},
	text: {
		docs: {
			description: "Body copy with size and tone.",
			usage: usage("Text", "@nocoo/basalt/components/text", "<Text tone='muted'>Copy</Text>"),
			variants: ["xs", "sm", "md", "lg", "xl"],
			api: textApi,
			provenance: provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/index.css",
			}),
		},
		examples: TEXT_EXAMPLES,
	},
	label: {
		docs: {
			description: "Accessible label associated with a control.",
			usage: usage(
				"Label",
				"@nocoo/basalt/components/label",
				'<Label htmlFor="email">Email</Label>',
			),
			variants: [],
			api: labelApi,
			provenance: provenanceFromLegacy({
				repo: "zhe",
				sha: "c31c239f01c9",
				file: "components/ui/label.tsx",
			}),
		},
		examples: LABEL_EXAMPLES,
	},
	separator: {
		docs: {
			description: "A visual divider between content.",
			usage: usage(
				"Separator",
				"@nocoo/basalt/components/separator",
				"<Separator orientation='horizontal' />",
			),
			variants: ["horizontal", "vertical"],
			api: separatorApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/ui/separator.tsx",
			}),
		},
		examples: SEPARATOR_EXAMPLES,
	},
	link: {
		docs: {
			description: "Inline navigation that respects LinkProvider.",
			usage: usage(
				"Link",
				"@nocoo/basalt/components/link",
				'<LinkProvider><Link href="/ui">Library</Link></LinkProvider>',
				'import { LinkProvider } from "@nocoo/basalt/providers/link";',
			),
			variants: [],
			api: linkApi,
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/utils/link-provider.tsx",
			}),
		},
		examples: LINK_EXAMPLES,
	},
	"theme-toggle": {
		docs: {
			description: "Cycles system, light, and dark theme.",
			usage: usage(
				"ThemeToggle",
				"@nocoo/basalt/components/theme-toggle",
				'<ThemeProvider><ThemeToggle aria-label="Toggle theme" /></ThemeProvider>',
				'import { ThemeProvider } from "@nocoo/basalt/providers/theme";',
			),
			variants: ["system", "light", "dark"],
			api: themeToggleApi,
			provenance: provenanceFromLegacy({
				repo: "basalt",
				sha: "2727ae6a8d3f",
				file: "src/components/ThemeToggle.tsx",
			}),
		},
		examples: THEME_TOGGLE_EXAMPLES,
	},
	"layer-card": {
		docs: {
			description:
				"A layered or structured card shell with consistent spacing, sections, loading, and empty states.",
			usage: usage(
				"LayerCard",
				"@nocoo/basalt/components/layer-card",
				"<LayerCard><LayerCard.Header>Title</LayerCard.Header><LayerCard.Body>Content</LayerCard.Body><LayerCard.Footer>Actions</LayerCard.Footer></LayerCard>",
			),
			variants: ["none", "sm", "md", "lg"],
			api: layerCardApi,
			provenance: provenanceFromLegacy({
				repo: "zhe",
				sha: "c31c239f01c9",
				file: "components/ui/card.tsx",
			}),
		},
		examples: LAYER_CARD_EXAMPLES,
	},
	"basalt-mark": {
		docs: {
			description: "Basalt mark.",
			usage: usage("BasaltMark", "@nocoo/basalt/components/basalt-mark", "<BasaltMark />"),
			variants: [],
			api: basaltMarkApi,
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components",
			}),
		},
		examples: BASALT_MARK_EXAMPLES,
	},
	"theme-provider": {
		docs: {
			description: "Provides theme state without reading storage at module scope.",
			usage: usage(
				"ThemeProvider",
				"@nocoo/basalt/providers/theme",
				"<ThemeProvider><span>Content</span></ThemeProvider>",
			),
			variants: ["system", "light", "dark"],
			api: [{ name: "ThemeProvider", props: [{ name: "children", type: "ReactNode" }] }],
			provenance: provenanceFromLegacy({
				repo: "pew",
				sha: "97a890fabe6e",
				file: "packages/web/src/components/theme-provider.tsx",
			}),
		},
		examples: [
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
	},
	"link-provider": {
		docs: {
			description: "Injects the app Link renderer into Basalt Link.",
			usage: usage(
				"LinkProvider",
				"@nocoo/basalt/providers/link",
				"<LinkProvider>{children}</LinkProvider>",
			),
			variants: [],
			api: [
				{
					name: "LinkProvider",
					props: [
						{
							name: "render",
							type: 'ComponentType<{ href: string }> | "a"',
							default: '"a"',
							description: "Link renderer injected into Basalt Link.",
						},
						{ name: "children", type: "ReactNode" },
					],
				},
			],
			provenance: provenanceFromLegacy({
				repo: "kumo",
				sha: "1159868dfe32",
				file: "packages/kumo/src/utils/link-provider.tsx",
			}),
		},
		examples: [
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
	},
});
