import { ChatMessage } from "@nocoo/basalt/components/chat-message";
import { Thinking } from "@nocoo/basalt/components/thinking";
export default function MessageDemo() {
	return (
		<ChatMessage
			variant="assistant"
			content="**Sleep quality** is up 23%. Review the latest wellness report before the follow-up."
			trace={
				<Thinking
					steps={[{ id: "read", label: "Read care report", status: "complete" }]}
					defaultOpen={false}
				/>
			}
			sources={[
				{
					id: "sales",
					name: "Summer care report",
					type: "CSV",
					href: "https://example.com/care",
				},
			]}
			onRegenerate={() => undefined}
			onFeedback={() => undefined}
		/>
	);
}
