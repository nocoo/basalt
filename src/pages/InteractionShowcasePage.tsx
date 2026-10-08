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
import { InputArea } from "@nocoo/basalt/components/input-area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Separator } from "@nocoo/basalt/components/separator";
import { toast } from "@nocoo/basalt/components/toast";
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ShowcasePage } from "@/components/ShowcasePage";
import type { ToastVariant } from "@/models/types";
import { useInteractionShowcaseViewModel } from "@/viewmodels/useInteractionShowcaseViewModel";

// ── Variant → icon + color mapping ──

const VARIANT_ICON: Record<ToastVariant, React.ElementType> = {
	default: Bell,
	success: CheckCircle2,
	error: XCircle,
	warning: AlertTriangle,
	info: Info,
};

const VARIANT_STYLE: Record<ToastVariant, string> = {
	default: "text-foreground",
	success: "text-success",
	error: "text-destructive",
	warning: "text-amber-500",
	info: "text-blue-500",
};

// ── Section wrapper (matches PalettePage pattern) ──

// ── Toast section ──

function ToastSection() {
	const { t } = useTranslation();
	const { toasts } = useInteractionShowcaseViewModel();

	const fireToast = (variant: ToastVariant, title: string, description: string) => {
		switch (variant) {
			case "success":
				toast.success(title, { description });
				break;
			case "error":
				toast.error(title, { description });
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
		<SectionRule title={t("pages.interactionShowcase.toastNotifications")}>
			<p className="text-basalt-base text-muted-foreground">
				{t("pages.interactionShowcase.toastDesc")}
			</p>
			<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 lg:grid-cols-3">
				{toasts.map((t) => {
					const Icon = VARIANT_ICON[t.variant];
					const colorClass = VARIANT_STYLE[t.variant];
					return (
						<LayerCard key={t.id} className="h-full" data-interaction-card>
							<LayerCard.Header asChild>
								<Button
									variant="ghost"
									type="button"
									onClick={() => fireToast(t.variant, t.title, t.description)}
									className="h-full items-start justify-start text-left"
								>
									<Icon
										className={`h-4 w-4 mt-basalt-space-xs shrink-0 ${colorClass}`}
										strokeWidth={1.5}
									/>
									<div className="min-w-0">
										<p className="text-basalt-base font-medium text-foreground">{t.title}</p>
										<p className="text-basalt-sm text-muted-foreground mt-basalt-space-xs line-clamp-2">
											{t.description}
										</p>
										<span className="mt-basalt-space-md inline-block rounded-basalt-sm bg-muted px-basalt-space-md py-basalt-space-xs text-basalt-xs font-medium text-muted-foreground">
											{t.variantLabel}
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
		<SectionRule title={t("pages.interactionShowcase.dialogs")}>
			<p className="text-basalt-base text-muted-foreground">
				{t("pages.interactionShowcase.dialogDesc")}
			</p>
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
									<span className="mt-auto rounded-basalt-sm bg-muted px-basalt-space-md py-basalt-space-xs text-basalt-xs font-medium text-muted-foreground">
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
									toast.error(t("pages.interactionShowcase.accountDeleted"), {
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
						<InputArea
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
