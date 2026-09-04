import { Button } from "@nocoo/basalt/components/button";
import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";
import { ChatComposer } from "@nocoo/basalt/components/chat-composer";
import { ChatHeader } from "@nocoo/basalt/components/chat-header";
import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { Dock } from "@nocoo/basalt/components/dock";
import { Fab } from "@nocoo/basalt/components/fab";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Eraser, MessageCircle, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const THREADS = [
	{
		id: "analytics",
		title: "Analytics",
		preview: "7-day error rate is 0.4%.",
		time: "2m",
	},
	{
		id: "quality",
		title: "Quality",
		preview: "Crash-free sessions held.",
		time: "1h",
	},
] as const;

const MESSAGES: Record<
	string,
	{ id: string; variant: "user" | "assistant" | "system"; text: string }[]
> = {
	analytics: [
		{ id: "s1", variant: "system", text: "Today" },
		{ id: "u1", variant: "user", text: "What is the error rate?" },
		{ id: "a1", variant: "assistant", text: "The 7-day error rate is 0.4%." },
	],
	quality: [
		{ id: "s2", variant: "system", text: "Yesterday" },
		{ id: "u2", variant: "user", text: "Are sessions crash-free?" },
		{ id: "a2", variant: "assistant", text: "Crash-free sessions held at 99.8%." },
	],
};

export default function ChatPage() {
	const { t } = useTranslation();
	const [open, setOpen] = useState(true);
	const [activeId, setActiveId] = useState("analytics");
	const thread = THREADS.find((item) => item.id === activeId) ?? THREADS[0];
	const messages = MESSAGES[activeId] ?? [];

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.chat.title")} description={t("pages.chat.description")} />

			<SectionRule title={t("pages.chat.dock")} hint={t("pages.chat.dockHint")}>
				<div className="relative flex h-[32rem] overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
					<div className="min-w-0 flex-1 bg-basalt-secondary p-6 text-sm text-basalt-muted-foreground">
						{t("pages.chat.pageBody")}
					</div>
					<Dock open={open} width="20rem" aria-label={t("pages.chat.assistant")} className="h-full">
						<div className="flex h-full flex-col bg-basalt-card ring-1 ring-basalt-border/40">
							<ChatHeader
								title={t("pages.chat.assistant")}
								subtitle={thread?.title}
								leading={<Sparkles className="h-5 w-5" />}
							>
								<Button
									size="icon"
									variant="ghost"
									aria-label={t("common.close")}
									onClick={() => setOpen(false)}
								>
									<X />
								</Button>
							</ChatHeader>
							<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
								{messages.map((message) => (
									<ChatBubble key={message.id} variant={message.variant}>
										{message.text}
									</ChatBubble>
								))}
							</div>
							<ChatComposer placeholder={t("pages.chat.placeholder")} onSend={() => undefined} />
						</div>
					</Dock>
					<Fab
						open={open}
						aria-label={t("pages.chat.openAssistant")}
						className="absolute right-4 bottom-4"
						onClick={() => setOpen(true)}
					>
						<Sparkles />
					</Fab>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.chat.inbox")} hint={t("pages.chat.inboxHint")}>
				<div className="flex h-[32rem] overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border">
					<ChatInbox
						aria-label={t("pages.chat.inbox")}
						className="w-56 shrink-0 border-r border-basalt-border"
						activeId={activeId}
						onSelect={setActiveId}
						items={THREADS.map((item) => ({
							...item,
							leading: <MessageCircle className="h-4 w-4" />,
						}))}
					/>
					<div className="flex min-w-0 flex-1 flex-col">
						<ChatHeader
							title={thread?.title ?? t("pages.chat.assistant")}
							subtitle={t("pages.chat.stream")}
							leading={<MessageCircle className="h-5 w-5" />}
						>
							<Button size="icon" variant="ghost" aria-label={t("pages.chat.clear")}>
								<Eraser />
							</Button>
						</ChatHeader>
						<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
							{messages.map((message) => (
								<ChatBubble key={message.id} variant={message.variant}>
									{message.text}
								</ChatBubble>
							))}
						</div>
						<ChatComposer placeholder={t("pages.chat.placeholder")} onSend={() => undefined} />
					</div>
				</div>
			</SectionRule>
		</div>
	);
}
