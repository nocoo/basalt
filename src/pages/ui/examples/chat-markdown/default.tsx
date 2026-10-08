import { ChatMarkdown } from "@nocoo/basalt/components/chat-markdown";
export default function MarkdownDemo() {
	return (
		<ChatMarkdown
			content={
				"## A grounded answer\n\n**Sleep quality** leads this week.\n\n- Compare the previous period\n- Check care team capacity\n\n```ts\nconst next = await review();\n```\n\n| Care area | Growth |\n| --- | --- |\n| Sleep quality | 23% |\n\n[Source](https://example.com/report)"
			}
		/>
	);
}
