import { Button } from "@nocoo/basalt/components/button";
import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";
import { ChatComposer } from "@nocoo/basalt/components/chat-composer";
import { ChatHeader } from "@nocoo/basalt/components/chat-header";
import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import { DOCK_EXAMPLES } from "../../examples/dock";
import { FAB_EXAMPLES } from "../../examples/fab";
import { API as chatBubbleApi } from "../../generated/catalog-api/chat-bubble";
import { API as chatComposerApi } from "../../generated/catalog-api/chat-composer";
import { API as chatHeaderApi } from "../../generated/catalog-api/chat-header";
import { API as chatInboxApi } from "../../generated/catalog-api/chat-inbox";
import { API as dockApi } from "../../generated/catalog-api/dock";
import { API as fabApi } from "../../generated/catalog-api/fab";

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

function scenarioModule(code: string, imports: string[]): string {
	const importLines = imports.join("\n");
	return `${importLines}\n\nexport default function Example() {\n\treturn (\n\t\t${code.split("\n").join("\n\t\t")}\n\t);\n}`;
}

export default catalogContentFamily({
	fab: {
		docs: {
			description: "A corner launcher that hides while a dock is open.",
			usage: usage(
				"Fab",
				"@nocoo/basalt/components/fab",
				'<Fab aria-label="Open assistant"><Sparkles /></Fab>',
				'import { Sparkles } from "lucide-react";',
			),
			variants: [],
			api: fabApi,
		},
		examples: FAB_EXAMPLES,
	},
	dock: {
		docs: {
			description:
				"A right rail. Push shrinks the main column. Overlay covers the local region with a non-modal scrim.",
			usage: usage(
				"Dock, DockBody",
				"@nocoo/basalt/components/dock",
				'<Dock open aria-label="Assistant"><DockBody>Panel</DockBody></Dock>',
			),
			variants: [],
			api: dockApi,
		},
		examples: DOCK_EXAMPLES,
	},
	"chat-bubble": {
		docs: {
			description: "User, assistant, and system message chrome.",
			usage: `import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";

export default function Example() {
	return <ChatBubble variant="user">Hello</ChatBubble>;
}`,
			variants: [],
			api: chatBubbleApi,
		},
		examples: [
			{
				id: catalogScenarioId("chat-bubble", "roles"),
				title: "Roles",
				code: scenarioModule(
					`<div className="flex w-full max-w-md flex-col gap-3">
	<ChatBubble variant="system">Today</ChatBubble>
	<ChatBubble variant="user">What is the error rate?</ChatBubble>
	<ChatBubble>The 7-day error rate is 0.4%.</ChatBubble>
</div>`,
					['import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";'],
				),
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
		docs: {
			description: "Draft field with send and stop.",
			usage: `import { ChatComposer } from "@nocoo/basalt/components/chat-composer";

export default function Example() {
	return <ChatComposer onSend={() => undefined} />;
}`,
			variants: [],
			api: chatComposerApi,
		},
		examples: [
			{
				id: catalogScenarioId("chat-composer", "idle"),
				title: "Idle",
				code: scenarioModule(
					`<div className="w-full max-w-md">
	<ChatComposer placeholder="Ask about this page…" onSend={() => undefined} />
</div>`,
					['import { ChatComposer } from "@nocoo/basalt/components/chat-composer";'],
				),
				render: () => (
					<div className="w-full max-w-md">
						<ChatComposer placeholder="Ask about this page…" onSend={() => undefined} />
					</div>
				),
			},
		],
	},
	"chat-header": {
		docs: {
			description: "Title, subtitle, and trailing actions for a conversation.",
			usage: `import { ChatHeader } from "@nocoo/basalt/components/chat-header";

export default function Example() {
	return <ChatHeader title="Assistant" subtitle="Home" />;
}`,
			variants: [],
			api: chatHeaderApi,
		},
		examples: [
			{
				id: catalogScenarioId("chat-header", "with-actions"),
				title: "With actions",
				code: scenarioModule(
					`<div className="w-full max-w-md ring-1 ring-basalt-border">
	<ChatHeader
		title="Assistant"
		subtitle="Home"
		leading={<Sparkles className="h-5 w-5" />}
	>
		<Button size="icon" variant="ghost" aria-label="Close">
			<X />
		</Button>
	</ChatHeader>
</div>`,
					[
						'import { Button } from "@nocoo/basalt/components/button";',
						'import { ChatHeader } from "@nocoo/basalt/components/chat-header";',
						'import { Sparkles, X } from "lucide-react";',
					],
				),
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
		docs: {
			description: "A selectable list of conversations.",
			usage: `import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";

export default function Example() {
	return (
		<ChatInbox
			items={[{ id: "a", title: "Analytics" }]}
			activeId="a"
			onSelect={() => undefined}
		/>
	);
}`,
			variants: [],
			api: chatInboxApi,
		},
		examples: [
			{
				id: catalogScenarioId("chat-inbox", "threads"),
				title: "Threads",
				code: scenarioModule(
					`<div className="h-48 w-full max-w-xs ring-1 ring-basalt-border">
	<ChatInbox
		aria-label="Inbox"
		activeId="a"
		onSelect={() => undefined}
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
</div>`,
					[
						'import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";',
						'import { MessageCircle } from "lucide-react";',
					],
				),
				render: () => (
					<div className="h-48 w-full max-w-xs ring-1 ring-basalt-border">
						<ChatInbox
							aria-label="Inbox"
							activeId="a"
							onSelect={() => undefined}
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
