import { Button } from "@nocoo/basalt/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@nocoo/basalt/components/dialog";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Separator } from "@nocoo/basalt/components/separator";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { toast } from "@nocoo/basalt/components/toast";
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import type { ToastTone } from "@/models/types";
import { useInteractionShowcaseViewModel } from "@/viewmodels/useInteractionShowcaseViewModel";

// ── Tone → icon + color mapping ──

const TONE_ICON: Record<ToastTone, React.ElementType> = {
	neutral: Bell,
	success: CheckCircle2,
	danger: XCircle,
	warning: AlertTriangle,
	info: Info,
};

const TONE_STYLE: Record<ToastTone, string> = {
	neutral: "text-basalt-foreground",
	success: "text-basalt-success",
	danger: "text-basalt-danger",
	warning: "text-basalt-warning",
	info: "text-basalt-info",
};

// ── Section wrapper (matches PalettePage pattern) ──

// ── Toast section ──

function ToastSection() {
	const { t } = useTranslation();
	const { toasts } = useInteractionShowcaseViewModel();

	const fireToast = (tone: ToastTone, title: string, description: string) => {
		switch (tone) {
			case "success":
				toast.success(title, { description });
				break;
			case "danger":
				toast.danger(title, { description });
				break;
			case "warning":
				toast.warning(title, { description });
				break;
			case "info":
				toast.info(title, { description });
				break;
			default:
				toast(title, { description });
		}
	};

	return (
		<SectionRule
			title={t("pages.interactionShowcase.toastNotifications")}
			hint={t("pages.interactionShowcase.toastDesc")}
		>
			<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 lg:grid-cols-3">
				{toasts.map((t) => {
					const Icon = TONE_ICON[t.tone];
					const colorClass = TONE_STYLE[t.tone];
					return (
						<LayerCard key={t.id} className="h-full" data-interaction-card>
							<LayerCard.Header asChild>
								<Button
									variant="ghost"
									type="button"
									onClick={() => fireToast(t.tone, t.title, t.description)}
									className="h-full items-start justify-start text-left"
								>
									<Icon
										className={`size-basalt-icon-lg mt-basalt-space-xs shrink-0 ${colorClass}`}
									/>
									<div className="min-w-0">
										<p className="text-basalt-base font-medium text-foreground">{t.title}</p>
										<p className="text-basalt-sm text-muted-foreground mt-basalt-space-xs line-clamp-2">
											{t.description}
										</p>
										<span className="mt-basalt-space-md inline-block rounded-basalt-sm bg-muted px-basalt-space-md py-basalt-space-xs text-basalt-sm font-medium text-muted-foreground">
											{t.toneLabel}
										</span>
									</div>
								</Button>
							</LayerCard.Header>
						</LayerCard>
					);
				})}
			</div>
		</SectionRule>
	);
}

// ── Dialog section ──

function DialogSection() {
	const { t } = useTranslation();
	const { dialogs, activeDialog, openDialog, closeDialog, getDialogById } =
		useInteractionShowcaseViewModel();

	const current = activeDialog ? getDialogById(activeDialog) : undefined;

	return (
		<SectionRule
			title={t("pages.interactionShowcase.dialogs")}
			hint={t("pages.interactionShowcase.dialogDesc")}
		>
			<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-3">
				{dialogs.map((d) => {
					const styleLabel =
						d.style === "info"
							? t("pages.interactionShowcase.informational")
							: d.style === "form"
								? t("pages.interactionShowcase.formInput")
								: t("pages.interactive.destructive");
					return (
						<LayerCard key={d.id} className="h-full" data-interaction-card>
							<LayerCard.Header asChild>
								<Button
									variant="ghost"
									type="button"
									onClick={() => openDialog(d.id)}
									className="h-full flex-col items-start text-left"
								>
									<p className="text-basalt-base font-medium text-foreground">{d.title}</p>
									<p className="text-basalt-sm text-muted-foreground line-clamp-2">
										{d.description}
									</p>
									<span className="mt-auto rounded-basalt-sm bg-muted px-basalt-space-md py-basalt-space-xs text-basalt-sm font-medium text-muted-foreground">
										{styleLabel}
									</span>
								</Button>
							</LayerCard.Header>
						</LayerCard>
					);
				})}
			</div>

			{/* Render active dialog */}
			<Dialog open={!!current} onOpenChange={(open) => !open && closeDialog()}>
				{current?.style === "info" && (
					<DialogContent className="space-y-basalt-layout">
						<DialogHeader>
							<DialogTitle>{current.title}</DialogTitle>
							<DialogDescription>{current.description}</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="default" type="button">
									{t("pages.interactionShowcase.gotIt")}
								</Button>
							</DialogClose>
						</DialogFooter>
					</DialogContent>
				)}

				{current?.style === "form" && (
					<FormDialogContent
						onClose={closeDialog}
						title={current.title}
						description={current.description}
					/>
				)}

				{current?.style === "confirm" && (
					<DialogContent className="space-y-basalt-layout">
						<DialogHeader>
							<DialogTitle>{current.title}</DialogTitle>
							<DialogDescription>{current.description}</DialogDescription>
						</DialogHeader>
						<Separator className="bg-border" />
						<DialogFooter>
							<DialogClose asChild>
								<Button variant="secondary" type="button">
									{t("common.cancel")}
								</Button>
							</DialogClose>
							<Button
								variant="destructive"
								type="button"
								onClick={() => {
									closeDialog();
									toast.danger(t("pages.interactionShowcase.accountDeleted"), {
										description: t("pages.interactionShowcase.accountDeletedDesc"),
									});
								}}
							>
								{t("common.delete")}
							</Button>
						</DialogFooter>
					</DialogContent>
				)}
			</Dialog>
		</SectionRule>
	);
}

function FormDialogContent({
	onClose,
	title,
	description,
}: {
	onClose: () => void;
	title: string;
	description: string;
}) {
	const [submitted, setSubmitted] = useState(false);
	const { t } = useTranslation();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
		onClose();
		toast.success(t("pages.interactionShowcase.feedbackSent"), {
			description: t("pages.interactionShowcase.feedbackSentDesc"),
		});
	};

	return (
		<DialogContent className="space-y-basalt-layout">
			<DialogHeader>
				<DialogTitle>{title}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
			</DialogHeader>
			{!submitted && (
				<form onSubmit={handleSubmit} className="space-y-basalt-layout">
					<Field label={t("pages.interactionShowcase.yourName")} htmlFor="feedback-name">
						<Input
							id="feedback-name"
							placeholder={t("pages.interactionShowcase.yourNamePlaceholder")}
						/>
					</Field>
					<Field label={t("pages.interactionShowcase.message")} htmlFor="feedback-message">
						<Textarea
							id="feedback-message"
							rows={3}
							placeholder={t("pages.interactionShowcase.messagePlaceholder")}
						/>
					</Field>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="secondary" type="button">
								{t("common.cancel")}
							</Button>
						</DialogClose>
						<Button variant="default" type="submit">
							{t("common.submit")}
						</Button>
					</DialogFooter>
				</form>
			)}
		</DialogContent>
	);
}

// ── Page ──

export default function InteractionShowcasePage() {
	const { t } = useTranslation();

	return (
		<ShowcasePage
			title={t("pages.interactionShowcase.overview")}
			description={t("pages.interactionShowcase.overviewDesc")}
		>
			<ToastSection />

			<DialogSection />
		</ShowcasePage>
	);
}
