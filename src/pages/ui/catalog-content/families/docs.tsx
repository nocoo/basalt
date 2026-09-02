import { Button } from "@nocoo/basalt/components/button";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { Text } from "@nocoo/basalt/components/text";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	BASALT_IMPLEMENTATION_OWNER,
	BASALT_IMPLEMENTATION_REF,
	BASALT_IMPLEMENTATION_REPO,
	type GitHubSource,
} from "../../catalog-source";

function source(file: string): GitHubSource {
	return {
		owner: BASALT_IMPLEMENTATION_OWNER,
		repo: BASALT_IMPLEMENTATION_REPO,
		ref: BASALT_IMPLEMENTATION_REF,
		file,
	};
}

const INSTALL_USAGE = `npm install @nocoo/basalt

import { Button } from "@nocoo/basalt";
import "@nocoo/basalt/styles/standalone";`;

const CONTRIBUTE_USAGE = `bun install
bun run test
bun run package:prepublish`;

const COLORS_USAGE = `@import "@nocoo/basalt/styles/tailwind";

.example {
  background: hsl(var(--basalt-primary));
}`;

const A11Y_USAGE = `import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";

<Field label="Name">
  <Input name="name" />
</Field>`;

const CHANGELOG_USAGE = `See CHANGELOG.md in the repository root.
The published package version matches the latest section.`;

const FIGMA_USAGE = `Basalt does not ship a Figma kit.
Use the CSS tokens in packages/basalt/src/styles/tokens.css.`;

const CLI_USAGE = `Basalt has no CLI.
Install the package from npm and import the controls you need.`;

const SKILL_USAGE = `Basalt does not ship a design-skill package.
Token and component contracts live in the npm package.`;

const REGISTRY_USAGE = `Basalt is not a copy-paste registry.
Consume @nocoo/basalt from npm with granular exports.`;

export default catalogContentFamily({
	installation: {
		docs: {
			description: "Install @nocoo/basalt and choose Tailwind or standalone CSS.",
			usage: INSTALL_USAGE,
			variants: ["tailwind", "standalone"],
			api: [],
			implementationSource: source("packages/basalt/README.md"),
		},
		examples: [
			{
				id: catalogScenarioId("installation", "default"),
				title: "Install",
				code: INSTALL_USAGE,
				render: () => <Button>Save</Button>,
			},
		],
	},
	contributing: {
		docs: {
			description: "Run the in-repo gates before sending a change.",
			usage: CONTRIBUTE_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/README.md"),
		},
		examples: [
			{
				id: catalogScenarioId("contributing", "default"),
				title: "Gates",
				code: CONTRIBUTE_USAGE,
				render: () => <Text>bun run test</Text>,
			},
		],
	},
	colors: {
		docs: {
			description: "Basalt tokens use --basalt-* variables and bg-basalt-* utilities.",
			usage: COLORS_USAGE,
			variants: ["light", "dark"],
			api: [],
			implementationSource: source("packages/basalt/src/styles/tokens.css"),
		},
		examples: [
			{
				id: catalogScenarioId("colors", "default"),
				title: "Primary",
				code: COLORS_USAGE,
				render: () => <div className="bg-basalt-primary h-10 w-10 rounded-basalt-md" />,
			},
		],
	},
	accessibility: {
		docs: {
			description: "Controls expose names, labels, and focus rings. Pair Field with Input.",
			usage: A11Y_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/src/components/overlay.ts"),
		},
		examples: [
			{
				id: catalogScenarioId("accessibility", "default"),
				title: "Labeled field",
				code: A11Y_USAGE,
				render: () => (
					<Field label="Name">
						<Input name="name" />
					</Field>
				),
			},
		],
	},
	figma: {
		docs: {
			description: "There is no Figma kit. Design from the shipped CSS tokens.",
			usage: FIGMA_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/src/styles/tokens.css"),
		},
		examples: [
			{
				id: catalogScenarioId("figma", "default"),
				title: "Tokens",
				code: FIGMA_USAGE,
				render: () => <Text>Use CSS tokens, not a Figma file.</Text>,
			},
		],
	},
	cli: {
		docs: {
			description: "There is no Basalt CLI. Install the npm package.",
			usage: CLI_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/README.md"),
		},
		examples: [
			{
				id: catalogScenarioId("cli", "default"),
				title: "Package",
				code: CLI_USAGE,
				render: () => <Text>npm install @nocoo/basalt</Text>,
			},
		],
	},
	skill: {
		docs: {
			description: "There is no separate design-skill package. The npm package is the contract.",
			usage: SKILL_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/README.md"),
		},
		examples: [
			{
				id: catalogScenarioId("skill", "default"),
				title: "Contract",
				code: SKILL_USAGE,
				render: () => <Text>The package is the contract.</Text>,
			},
		],
	},
	registry: {
		docs: {
			description: "Basalt is an npm package with granular exports, not a copy-paste registry.",
			usage: REGISTRY_USAGE,
			variants: [],
			api: [],
			implementationSource: source("packages/basalt/README.md"),
		},
		examples: [
			{
				id: catalogScenarioId("registry", "default"),
				title: "Exports",
				code: REGISTRY_USAGE,
				render: () => <Text>import from @nocoo/basalt</Text>,
			},
		],
	},
	changelog: {
		docs: {
			description: "Release notes live in the repository CHANGELOG.",
			usage: CHANGELOG_USAGE,
			variants: [],
			api: [],
			implementationSource: source("CHANGELOG.md"),
		},
		examples: [
			{
				id: catalogScenarioId("changelog", "default"),
				title: "Changelog",
				code: CHANGELOG_USAGE,
				render: () => <Text>Keep a Changelog</Text>,
			},
		],
	},
});
