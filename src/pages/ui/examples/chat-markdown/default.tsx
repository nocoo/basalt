import { ChatMarkdown } from "@nocoo/basalt/components/chat-markdown";
export default function MarkdownDemo() {
	return (
		<ChatMarkdown
			content={
				"## A grounded answer\n\n**Pistachio** leads this week.\n\n- Compare the previous period\n- Check supplier capacity\n\n```ts\nconst next = await review();\n```\n\n| Flavor | Growth |\n| --- | --- |\n| Pistachio | 23% |\n\n[Source](https://example.com/report)"
			}
		/>
	);
}
