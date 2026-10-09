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
import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Banner } from "@nocoo/basalt/components/banner";
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
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
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
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { Switch } from "@nocoo/basalt/components/switch";
import { toast } from "@nocoo/basalt/components/toast";
import {
	AlertTriangle,
	Check,
	CheckCircle2,
	Copy,
	CreditCard,
	Filter,
	Inbox,
	Info,
	Loader2,
	LogOut,
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
import { ShowcasePage } from "@/components/ShowcasePage";

const ALERT_VARIANTS = {
	info: "default",
	success: "secondary",
	warning: "alert",
	error: "error",
} as const;

function InlineAlert({
	variant,
	title,
	message,
}: {
	variant: keyof typeof ALERT_VARIANTS;
	title: string;
	message: string;
}) {
	return (
		<Banner
			variant={ALERT_VARIANTS[variant]}
			title={title}
			description={message}
			icon={variant === "success" ? <CheckCircle2 /> : undefined}
		/>
	);
}

function SkeletonCard() {
	return (
		<LayerCard className="space-y-basalt-space-lg">
			<SkeletonLine minWidth={66} maxWidth={66} />
			<SkeletonLine minWidth={100} maxWidth={100} />
			<SkeletonLine minWidth={80} maxWidth={80} />
			<div className="flex gap-basalt-space-lg pt-basalt-space-sm">
				<SkeletonLine minWidth={40} maxWidth={40} height={32} />
				<SkeletonLine minWidth={32} maxWidth={32} height={32} />
			</div>
		</LayerCard>
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
			{loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />}
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
			{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
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
		{ label: t("pages.interactive.profileSettings"), key: "profile-settings", icon: User },
		{ label: t("pages.interactive.billing"), key: "billing", icon: CreditCard },
	];

	return (
		<ShowcasePage
			title={t("pages.interactive.title")}
			description={t("pages.interactive.description")}
		>
			<SectionRule title={t("pages.interactive.buttonVariants")}>
				<div className="flex flex-wrap items-center gap-basalt-space-lg">
					<Button variant="default">{t("pages.interactive.default")}</Button>
					<Button variant="secondary">{t("pages.interactive.secondary")}</Button>
					<Button variant="destructive">{t("pages.interactive.destructive")}</Button>
					<Button variant="outline">{t("pages.interactive.outline")}</Button>
					<Button variant="ghost">{t("pages.interactive.ghost")}</Button>
					<Button variant="link">{t("pages.interactive.link")}</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.buttonSizes")}>
				<div className="flex flex-wrap items-end gap-basalt-space-lg">
					<Button size="sm">{t("pages.interactive.small")}</Button>
					<Button size="default">{t("pages.interactive.default")}</Button>
					<Button size="lg">{t("pages.interactive.large")}</Button>
					<Button size="icon" aria-label="Add">
						<Plus className="h-4 w-4" />
					</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.buttonStates")}>
				<div className="space-y-basalt-space-lg">
					<div className="flex flex-wrap items-center gap-basalt-space-lg">
						<Button disabled>{t("pages.interactive.disabled")}</Button>
						<LoadingButton />
						<CopyButton />
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.toastNotifications")}>
				<div className="flex flex-wrap gap-basalt-space-lg">
					<Button size="sm" onClick={() => toast.success(t("pages.interactive.toastSuccess"))}>
						<CheckCircle2 className="h-3.5 w-3.5" /> {t("pages.interactive.success")}
					</Button>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => toast.error(t("pages.interactive.toastError"))}
					>
						<XCircle className="h-3.5 w-3.5" /> {t("pages.interactive.error")}
					</Button>
					<Button
						size="sm"
						variant="outline"
						onClick={() => toast.warning(t("pages.interactive.toastWarning"))}
					>
						<AlertTriangle className="h-3.5 w-3.5" /> {t("pages.interactive.warning")}
					</Button>
					<Button
						size="sm"
						variant="secondary"
						onClick={() => toast.info(t("pages.interactive.toastInfo"))}
					>
						<Info className="h-3.5 w-3.5" /> {t("pages.interactive.info")}
					</Button>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.inlineAlerts")}>
				<div className="space-y-basalt-space-lg">
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
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					<SkeletonCard />
					<SkeletonCard />
					<SkeletonCard />
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.progressIndicators")}>
				<div className="space-y-basalt-space-lg max-w-md">
					<div className="space-y-basalt-space-sm">
						<div className="flex justify-between text-basalt-sm text-muted-foreground">
							<span>{t("pages.interactive.uploading")}</span>
							<span>60%</span>
						</div>
						<Meter value={60} hideValue aria-label={t("pages.interactive.uploading")} />
					</div>
					<div className="flex items-center gap-basalt-space-lg">
						<div className="flex items-center gap-basalt-space-lg">
							<Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none text-muted-foreground" />
							<span className="text-basalt-sm text-muted-foreground">
								{t("pages.interactive.loading")}
							</span>
						</div>
						<div className="flex items-center gap-basalt-space-lg">
							<Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none text-primary" />
							<span className="text-basalt-base text-foreground">
								{t("pages.interactive.progressProcessing")}
							</span>
						</div>
					</div>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.emptyStates")}>
				<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-3">
					<LayerCard className="flex flex-col items-center text-center">
						<Inbox
							className="h-10 w-10 text-muted-foreground/50 mb-basalt-space-lg"
							strokeWidth={1}
						/>
						<p className="text-basalt-base font-medium text-foreground mb-basalt-space-sm">
							{t("pages.interactive.noDataYet")}
						</p>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg">
							{t("pages.interactive.createFirstRecord")}
						</p>
						<Button size="sm">{t("pages.interactive.createRecord")}</Button>
					</LayerCard>
					<LayerCard className="flex flex-col items-center text-center">
						<Search
							className="h-10 w-10 text-muted-foreground/50 mb-basalt-space-lg"
							strokeWidth={1}
						/>
						<p className="text-basalt-base font-medium text-foreground mb-basalt-space-sm">
							{t("pages.interactive.noResultsFound")}
						</p>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg">
							{t("pages.interactive.tryAdjusting")}
						</p>
						<Button size="sm" variant="outline">
							{t("pages.interactive.clearFilters")}
						</Button>
					</LayerCard>
					<LayerCard className="flex flex-col items-center text-center">
						<XCircle className="h-10 w-10 text-red-500/50 mb-basalt-space-lg" strokeWidth={1} />
						<p className="text-basalt-base font-medium text-foreground mb-basalt-space-sm">
							{t("pages.interactive.somethingWentWrong")}
						</p>
						<p className="text-basalt-sm text-muted-foreground mb-basalt-space-lg">
							{t("pages.interactive.pleaseTryAgain")}
						</p>
						<Button size="sm" variant="outline">
							<RefreshCw className="h-3.5 w-3.5" /> {t("common.retry")}
						</Button>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.sheetDrawer")}>
				<div className="flex flex-wrap gap-basalt-space-lg">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<PanelRight className="h-3.5 w-3.5" /> {t("pages.interactive.sheetRight")}
							</Button>
						</SheetTrigger>
						<SheetContent side="right">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.detailPanel")}</SheetTitle>
								<SheetDescription>{t("pages.interactive.viewEditDetails")}</SheetDescription>
							</SheetHeader>
							<div className="mt-basalt-space-lg space-y-basalt-space-lg">
								<div className="space-y-basalt-space-lg">
									<Label>{t("pages.interactive.nameLabel")}</Label>
									<Input defaultValue={t("pages.interactive.nameValue")} />
								</div>
								<div className="space-y-basalt-space-lg">
									<Label>{t("pages.interactive.emailLabel")}</Label>
									<Input defaultValue={t("pages.interactive.emailValue")} />
								</div>
							</div>
							<SheetFooter className="mt-basalt-space-lg">
								<SheetClose asChild>
									<Button size="sm">{t("common.save")}</Button>
								</SheetClose>
							</SheetFooter>
						</SheetContent>
					</Sheet>
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="outline" size="sm">
								<PanelLeft className="h-3.5 w-3.5" /> {t("pages.interactive.sheetLeft")}
							</Button>
						</SheetTrigger>
						<SheetContent side="left">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.filters")}</SheetTitle>
								<SheetDescription>{t("pages.interactive.narrowDownResults")}</SheetDescription>
							</SheetHeader>
							<SheetFooter className="mt-basalt-space-lg">
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
								<PanelBottom className="h-3.5 w-3.5" /> {t("pages.interactive.sheetBottom")}
							</Button>
						</SheetTrigger>
						<SheetContent side="bottom">
							<SheetHeader>
								<SheetTitle>{t("pages.interactive.quickActions")}</SheetTitle>
							</SheetHeader>
							<SheetFooter className="mt-basalt-space-lg">
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
				<div className="flex flex-wrap gap-basalt-space-lg">
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
							<div className="space-y-basalt-space-lg py-basalt-space-lg">
								<div className="space-y-basalt-space-lg">
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
								<AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-basalt-destructive-hover">
									{t("common.delete")}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.popovers")}>
				<div className="flex flex-wrap gap-basalt-space-lg">
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								<Filter className="h-3.5 w-3.5" /> {t("common.filter")}
							</Button>
						</PopoverTrigger>
						<PopoverContent className="w-64">
							<div className="space-y-basalt-space-lg">
								<p className="text-basalt-base font-medium">{t("pages.interactive.filterBy")}</p>
								<div className="space-y-basalt-space-lg">
									<Label className="text-basalt-sm">{t("pages.interactive.statusLabel")}</Label>
									<Input
										placeholder={t("pages.interactive.statusPlaceholder")}
										className="text-basalt-sm"
									/>
								</div>
								<Separator />
								<div className="flex justify-end gap-basalt-space-lg">
									<Button size="sm">{t("common.apply")}</Button>
								</div>
							</div>
						</PopoverContent>
					</Popover>
					<Popover>
						<PopoverTrigger asChild>
							<Button variant="outline" size="sm">
								<User className="h-3.5 w-3.5" /> {t("pages.interactive.profileLabel")}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							align="start"
							className="w-basalt-72"
							aria-label={t("pages.interactive.profileLabel")}
						>
							<div className="flex items-center gap-basalt-layout-sm">
								<Avatar className="shrink-0">
									<AvatarFallback>{t("pages.interactive.profileInitials")}</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="text-basalt-base font-medium">
										{t("pages.interactive.profileName")}
									</p>
									<p className="break-words text-basalt-sm text-basalt-muted-foreground">
										{t("pages.interactive.profileEmail")}
									</p>
								</div>
							</div>
							<Separator className="my-basalt-layout-sm" />
							<div className="space-y-basalt-space-sm">
								{profileMenuItems.map((item) => (
									<Button
										variant="ghost"
										size="sm"
										icon={<item.icon aria-hidden="true" />}
										type="button"
										key={item.key}
										className="min-h-basalt-menu-row w-full justify-start text-left"
									>
										{item.label}
									</Button>
								))}
							</div>
							<Separator className="my-basalt-space-lg" />
							<Button
								variant="ghost"
								size="sm"
								icon={<LogOut aria-hidden="true" />}
								className="min-h-basalt-menu-row w-full justify-start text-left text-basalt-muted-foreground"
							>
								{t("common.signOut")}
							</Button>
						</PopoverContent>
					</Popover>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.interactive.collapsibleSections")}>
				<div className="space-y-basalt-layout">
					<Collapsible open={collapsible1} onOpenChange={setCollapsible1} asChild>
						<LayerCard>
							<LayerCard.Header asChild>
								<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
									{t("pages.interactive.advancedOptions")}
								</CollapsibleTrigger>
							</LayerCard.Header>
							<CollapsibleContent unstyled>
								<LayerCard.Body className="border-t border-basalt-border space-y-basalt-space-lg">
									<div className="flex items-center justify-between">
										<span className="text-basalt-base">{t("pages.interactive.enableCaching")}</span>
										<Switch />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-basalt-base">{t("pages.interactive.debugMode")}</span>
										<Switch />
									</div>
								</LayerCard.Body>
							</CollapsibleContent>
						</LayerCard>
					</Collapsible>
					<Collapsible open={collapsible2} onOpenChange={setCollapsible2} asChild>
						<LayerCard>
							<LayerCard.Header asChild>
								<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
									{t("pages.interactive.dangerZone")}
								</CollapsibleTrigger>
							</LayerCard.Header>
							<CollapsibleContent unstyled>
								<LayerCard.Body className="border-t border-basalt-border">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-basalt-base font-medium text-foreground">
												{t("pages.interactive.deleteWorkspace")}
											</p>
											<p className="text-basalt-sm text-muted-foreground">
												{t("pages.interactive.permanentlyRemoveData")}
											</p>
										</div>
										<Button variant="destructive" size="sm">
											{t("common.delete")}
										</Button>
									</div>
								</LayerCard.Body>
							</CollapsibleContent>
						</LayerCard>
					</Collapsible>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
