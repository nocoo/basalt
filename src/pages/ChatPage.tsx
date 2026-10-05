import { Button } from "@nocoo/basalt/components/button";
import { ChatInbox } from "@nocoo/basalt/components/chat-inbox";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { ConfirmDialog } from "@nocoo/basalt/components/confirm-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { Input } from "@nocoo/basalt/components/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@nocoo/basalt/components/sheet";
import { Eraser, MessageCircle, PanelLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/hooks/use-mobile";
import { Conversation } from "@/pages/chat/Conversation";
import { useChatViewModel } from "@/viewmodels/useChatViewModel";

export default function ChatPage() {
	const { t } = useTranslation();
	const vm = useChatViewModel();
	const mobile = useIsMobile();
	const [threadsOpen, setThreadsOpen] = useState(false);
	const [renameOpen, setRenameOpen] = useState(false);
	const [name, setName] = useState("");
	const [confirm, setConfirm] = useState<"delete" | "clear" | null>(null);
	const failId = useId();
	const threads = (
		<div className="flex h-full min-h-0 flex-col">
			<div className="p-basalt-2">
				<Button
					variant="secondary"
					className="w-full justify-start"
					onClick={() => {
						vm.dispatch({ type: "new" });
						setThreadsOpen(false);
					}}
				>
					<Plus />
					{t("pages.chat.new")}
				</Button>
			</div>
			<ChatInbox
				aria-label={t("pages.chat.conversations")}
				className="flex-1"
				items={vm.threads.map((thread) => ({
					id: thread.id,
					title: thread.title,
					preview: thread.messages.slice(-1)[0]?.text || t("pages.chat.empty"),
					leading: <MessageCircle className="size-basalt-icon-lg" />,
				}))}
				activeId={vm.activeId}
				onSelect={(id) => {
					vm.dispatch({ type: "select", id });
					setThreadsOpen(false);
				}}
			/>
			<p className="p-basalt-3 text-xs text-basalt-muted-foreground">
				{t("pages.chat.sessionHint")}
			</p>
		</div>
	);
	return (
		<div data-chat-workspace className="flex h-full min-h-0 flex-col gap-basalt-3">
			<header className="flex shrink-0 items-center justify-between gap-basalt-3">
				<div>
					<h1 className="text-xl font-semibold tracking-tight">{t("pages.chat.title")}</h1>
					<p className="mt-basalt-1 text-xs text-basalt-muted-foreground">
						{t("pages.chat.description")}
					</p>
				</div>
			</header>
			<div className="flex min-h-0 flex-1 overflow-hidden rounded-basalt-lg border border-basalt-border">
				{!mobile && (
					<aside className="w-basalt-56 shrink-0 border-r border-basalt-border bg-basalt-secondary">
						{threads}
					</aside>
				)}
				<section
					className="flex min-h-0 min-w-0 flex-1 flex-col"
					aria-label={t("pages.chat.assistant")}
				>
					<header className="flex shrink-0 flex-wrap items-center gap-basalt-2 border-b border-basalt-border px-basalt-3 py-basalt-2">
						{mobile && (
							<Sheet open={threadsOpen} onOpenChange={setThreadsOpen}>
								<SheetTrigger asChild>
									<Button size="icon" variant="ghost" aria-label={t("pages.chat.conversations")}>
										<PanelLeft />
									</Button>
								</SheetTrigger>
								<SheetContent side="left" className="flex w-basalt-72 flex-col">
									<SheetTitle>{t("pages.chat.conversations")}</SheetTitle>
									{threads}
								</SheetContent>
							</Sheet>
						)}
						<h2 className="min-w-0 flex-1 truncate text-sm font-medium">{vm.thread.title}</h2>
						<Dialog
							open={renameOpen}
							onOpenChange={(open) => {
								setRenameOpen(open);
								if (open) setName(vm.thread.title);
							}}
						>
							<DialogTrigger asChild>
								<Button size="icon" variant="ghost" aria-label={t("pages.chat.rename")}>
									<Pencil />
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogTitle>{t("pages.chat.rename")}</DialogTitle>
								<DialogDescription>{t("pages.chat.renameHint")}</DialogDescription>
								<form
									className="mt-basalt-3 space-y-basalt-3"
									onSubmit={(event) => {
										event.preventDefault();
										vm.dispatch({ type: "rename", title: name });
										setRenameOpen(false);
									}}
								>
									<Input
										aria-label={t("pages.chat.name")}
										value={name}
										maxLength={80}
										onChange={(event) => setName(event.target.value)}
									/>
									<Button type="submit" disabled={!name.trim()}>
										{t("common.save")}
									</Button>
								</form>
							</DialogContent>
						</Dialog>
						<Button
							size="icon"
							variant="ghost"
							aria-label={t("pages.chat.clear")}
							onClick={() => setConfirm("clear")}
						>
							<Eraser />
						</Button>
						<Button
							size="icon"
							variant="ghost"
							aria-label={t("pages.chat.delete")}
							onClick={() => setConfirm("delete")}
						>
							<Trash2 />
						</Button>
					</header>
					<Conversation key={vm.activeId} vm={vm} />
				</section>
			</div>
			<div className="flex shrink-0 items-center gap-basalt-2 text-xs text-basalt-muted-foreground">
				<Checkbox
					id={failId}
					checked={vm.failNext}
					disabled={vm.running}
					onCheckedChange={(value) => vm.dispatch({ type: "fail", value: value === true })}
				/>
				<label htmlFor={failId}>{t("demo.failNextReply")}</label>
			</div>
			<ConfirmDialog
				open={confirm !== null}
				onOpenChange={(open) => {
					if (!open) setConfirm(null);
				}}
				title={t(confirm === "delete" ? "pages.chat.delete" : "pages.chat.clear")}
				description={t("pages.chat.confirmHint")}
				variant="destructive"
				onConfirm={() => {
					vm.dispatch(
						confirm === "delete" ? { type: "delete", id: vm.activeId } : { type: "clear" },
					);
					setConfirm(null);
				}}
			/>
		</div>
	);
}
