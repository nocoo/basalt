import { Button } from "@nocoo/basalt/components/button";
import { ChatBubble } from "@nocoo/basalt/components/chat-bubble";
import { ChatComposer } from "@nocoo/basalt/components/chat-composer";
import { ChatHeader } from "@nocoo/basalt/components/chat-header";
import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Dock } from "@nocoo/basalt/components/dock";
import { Fab } from "@nocoo/basalt/components/fab";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { ArrowLeft, Eraser, MessageCircle, Sparkles, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatViewModel } from "@/viewmodels/useChatViewModel";

type ChatVM = ReturnType<typeof useChatViewModel>;

function Conversation({ vm }: { vm: ChatVM }) {
	const { t } = useTranslation();
	const log = useRef<HTMLDivElement>(null);
	const failId = useId();
	const follow = useRef(true);
	// biome-ignore lint/correctness/useExhaustiveDependencies: New message content triggers scroll measurement, while user scrolling keeps ownership.
	useEffect(() => {
		if (follow.current && log.current) log.current.scrollTop = log.current.scrollHeight;
	}, [vm.messages]);
	return (
		<>
			<div
				ref={log}
				role="log"
				aria-label={t("demo.messages")}
				aria-live="polite"
				aria-relevant="additions text"
				className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
				onScroll={(event) => {
					const node = event.currentTarget;
					follow.current = node.scrollHeight - node.scrollTop - node.clientHeight < 48;
				}}
			>
				{vm.messages.length === 0 && (
					<p className="text-sm text-muted-foreground">{t("demo.emptyChat")}</p>
				)}
				{vm.messages.map((message) => (
					<ChatBubble key={message.id} variant={message.variant}>
						<span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
							{message.text || t("demo.thinking")}
						</span>
					</ChatBubble>
				))}
			</div>
			<div className="shrink-0 space-y-1 border-t border-border px-3 py-2 text-xs">
				<div className="flex items-center gap-2">
					<Checkbox
						id={failId}
						checked={vm.failNext}
						disabled={vm.status === "streaming"}
						onCheckedChange={(value) => vm.setFailNext(value === true)}
					/>
					<label htmlFor={failId}>{t("demo.failNextReply")}</label>
				</div>
				{vm.status !== "idle" && (
					<p
						role={vm.status === "error" ? "alert" : "status"}
						className={vm.status === "error" ? "text-destructive" : "text-muted-foreground"}
					>
						{t(`demo.chat_${vm.status}`)}
						{(vm.status === "error" || vm.status === "stopped") && (
							<Button size="sm" variant="ghost" onClick={vm.retry}>
								{t("demo.retry")}
							</Button>
						)}
					</p>
				)}
			</div>
			<ChatComposer
				key={vm.activeId}
				label={t("pages.chat.message")}
				placeholder={t("pages.chat.placeholder")}
				sendLabel={t("pages.chat.send")}
				cancelLabel={t("pages.chat.stop")}
				streaming={vm.status === "streaming"}
				onCancel={vm.stop}
				onSend={(text) => {
					follow.current = true;
					vm.send(text);
				}}
			/>
		</>
	);
}

function AssistantChat({ onClose }: { onClose: () => void }) {
	const { t } = useTranslation();
	const vm = useChatViewModel();
	return (
		<>
			<ChatHeader
				title={t("pages.chat.assistant")}
				subtitle={t("demo.localChat")}
				leading={<Sparkles className="h-5 w-5" />}
			>
				<Button size="icon" variant="ghost" aria-label={t("pages.chat.clear")} onClick={vm.clear}>
					<Eraser />
				</Button>
				<Button
					size="icon"
					variant="ghost"
					aria-label={t("common.close")}
					onClick={() => {
						vm.stop();
						onClose();
					}}
				>
					<X />
				</Button>
			</ChatHeader>
			<Conversation vm={vm} />
		</>
	);
}

