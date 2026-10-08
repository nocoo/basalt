import { ApprovalCard } from "@nocoo/basalt/components/approval-card";
import { Button } from "@nocoo/basalt/components/button";
import { ChatComposer } from "@nocoo/basalt/components/chat-composer";
import { ChatMessage } from "@nocoo/basalt/components/chat-message";
import { DiffTable } from "@nocoo/basalt/components/diff-table";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PromptBar } from "@nocoo/basalt/components/prompt-bar";
import { RecommendationCard } from "@nocoo/basalt/components/recommendation-card";
import { Thinking } from "@nocoo/basalt/components/thinking";
import { ToolChips } from "@nocoo/basalt/components/tool-chips";
import { ArrowDown, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CHAT_MODELS, chatTrace, type ChatMessage as Message } from "@/models/chat";
import type { useChatViewModel } from "@/viewmodels/useChatViewModel";

type VM = ReturnType<typeof useChatViewModel>;
function Response({ message, vm }: { message: Message; vm: VM }) {
	const { t } = useTranslation();
	const trace = chatTrace(message);
	const active = vm.run?.message === message.id;
	return (
		<ChatMessage
			variant="assistant"
			content={message.text}
			streaming={active}
			feedback={message.feedback}
			sourcesLabel={t("pages.chat.sources")}
			sources={
				message.phase === "complete" && message.search
					? [
							{
								id: "guide",
								name: "INTEGRATION.md",
								type: "DOC",
								href: "https://github.com/nocoo/basalt/blob/main/INTEGRATION.md",
							},
						]
					: []
			}
			onRegenerate={
				!vm.running ? () => vm.dispatch({ type: "regenerate", id: message.id }) : undefined
			}
			onFeedback={(value) => vm.dispatch({ type: "feedback", id: message.id, value })}
			trace={
				<div className="space-y-basalt-space-lg">
					{message.reasoning && (
						<Thinking
							title={
								message.phase === "thinking"
									? t("demo.thinking")
									: `${t("pages.chat.reasoningSummary")} · ${message.elapsed?.toFixed(1)}s`
							}
							steps={trace.thinking}
							defaultOpen={false}
						/>
					)}
					<ToolChips steps={trace.tools} defaultOpen={false} />
				</div>
			}
		>
			{message.phase === "approval" && (
				<ApprovalCard
					key={message.id}
					autoAdvance={false}
					questions={[
						{
							id: "preview",
							label: t("pages.chat.approvalTitle"),
							type: "single",
							options: [
								{ id: "apply", label: t("pages.chat.approve") },
								{ id: "skip", label: t("pages.chat.decline") },
							],
						},
					]}
					onSubmit={(answers) =>
						vm.dispatch({
							type: "approve",
							decision: answers.preview.selected[0] === "apply" ? "apply" : "skip",
						})
					}
					onDismiss={() => vm.dispatch({ type: "approve", decision: "skip" })}
				/>
			)}
			{(message.phase === "stopped" || message.phase === "error") && (
				<div
					role={message.phase === "error" ? "alert" : "status"}
					className="flex items-center gap-basalt-space-lg text-basalt-base text-basalt-muted-foreground"
				>
					{t(`demo.chat_${message.phase}`)}
					<Button
						variant="secondary"
						size="sm"
						disabled={vm.running}
						onClick={() => vm.dispatch({ type: "regenerate", id: message.id })}
					>
						{t("demo.retry")}
					</Button>
				</div>
			)}
			{message.phase === "complete" &&
				(message.proposal ? (
					<DiffTable
						title={t("pages.chat.preview")}
						columns={[{ id: "value", label: "CSS" }]}
						rows={[
							{
								id: "old",
								label: "Remove",
								change: "remove",
								values: { value: "height: 160px" },
							},
							{
								id: "new",
								label: "Add",
								change: "add",
								values: { value: "max-height: calc(5lh + var(--basalt-space-2))" },
							},
						]}
						disabled={message.decision === "skip"}
						onApply={() => vm.dispatch({ type: "draft", text: t("pages.chat.reviewPrompt") })}
					/>
				) : (
					<RecommendationCard
						title={t("pages.chat.nextStep")}
						disabled={vm.running}
						options={[
							{
								id: "review",
								label: "Review the composer",
								description:
									"Walk through the five-line composer, interrupted streams and approval flow.",
								confidence: "high",
								actionLabel: t("pages.chat.tryPrompt"),
							},
							{
								id: "test",
								label: "Plan the tests",
								description:
									"Check IME, failed sends, mobile overflow and thread isolation before shipping.",
								confidence: "review",
								actionLabel: t("pages.chat.tryPrompt"),
							},
						]}
						onAccept={(option) =>
							vm.dispatch({
								type: "draft",
								text:
									option.id === "review" ? t("pages.chat.codePrompt") : t("pages.chat.testPrompt"),
							})
						}
					/>
				))}
		</ChatMessage>
	);
}

