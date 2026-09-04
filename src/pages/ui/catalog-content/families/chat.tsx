import { Button } from "@nocoo/basalt/components/button";
import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";
import { ChatComposer } from "@nocoo/basalt/components/chat-composer";
import { ChatHeader } from "@nocoo/basalt/components/chat-header";
import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import type { CatalogDocsDraft } from "../../catalog-source";
import { DOCK_EXAMPLES } from "../../examples/dock";
import { FAB_EXAMPLES } from "../../examples/fab";
import { API as dockApi } from "../../generated/catalog-api/dock";
import { API as fabApi } from "../../generated/catalog-api/fab";

function extraDocs(
	name: string,
	slug: string,
	description: string,
	sample: string,
	props: { name: string; type: string; required?: boolean; default?: string }[],
): CatalogDocsDraft {
	return {
		description,
		usage: `import { ${name} } from "@nocoo/basalt/components/${slug}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
		variants: [],
		api: [
			{
				name,
				props: props.map((prop) => ({
					...prop,
					required: prop.required ?? false,
					description: prop.name,
				})),
			},
		],
	};
}

function usage(name: string, from: string, sample: string): string {
	return `import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

export default catalogContentFamily({
	fab: {
		docs: {
			description: "A corner launcher that hides while a dock is open.",
			usage: usage(
				"Fab",
				"@nocoo/basalt/components/fab",
				'<Fab aria-label="Open assistant"><Sparkles /></Fab>',
			),
			variants: [],
			api: fabApi,
		},
		examples: FAB_EXAMPLES,
	},
	dock: {
		docs: {
			description:
				"A right rail. Push shrinks the main column. Overlay covers it with a Dialog scrim.",
			usage: usage(
				"Dock",
				"@nocoo/basalt/components/dock",
				'<Dock open aria-label="Assistant"><DockBody>Panel</DockBody></Dock>',
			),
			variants: [],
			api: dockApi,
		},
		examples: DOCK_EXAMPLES,
	},
	"chat-bubble": {
		docs: extraDocs(
			"ChatBubble",
			"chat-bubble",
			"User, assistant, and system message chrome.",
			'<ChatBubble variant="user">Hello</ChatBubble>',
			[
				{ name: "variant", type: '"assistant" | "system" | "user"', default: '"assistant"' },
				{ name: "streaming", type: "boolean", default: "false" },
				{ name: "className", type: "string" },
			],
		),
		examples: [
			{
				id: catalogScenarioId("chat-bubble", "roles"),
				title: "Roles",
				code: `<ChatBubble variant="system">Today</ChatBubble>
<ChatBubble variant="user">What is the error rate?</ChatBubble>
<ChatBubble>The 7-day error rate is 0.4%.</ChatBubble>`,
				render: () => (
					<div className="flex w-full max-w-md flex-col gap-3">
						<ChatBubble variant="system">Today</ChatBubble>
						<ChatBubble variant="user">What is the error rate?</ChatBubble>
						<ChatBubble>The 7-day error rate is 0.4%.</ChatBubble>
					</div>
				),
			},
		],
	},
	"chat-composer": {
		docs: extraDocs(
			"ChatComposer",
			"chat-composer",
			"Draft field with send and stop.",
			"<ChatComposer onSend={() => undefined} />",
			[
				{ name: "disabled", type: "boolean", default: "false" },
				{ name: "streaming", type: "boolean", default: "false" },
				{ name: "label", type: "string", default: '"Message"' },
				{ name: "placeholder", type: "string" },
				{ name: "onSend", type: "(text: string) => void", required: true },
				{ name: "onCancel", type: "() => void" },
				{ name: "className", type: "string" },
			],
		),
		examples: [
			{
				id: catalogScenarioId("chat-composer", "idle"),
				title: "Idle",
				code: '<ChatComposer placeholder="Ask about this page…" onSend={() => undefined} />',
				render: () => (
					<div className="w-full max-w-md">
						<ChatComposer placeholder="Ask about this page…" onSend={() => undefined} />
					</div>
				),
			},
		],
	},
	"chat-header": {
		docs: extraDocs(
			"ChatHeader",
			"chat-header",
			"Title, subtitle, and trailing actions for a conversation.",
			'<ChatHeader title="Assistant" subtitle="Home" />',
			[
				{ name: "title", type: "React.ReactNode", required: true },
				{ name: "subtitle", type: "React.ReactNode" },
				{ name: "leading", type: "React.ReactNode" },
				{ name: "className", type: "string" },
			],
		),
		examples: [
			{
				id: catalogScenarioId("chat-header", "with-actions"),
				title: "With actions",
				code: `<ChatHeader title="Assistant" subtitle="Home" leading={<Sparkles className="h-5 w-5" />}>
  <Button size="icon" variant="ghost" aria-label="Close"><X /></Button>
</ChatHeader>`,
				render: () => (
					<div className="w-full max-w-md ring-1 ring-basalt-border">
						<ChatHeader
							title="Assistant"
							subtitle="Home"
							leading={<Sparkles className="h-5 w-5" />}
						>
							<Button size="icon" variant="ghost" aria-label="Close">
								<X />
							</Button>
						</ChatHeader>
					</div>
				),
			},
		],
	},
	"chat-inbox": {
		docs: extraDocs(
			"ChatInbox",
			"chat-inbox",
			"A selectable list of conversations.",
			"<ChatInbox items={items} activeId={items[0].id} />",
			[
				{ name: "items", type: "readonly ChatInboxItem[]", required: true },
				{ name: "activeId", type: "string" },
				{ name: "onSelect", type: "(id: string) => void" },
				{ name: "className", type: "string" },
			],
		),
		examples: [
			{
				id: catalogScenarioId("chat-inbox", "threads"),
				title: "Threads",
				code: `<ChatInbox
  activeId="a"
  items={[
    { id: "a", title: "Analytics", preview: "Ask about usage", time: "2m" },
    { id: "b", title: "Quality", preview: "Error rate", time: "1h" },
  ]}
/>`,
				render: () => (
					<div className="h-48 w-full max-w-xs ring-1 ring-basalt-border">
						<ChatInbox
							aria-label="Inbox"
							activeId="a"
							items={[
								{
									id: "a",
									title: "Analytics",
									preview: "Ask about usage",
									time: "2m",
									leading: <MessageCircle className="h-4 w-4" />,
								},
								{
									id: "b",
									title: "Quality",
									preview: "Error rate",
									time: "1h",
									leading: <MessageCircle className="h-4 w-4" />,
								},
							]}
						/>
					</div>
				),
			},
		],
	},
});
