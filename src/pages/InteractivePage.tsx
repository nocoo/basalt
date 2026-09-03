import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import { Button } from "@nocoo/basalt/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { Meter } from "@nocoo/basalt/components/meter";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Separator } from "@nocoo/basalt/components/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@nocoo/basalt/components/sheet";
import { Switch } from "@nocoo/basalt/components/switch";
import { toast } from "@nocoo/basalt/components/toast";
import {
	AlertTriangle,
	Check,
	CheckCircle2,
	ChevronDown,
	Copy,
	Filter,
	Inbox,
	Info,
	Loader2,
	PanelBottom,
	PanelLeft,
	PanelRight,
	Plus,
	RefreshCw,
	Search,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ALERT_STYLES = {
	info: {
		icon: Info,
		border: "border-blue-500/30",
		bg: "bg-blue-500/10",
		text: "text-blue-600 dark:text-blue-400",
	},
	success: {
		icon: CheckCircle2,
		border: "border-emerald-500/30",
		bg: "bg-emerald-500/10",
		text: "text-emerald-600 dark:text-emerald-400",
	},
	warning: {
		icon: AlertTriangle,
		border: "border-amber-500/30",
		bg: "bg-amber-500/10",
		text: "text-amber-600 dark:text-amber-400",
	},
	error: {
		icon: XCircle,
		border: "border-red-500/30",
		bg: "bg-red-500/10",
		text: "text-red-600 dark:text-red-400",
	},
} as const;

function InlineAlert({
	variant,
	title,
	message,
}: {
	variant: keyof typeof ALERT_STYLES;
	title: string;
	message: string;
}) {
	const s = ALERT_STYLES[variant];
	return (
		<div className={`flex items-start gap-3 rounded-lg border ${s.border} ${s.bg} p-4`}>
			<s.icon className={`h-5 w-5 shrink-0 mt-0.5 ${s.text}`} strokeWidth={1.5} />
			<div className="space-y-1">
				<p className={`text-sm font-medium ${s.text}`}>{title}</p>
				<p className="text-xs text-muted-foreground">{message}</p>
			</div>
		</div>
	);
}

function Skeleton({ className = "" }: { className?: string }) {
	return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SkeletonCard() {
	return (
		<div className="rounded-widget border border-border bg-card p-4 space-y-3">
			<Skeleton className="h-4 w-2/3" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-4/5" />
			<div className="flex gap-2 pt-1">
				<Skeleton className="h-8 w-20 rounded-md" />
				<Skeleton className="h-8 w-16 rounded-md" />
			</div>
		</div>
	);
}

function LoadingButton() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const handleClick = () => {
		setLoading(true);
		setTimeout(() => setLoading(false), 2000);
	};
	return (
		<Button onClick={handleClick} disabled={loading}>
			{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
			{loading ? t("pages.interactive.processing") : t("common.submit")}
		</Button>
	);
}

function CopyButton() {
	const { t } = useTranslation();
	const [copied, setCopied] = useState(false);
	const handleCopy = () => {
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};
	return (
		<Button variant="outline" size="sm" onClick={handleCopy}>
			{copied ? <Check className="mr-2 h-3.5 w-3.5" /> : <Copy className="mr-2 h-3.5 w-3.5" />}
			{copied ? t("common.copied") : t("common.copy")}
		</Button>
	);
}

export default function InteractivePage() {
	const { t } = useTranslation();
	const [collapsible1, setCollapsible1] = useState(false);
	const [collapsible2, setCollapsible2] = useState(false);

	const alertData = [
		{
			variant: "info" as const,
			title: t("pages.interactive.alertInfoTitle"),
			message: t("pages.interactive.alertInfoMessage"),
		},
		{
			variant: "success" as const,
			title: t("pages.interactive.alertSuccessTitle"),
			message: t("pages.interactive.alertSuccessMessage"),
		},
		{
			variant: "warning" as const,
			title: t("pages.interactive.alertWarningTitle"),
			message: t("pages.interactive.alertWarningMessage"),
		},
		{
			variant: "error" as const,
			title: t("pages.interactive.alertErrorTitle"),
			message: t("pages.interactive.alertErrorMessage"),
		},
	];

	const profileMenuItems = [
		{ label: t("pages.interactive.profileSettings"), key: "profile-settings" },
		{ label: t("pages.interactive.billing"), key: "billing" },
		{ label: t("common.signOut"), key: "sign-out" },
	];

	return (
		<div className="space-y-8">
			<PageHeader
				title={t("pages.interactive.title")}
				description={t("pages.interactive.description")}
			/>

			<SectionRule title={t("pages.interactive.buttonVariants")}>
				<div className="flex flex-wrap items-center gap-3">
					<Button variant="default">{t("pages.interactive.default")}</Button>
					<Button variant="secondary">{t("pages.interactive.secondary")}</Button>
					<Button variant="destructive">{t("pages.interactive.destructive")}</Button>
					<Button variant="outline">{t("pages.interactive.outline")}</Button>
					<Button variant="ghost">{t("pages.interactive.ghost")}</Button>
					<Button variant="link">{t("pages.interactive.link")}</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.buttonSizes")}>
				<div className="flex flex-wrap items-end gap-3">
					<Button size="sm">{t("pages.interactive.small")}</Button>
					<Button size="default">{t("pages.interactive.default")}</Button>
					<Button size="lg">{t("pages.interactive.large")}</Button>
					<Button size="icon" aria-label="Add">
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.buttonStates")}>
				<div className="space-y-4">
					<div className="flex flex-wrap items-center gap-3">
						<Button disabled>{t("pages.interactive.disabled")}</Button>
						<LoadingButton />
						<CopyButton />
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.toastNotifications")}>
				<div className="flex flex-wrap gap-3">
					<Button size="sm" onClick={() => toast.success(t("pages.interactive.toastSuccess"))}>
						<CheckCircle2 className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.success")}
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => toast.error(t("pages.interactive.toastError"))}
					>
						<XCircle className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.error")}
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => toast.warning(t("pages.interactive.toastWarning"))}
					>
						<AlertTriangle className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.warning")}
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => toast.info(t("pages.interactive.toastInfo"))}
					>
						<Info className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.info")}
					</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.inlineAlerts")}>
				<div className="space-y-3">
					{alertData.map((alert) => (
						<InlineAlert
							key={alert.variant}
							variant={alert.variant}
							title={alert.title}
							message={alert.message}
						/>
					))}
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.skeletonLoaders")}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.progressIndicators")}>
				<div className="space-y-4 max-w-md">
					<div className="space-y-1">
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>{t("pages.interactive.uploading")}</span>
							<span>60%</span>
						</div>
						<Meter value={60} hideValue aria-label={t("pages.interactive.uploading")} />
					</div>
					<div className="flex items-center gap-6">
						<div className="flex items-center gap-2">
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
							<span className="text-xs text-muted-foreground">
								{t("pages.interactive.loading")}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Loader2 className="h-5 w-5 animate-spin text-primary" />
							<span className="text-sm text-foreground">
								{t("pages.interactive.progressProcessing")}
							</span>
						</div>
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.emptyStates")}>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					<div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
						<Inbox className="h-10 w-10 text-muted-foreground/50 mb-3" strokeWidth={1} />
						<p className="text-sm font-medium text-foreground mb-1">
							{t("pages.interactive.noDataYet")}
						</p>
						<p className="text-xs text-muted-foreground mb-4">
							{t("pages.interactive.createFirstRecord")}
						</p>
						<Button size="sm">{t("pages.interactive.createRecord")}</Button>
					</div>
					<div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
						<Search className="h-10 w-10 text-muted-foreground/50 mb-3" strokeWidth={1} />
						<p className="text-sm font-medium text-foreground mb-1">
							{t("pages.interactive.noResultsFound")}
						</p>
						<p className="text-xs text-muted-foreground mb-4">
							{t("pages.interactive.tryAdjusting")}
						</p>
						<Button size="sm" variant="outline">
							{t("pages.interactive.clearFilters")}
						</Button>
					</div>
					<div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
						<XCircle className="h-10 w-10 text-red-500/50 mb-3" strokeWidth={1} />
						<p className="text-sm font-medium text-foreground mb-1">
							{t("pages.interactive.somethingWentWrong")}
						</p>
						<p className="text-xs text-muted-foreground mb-4">
							{t("pages.interactive.pleaseTryAgain")}
						</p>
						<Button size="sm" variant="outline">
							<RefreshCw className="mr-2 h-3.5 w-3.5" /> {t("common.retry")}
						</Button>
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.sheetDrawer")}>
				<div className="flex flex-wrap gap-3">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<PanelRight className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.sheetRight")}
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.detailPanel")}</SheetTitle>
								<SheetDescription>{t("pages.interactive.viewEditDetails")}</SheetDescription>
							</SheetHeader>
							<div className="mt-6 space-y-4">
								<div className="space-y-2">
									<Label>{t("pages.interactive.nameLabel")}</Label>
									<Input defaultValue={t("pages.interactive.nameValue")} />
								</div>
								<div className="space-y-2">
									<Label>{t("pages.interactive.emailLabel")}</Label>
									<Input defaultValue={t("pages.interactive.emailValue")} />
								</div>
							</div>
							<SheetFooter className="mt-6">
								<SheetClose asChild>
									<Button size="sm">{t("common.save")}</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<PanelLeft className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.sheetLeft")}
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.filters")}</SheetTitle>
								<SheetDescription>{t("pages.interactive.narrowDownResults")}</SheetDescription>
							</SheetHeader>
							<SheetFooter className="mt-6">
								<SheetClose asChild>
									<Button variant="outline" size="sm">
										{t("common.cancel")}
									</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<PanelBottom className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.sheetBottom")}
							</Button>
						</SheetTrigger>
						<SheetContent side="bottom">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.quickActions")}</SheetTitle>
							</SheetHeader>
							<SheetFooter className="mt-6">
								<SheetClose asChild>
									<Button variant="outline" size="sm">
										{t("common.cancel")}
									</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.dialogs")}>
				<div className="flex flex-wrap gap-3">
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" size="sm">
								{t("pages.interactive.basicDialog")}
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>{t("pages.interactive.editProfile")}</DialogTitle>
								<DialogDescription>{t("pages.interactive.editProfileDesc")}</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label>{t("pages.interactive.displayName")}</Label>
									<Input defaultValue={t("pages.interactive.displayNameValue")} />
								</div>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button size="sm">{t("common.save")}</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm">
								{t("pages.interactive.deleteItem")}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{t("pages.interactive.areYouSure")}</AlertDialogTitle>
								<AlertDialogDescription>
									{t("pages.interactive.cannotBeUndone")}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
								<AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
									{t("common.delete")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.popovers")}>
				<div className="flex flex-wrap gap-3">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="mr-2 h-3.5 w-3.5" /> {t("common.filter")}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64">
							<div className="space-y-3">
								<p className="text-sm font-medium">{t("pages.interactive.filterBy")}</p>
								<div className="space-y-2">
									<Label className="text-xs">{t("pages.interactive.statusLabel")}</Label>
									<Input
										placeholder={t("pages.interactive.statusPlaceholder")}
										className="h-8 text-xs"
									/>
								</div>
								<Separator />
								<div className="flex justify-end gap-2">
									<Button size="sm">{t("common.apply")}</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								<User className="mr-2 h-3.5 w-3.5" /> {t("pages.interactive.profileLabel")}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-72">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
									{t("pages.interactive.profileInitials")}
								</div>
								<div>
									<p className="text-sm font-medium">{t("pages.interactive.profileName")}</p>
									<p className="text-xs text-muted-foreground">
										{t("pages.interactive.profileEmail")}
									</p>
								</div>
							</div>
							<Separator className="my-3" />
							<div className="space-y-1">
								{profileMenuItems.map((item) => (
									<button
										type="button"
										key={item.key}
										className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
									>
										{item.label}
									</button>
								))}
							</div>
						</PopoverContent>
					</Popover>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.collapsibleSections")}>
				<div className="space-y-3">
					<Collapsible open={collapsible1} onOpenChange={setCollapsible1}>
						<div className="rounded-widget border border-border bg-card">
							<CollapsibleTrigger asChild>
								<button type="button" className="flex w-full items-center justify-between p-4">
									<span className="text-sm font-medium text-foreground">
										{t("pages.interactive.advancedOptions")}
									</span>
									<ChevronDown
										className={`h-4 w-4 text-muted-foreground transition-transform ${collapsible1 ? "rotate-180" : ""}`}
										strokeWidth={1.5}
									/>
								</button>
							</CollapsibleTrigger>
							<CollapsibleContent unstyled>
								<div className="border-t border-border p-4 space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm">{t("pages.interactive.enableCaching")}</span>
										<Switch />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-sm">{t("pages.interactive.debugMode")}</span>
										<Switch />
									</div>
								</div>
							</CollapsibleContent>
						</div>
					</Collapsible>
					<Collapsible open={collapsible2} onOpenChange={setCollapsible2}>
						<div className="rounded-widget border border-border bg-card">
							<CollapsibleTrigger asChild>
								<button type="button" className="flex w-full items-center justify-between p-4">
									<span className="text-sm font-medium text-foreground">
										{t("pages.interactive.dangerZone")}
									</span>
									<ChevronDown
										className={`h-4 w-4 text-muted-foreground transition-transform ${collapsible2 ? "rotate-180" : ""}`}
										strokeWidth={1.5}
									/>
								</button>
							</CollapsibleTrigger>
							<CollapsibleContent unstyled>
								<div className="border-t border-border p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-foreground">
												{t("pages.interactive.deleteWorkspace")}
											</p>
											<p className="text-xs text-muted-foreground">
												{t("pages.interactive.permanentlyRemoveData")}
											</p>
										</div>
										<Button variant="destructive" size="sm">
											{t("common.delete")}
										</Button>
									</div>
								</div>
							</CollapsibleContent>
						</div>
					</Collapsible>
				</div>
			</SectionRule>
		</div>
	);
}