export function Conversation({ vm }: { vm: VM }) {
	const { t } = useTranslation();
	const log = useRef<HTMLDivElement>(null);
	const content = useRef<HTMLDivElement>(null);
	const follow = useRef(true);
	const [away, setAway] = useState(false);
	useEffect(() => {
		const node = log.current;
		const takeOwnership = () => {
			follow.current = false;
		};
		const keyboardScroll = (event: KeyboardEvent) => {
			if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key))
				takeOwnership();
		};
		const scrollbar = (event: PointerEvent) => {
			if (event.target === node) takeOwnership();
		};
		node?.addEventListener("wheel", takeOwnership, { passive: true });
		node?.addEventListener("touchmove", takeOwnership, { passive: true });
		node?.addEventListener("keydown", keyboardScroll);
		node?.addEventListener("pointerdown", scrollbar);
		const observer = new ResizeObserver(() => {
			if (follow.current && log.current) log.current.scrollTop = log.current.scrollHeight;
		});
		if (content.current) observer.observe(content.current);
		return () => {
			observer.disconnect();
			node?.removeEventListener("wheel", takeOwnership);
			node?.removeEventListener("touchmove", takeOwnership);
			node?.removeEventListener("keydown", keyboardScroll);
			node?.removeEventListener("pointerdown", scrollbar);
		};
	}, []);
	const latest = () => {
		follow.current = true;
		setAway(false);
		if (log.current) log.current.scrollTop = log.current.scrollHeight;
	};
	return (
		<div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
			<div
				ref={log}
				role="log"
				aria-label={t("demo.messages")}
				aria-live="off"
				className="min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] px-basalt-space-lg md:px-basalt-space-lg"
				onScroll={(event) => {
					const node = event.currentTarget;
					const next = node.scrollHeight - node.scrollTop - node.clientHeight > 64;
					if (!next) follow.current = true;
					setAway(next);
				}}
			>
				<div
					ref={content}
					className="mx-auto w-full max-w-[48rem] space-y-basalt-space-lg py-basalt-space-lg"
				>
					{vm.thread.messages.length === 0 && (
						<div className="space-y-basalt-space-lg py-basalt-space-lg">
							<Sparkles className="size-basalt-8 text-basalt-primary" aria-hidden="true" />
							<div className="space-y-basalt-space-lg">
								<h2 className="text-basalt-3xl font-semibold tracking-tight">
									{t("pages.chat.welcome")}
								</h2>
								<p className="text-basalt-base text-basalt-muted-foreground">
									{t("pages.chat.welcomeHint")}
								</p>
							</div>
							<div className="grid gap-basalt-space-lg sm:grid-cols-2">
								{["planPrompt", "codePrompt", "testPrompt", "contextPrompt"].map((key) => (
									<Button
										key={key}
										variant="secondary"
										className="justify-start whitespace-normal text-left"
										onClick={() => vm.dispatch({ type: "draft", text: t(`pages.chat.${key}`) })}
									>
										{t(`pages.chat.${key}`)}
									</Button>
								))}
							</div>
						</div>
					)}
					{vm.thread.messages.map((message) =>
						message.variant === "assistant" ? (
							<Response key={message.id} message={message} vm={vm} />
						) : vm.editing?.id === message.id ? (
							<LayerCard key={message.id}>
								<p className="px-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
									{t("pages.chat.editHint")}
								</p>
								<ChatComposer
									value={vm.editing.text}
									onValueChange={(text) => vm.dispatch({ type: "editText", text })}
									label={t("pages.chat.editLabel")}
									sendLabel={t("pages.chat.resend")}
									onSend={(text) => {
										latest();
										vm.dispatch({ type: "send", text, edit: true });
									}}
									toolbar={
										<Button
											variant="ghost"
											size="sm"
											onClick={() => vm.dispatch({ type: "cancelEdit" })}
										>
											{t("common.cancel")}
										</Button>
									}
								/>
							</LayerCard>
						) : (
							<ChatMessage
								key={message.id}
								variant="user"
								content={message.text}
								onEdit={
									!vm.running ? () => vm.dispatch({ type: "edit", id: message.id }) : undefined
								}
							>
								{message.files?.length ? (
									<ul className="flex flex-wrap gap-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
										{message.files.map((file) => (
											<li key={file.id} className="break-all">
												{file.name}
											</li>
										))}
									</ul>
								) : null}
							</ChatMessage>
						),
					)}
				</div>
			</div>
			{away && (
				<div className="absolute bottom-[12rem] left-1/2 -translate-x-1/2">
					<Button variant="secondary" size="sm" onClick={latest}>
						<ArrowDown />
						{t("pages.chat.latest")}
					</Button>
				</div>
			)}
			<div className="mx-auto w-full max-w-[51rem] shrink-0 px-basalt-space-lg pb-basalt-space-lg md:px-basalt-space-lg">
				{vm.error && (
					<p role="alert" className="px-basalt-space-lg text-basalt-sm text-basalt-danger">
						{vm.error}
					</p>
				)}
				<PromptBar
					value={vm.thread.draft}
					onValueChange={(text) => vm.dispatch({ type: "draft", text })}
					models={CHAT_MODELS}
					model={vm.thread.model}
					onModelChange={(model) => vm.dispatch({ type: "options", model })}
					reasoning={vm.thread.reasoning}
					onReasoningChange={(reasoning) => vm.dispatch({ type: "options", reasoning })}
					webSearch={vm.thread.search}
					onWebSearchChange={(search) => vm.dispatch({ type: "options", search })}
					streaming={vm.running}
					disabled={Boolean(vm.editing)}
					onCancel={() => vm.dispatch({ type: "stop" })}
					onSend={(text) => {
						latest();
						vm.dispatch({ type: "send", text });
					}}
					placeholder={t("pages.chat.placeholder")}
					label={t("pages.chat.message")}
					sendLabel={t("pages.chat.send")}
					cancelLabel={t("pages.chat.stop")}
					attachments={vm.thread.files}
					onFilesSelect={(files) => vm.dispatch({ type: "files", files })}
					onRemoveAttachment={(id) => vm.dispatch({ type: "removeFile", id })}
					accept="image/*,text/*,application/pdf"
				/>
				<p
					role="status"
					className="px-basalt-space-lg text-center text-basalt-xs text-basalt-muted-foreground"
				>
					{vm.running
						? vm.waiting
							? t("pages.chat.waiting")
							: t("demo.chat_streaming")
						: t("pages.chat.disclaimer")}
				</p>
			</div>
		</div>
	);
}