export default function ChatPage() {
	const { t } = useTranslation();
	const mobile = useIsMobile();
	const [pushOpen, setPushOpen] = useState(true);
	const [overlayOpen, setOverlayOpen] = useState(false);
	const [detailOpen, setDetailOpen] = useState(false);
	const inbox = useChatViewModel();
	const opener = useRef<HTMLElement | null>(null);
	const detail = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!mobile) return;
		if (detailOpen) detail.current?.querySelector<HTMLButtonElement>("button")?.focus();
		else if (opener.current?.isConnected) opener.current.focus();
	}, [mobile, detailOpen]);

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.chat.title")} description={t("pages.chat.description")} />
			<p className="text-sm text-muted-foreground">{t("demo.localOnly")}</p>
			<SectionRule title={t("pages.chat.dock")} hint={t("pages.chat.dockHint")}>
				<div
					data-chat-demo="push"
					className="relative flex h-[min(32rem,80dvh)] min-h-80 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border"
				>
					<div className="min-w-0 flex-1 bg-basalt-secondary p-6 text-sm text-basalt-muted-foreground">
						{t("pages.chat.pageBody")}
					</div>
					<Dock
						open={pushOpen}
						mode={mobile ? "overlay" : "push"}
						width={mobile ? "100%" : "20rem"}
						aria-label={t("pages.chat.assistant")}
						className="h-full"
						onDismiss={() => setPushOpen(false)}
					>
						<AssistantChat onClose={() => setPushOpen(false)} />
					</Dock>
					<Fab
						open={pushOpen}
						placement="absolute"
						aria-label={t("pages.chat.openAssistant")}
						onClick={() => setPushOpen(true)}
					>
						<Sparkles />
					</Fab>
				</div>
			</SectionRule>
			<SectionRule title={t("pages.chat.overlay")} hint={t("pages.chat.overlayHint")}>
				<div
					data-chat-demo="overlay"
					className="relative flex h-[min(32rem,80dvh)] min-h-80 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border"
				>
					<div className="min-w-0 flex-1 bg-basalt-secondary p-6 text-sm text-basalt-muted-foreground">
						{t("pages.chat.overlayBody")}
					</div>
					<Dock
						mode="overlay"
						open={overlayOpen}
						width={mobile ? "100%" : "20rem"}
						aria-label={t("pages.chat.overlayAssistant")}
						className="h-full"
						dismissLabel={t("pages.chat.dismiss")}
						onDismiss={() => setOverlayOpen(false)}
					>
						<AssistantChat onClose={() => setOverlayOpen(false)} />
					</Dock>
					<Fab
						open={overlayOpen}
						placement="absolute"
						aria-label={t("pages.chat.openOverlay")}
						onClick={() => setOverlayOpen(true)}
					>
						<Sparkles />
					</Fab>
				</div>
			</SectionRule>
			<SectionRule title={t("pages.chat.inbox")} hint={t("pages.chat.inboxHint")}>
				<div
					data-chat-demo="inbox"
					className="flex h-[min(32rem,80dvh)] min-h-80 overflow-hidden rounded-basalt-lg ring-1 ring-basalt-border"
				>
					<ChatInbox
						aria-label={t("pages.chat.inbox")}
						activeId={inbox.activeId}
						className={
							mobile
								? detailOpen
									? "hidden"
									: "w-full"
								: "w-56 shrink-0 border-r border-basalt-border"
						}
						inert={mobile && detailOpen}
						onSelect={(id) => {
							opener.current = document.activeElement as HTMLElement;
							inbox.selectThread(id);
							setDetailOpen(true);
						}}
						items={inbox.threads.map((item) => ({
							...item,
							leading: <MessageCircle className="h-4 w-4" />,
						}))}
					/>
					<div
						ref={detail}
						inert={mobile && !detailOpen}
						className={mobile && !detailOpen ? "hidden" : "flex min-w-0 flex-1 flex-col"}
					>
						<ChatHeader
							title={inbox.thread.title}
							subtitle={t("demo.localChat")}
							leading={
								mobile ? (
									<Button
										size="icon"
										variant="ghost"
										aria-label={t("demo.backToInbox")}
										onClick={() => {
											inbox.stop();
											setDetailOpen(false);
										}}
									>
										<ArrowLeft />
									</Button>
								) : (
									<MessageCircle className="h-5 w-5" />
								)
							}
						>
							<Button
								size="icon"
								variant="ghost"
								aria-label={t("pages.chat.clear")}
								onClick={inbox.clear}
							>
								<Eraser />
							</Button>
						</ChatHeader>
						<Conversation vm={inbox} />
					</div>
				</div>
			</SectionRule>
		</div>
	);
}
