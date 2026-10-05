import { ChatMessage } from "@nocoo/basalt/components/chat-message";
import { Thinking } from "@nocoo/basalt/components/thinking";
export default function MessageDemo() {
	return (
		<ChatMessage
			variant="assistant"
			content="**Pistachio** is up 23%. Review the source before reordering."
			trace={
				<Thinking
					steps={[{ id: "read", label: "Read sales report", status: "complete" }]}
					defaultOpen={false}
				/>
			}
			onRegenerate={() => undefined}
			onFeedback={() => undefined}
		/>
	);
}
