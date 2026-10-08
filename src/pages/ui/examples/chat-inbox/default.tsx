import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function ChatInboxExample() {
	const [activeId, setActiveId] = useState("a");
	return (
		<ChatInbox
			className="w-full max-w-xs"
			aria-label="Inbox"
			activeId={activeId}
			onSelect={setActiveId}
			items={[
				{
					id: "a",
					title: "Analytics",
					preview: "Ask about usage",
					time: "2m",
					leading: <MessageCircle className="size-basalt-icon-lg" />,
				},
				{
					id: "b",
					title: "Quality",
					preview: "Error rate",
					time: "1h",
					leading: <MessageCircle className="size-basalt-icon-lg" />,
				},
			]}
		/>
	);
}
