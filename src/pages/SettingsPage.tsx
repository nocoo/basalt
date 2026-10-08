import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Separator } from "@nocoo/basalt/components/separator";
import { SidebarItem, SidebarNav } from "@nocoo/basalt/components/sidebar";
import { Switch } from "@nocoo/basalt/components/switch";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Bell, Camera, CreditCard, Globe, Palette, Shield, Smartphone, User } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { DemoFeedback } from "@/components/examples/DemoFeedback";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useSettingsViewModel } from "@/viewmodels/useSettingsViewModel";

// -- Settings sections nav --

const SECTIONS = [
	{ id: "profile", labelKey: "pages.settings.profile", icon: User },
	{ id: "notifications", labelKey: "pages.settings.notifications", icon: Bell },
	{ id: "security", labelKey: "pages.settings.security", icon: Shield },
	{ id: "appearance", labelKey: "pages.settings.appearance", icon: Palette },
] as const;

type SettingsVM = ReturnType<typeof useSettingsViewModel>;

// -- Notification toggles --

interface NotifToggle {
	id: string;
	labelKey: string;
	descriptionKey: string;
	defaultOn: boolean;
}

const NOTIFICATION_TOGGLES: NotifToggle[] = [
	{
		id: "email",
		labelKey: "pages.settings.emailNotifications",
		descriptionKey: "pages.settings.emailNotificationsDesc",
		defaultOn: true,
	},
	{
		id: "push",
		labelKey: "pages.settings.pushNotifications",
		descriptionKey: "pages.settings.pushNotificationsDesc",
		defaultOn: true,
	},
	{
		id: "marketing",
		labelKey: "pages.settings.marketingEmails",
		descriptionKey: "pages.settings.marketingEmailsDesc",
		defaultOn: false,
	},
	{
		id: "weekly",
		labelKey: "pages.settings.weeklyDigest",
		descriptionKey: "pages.settings.weeklyDigestDesc",
		defaultOn: true,
	},
	{
		id: "security",
		labelKey: "pages.settings.securityAlerts",
		descriptionKey: "pages.settings.securityAlertsDesc",
		defaultOn: true,
	},
];

// -- Component --

export default function SettingsPage() {
	const vm = useSettingsViewModel();
	const { activeSection, setActiveSection } = vm;
	const { t } = useTranslation();

	return (
		<ShowcasePage title={t("pages.settings.title")} description={t("pages.settings.description")}>
			<p className="text-basalt-base text-muted-foreground">{t("demo.localOnly")}</p>
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-4">
				{/* Left nav */}
				<LayerCard className="flex flex-col lg:col-span-1" padding="none">
					<LayerCard.Body>
						<SidebarNav
							aria-label={t("pages.settings.title")}
							className="flex-row flex-wrap lg:flex-col"
						>
							{SECTIONS.map(({ id, labelKey, icon: Icon }) => (
								<SidebarItem
									className="w-auto lg:w-full"
									type="button"
									key={id}
									onClick={() => setActiveSection(id)}
									aria-label={t(labelKey)}
									active={activeSection === id}
								>
									<Icon strokeWidth={1.5} />
									<span className="text-basalt-sm sm:text-basalt-base">{t(labelKey)}</span>
								</SidebarItem>
							))}
						</SidebarNav>
					</LayerCard.Body>
				</LayerCard>

				{/* Right content */}
				<div className="lg:col-span-3">
					{activeSection === "profile" && <ProfileSection vm={vm} />}
					{activeSection === "notifications" && <NotificationsSection vm={vm} />}
					{activeSection === "security" && <SecuritySection vm={vm} />}
					{activeSection === "appearance" && <AppearanceSection vm={vm} />}
				</div>
			</div>
			{vm.notice && (
				<p role="status" className="text-basalt-base text-muted-foreground">
					{t(`demo.${vm.notice}`)}
				</p>
			)}
		</ShowcasePage>
	);
}

// ── Profile ──

function ProfileSection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();
	const photoInput = useRef<HTMLInputElement>(null);

	return (
		<LayerCard className="flex flex-col" padding="none">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("pages.settings.profileInfo")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body>
				<form
					aria-label={t("pages.settings.profileInfo")}
					className="min-h-0 flex-1 space-y-basalt-space-lg"
					onSubmit={(event) => {
						event.preventDefault();
						vm.saveProfile();
					}}
				>
					{/* Avatar */}
					<input
						type="file"
						accept="image/*"
						className="sr-only"
						tabIndex={-1}
						ref={photoInput}
						aria-label={t("demo.profilePhoto")}
						onChange={(event) => vm.setPhoto(event.currentTarget.files?.[0]?.name ?? "")}
					/>
					<div className="flex items-center gap-basalt-space-lg">
						<div className="relative">
							<div className="flex h-16 w-16 items-center justify-center rounded-basalt-full bg-primary/10 text-primary">
								<User className="h-7 w-7" strokeWidth={1.5} />
							</div>
							<Button
								variant="secondary"
								size="icon"
								type="button"
								className="absolute -bottom-1 -right-1"
								aria-label={t("pages.settings.changePhoto")}
								onClick={() => photoInput.current?.click()}
							>
								<Camera className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} />
							</Button>
						</div>
						<div>
							<p className="text-basalt-base font-medium text-foreground">
								{vm.profile.firstName} {vm.profile.lastName}
							</p>
							<p className="text-basalt-sm text-muted-foreground">{vm.profile.email}</p>
							{vm.photo && (
								<p role="status" className="text-basalt-sm text-muted-foreground break-all">
									{vm.photo}
								</p>
							)}
						</div>
					</div>

					<Separator className="bg-border" />

					{/* Form fields */}
					<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2">
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-first-name" className="text-foreground">
								{t("pages.settings.firstName")}
							</Label>
							<Input
								id="settings-first-name"
								name="firstName"
								disabled={vm.profileSave.status === "pending"}
								required
								value={vm.draft.firstName}
								onChange={(event) => vm.changeField("firstName", event.target.value)}
							/>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-last-name" className="text-foreground">
								{t("pages.settings.lastName")}
							</Label>
							<Input
								id="settings-last-name"
								name="lastName"
								disabled={vm.profileSave.status === "pending"}
								required
								value={vm.draft.lastName}
								onChange={(event) => vm.changeField("lastName", event.target.value)}
							/>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-email" className="text-foreground">
								{t("pages.login.email")}
							</Label>
							<Input
								id="settings-email"
								name="email"
								disabled={vm.profileSave.status === "pending"}
								required
								value={vm.draft.email}
								onChange={(event) => vm.changeField("email", event.target.value)}
								type="email"
							/>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-phone" className="text-foreground">
								{t("pages.settings.phone")}
							</Label>
							<Input
								id="settings-phone"
								name="phone"
								disabled={vm.profileSave.status === "pending"}
								value={vm.draft.phone}
								onChange={(event) => vm.changeField("phone", event.target.value)}
								type="tel"
							/>
						</div>
					</div>

					<div className="space-y-basalt-space-lg">
						<Label htmlFor="settings-bio" className="text-foreground">
							{t("pages.settings.bio")}
						</Label>
						<InputArea
							id="settings-bio"
							name="bio"
							disabled={vm.profileSave.status === "pending"}
							value={vm.draft.bio}
							onChange={(event) => vm.changeField("bio", event.target.value)}
							rows={3}
						/>
					</div>

					<div className="flex justify-end gap-basalt-space-lg">
						<Button variant="secondary" type="button" onClick={vm.cancelProfile}>
							{t("common.cancel")}
						</Button>
						<Button variant="default" type="submit" disabled={vm.profileSave.status === "pending"}>
							{t("common.save")}
						</Button>
					</div>
					<DemoFeedback {...vm.profileSave} />
				</form>
			</LayerCard.Body>
		</LayerCard>
	);
}

// ── Notifications ──

function NotificationsSection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col" padding="none">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Bell className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("pages.settings.notificationPrefs")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 space-y-basalt-space-sm">
				{NOTIFICATION_TOGGLES.map((item, i) => (
					<div key={item.id}>
						<div className="flex items-center justify-between py-basalt-space-lg">
							<div className="space-y-basalt-space-xs">
								<label
									htmlFor={`notif-${item.id}`}
									className="text-basalt-base text-foreground cursor-pointer"
								>
									{t(item.labelKey)}
								</label>
								<p className="text-basalt-sm text-muted-foreground">{t(item.descriptionKey)}</p>
							</div>
							<Switch
								id={`notif-${item.id}`}
								checked={vm.notifications[item.id]}
								onCheckedChange={(value) => vm.setNotification(item.id, value)}
							/>
						</div>
						{i < NOTIFICATION_TOGGLES.length - 1 && <Separator className="bg-border" />}
					</div>
				))}
			</LayerCard.Body>
		</LayerCard>
	);
}

// ── Security ──

function SecuritySection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();

	return (
		<div className="space-y-basalt-space-lg">
			{/* Password */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base font-normal text-muted-foreground">
							{t("pages.settings.passwordTitle")}
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body>
					<form
						aria-label={t("pages.settings.passwordTitle")}
						className="min-h-0 flex-1 space-y-basalt-space-lg"
						onSubmit={(event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							vm.updatePassword(
								String(data.get("current")),
								String(data.get("password")),
								String(data.get("confirmation")),
							);
						}}
					>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-current-password" className="text-foreground">
								{t("pages.settings.currentPassword")}
							</Label>
							<Input
								id="settings-current-password"
								name="current"
								required
								disabled={vm.passwordSave.status === "pending"}
								autoComplete="current-password"
								type="password"
								placeholder="••••••••"
							/>
						</div>
						<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2">
							<div className="space-y-basalt-space-lg">
								<Label htmlFor="settings-new-password" className="text-foreground">
									{t("pages.settings.newPassword")}
								</Label>
								<Input
									id="settings-new-password"
									name="password"
									required
									disabled={vm.passwordSave.status === "pending"}
									minLength={8}
									autoComplete="new-password"
									type="password"
									placeholder="••••••••"
								/>
							</div>
							<div className="space-y-basalt-space-lg">
								<Label htmlFor="settings-confirm-password" className="text-foreground">
									{t("pages.settings.confirmPassword")}
								</Label>
								<Input
									id="settings-confirm-password"
									name="confirmation"
									required
									disabled={vm.passwordSave.status === "pending"}
									minLength={8}
									autoComplete="new-password"
									type="password"
									placeholder="••••••••"
								/>
							</div>
						</div>
						<div className="flex justify-end">
							<Button
								variant="default"
								type="submit"
								disabled={vm.passwordSave.status === "pending"}
							>
								{t("pages.settings.updatePassword")}
							</Button>
						</div>
						{vm.passwordError && (
							<p role="alert" className="text-basalt-base text-destructive">
								{t("demo.passwordMismatch")}
							</p>
						)}
						<DemoFeedback {...vm.passwordSave} />
					</form>
				</LayerCard.Body>
			</LayerCard>

			{/* Two-factor */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Smartphone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base font-normal text-muted-foreground">
							{t("pages.settings.twoFactor")}
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1">
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="2fa-authenticator"
								className="text-basalt-base text-foreground cursor-pointer"
							>
								{t("pages.settings.authenticatorApp")}
							</label>
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.settings.authenticatorDesc")}
							</p>
						</div>
						<Switch
							id="2fa-authenticator"
							checked={vm.securityPreferences.authenticator}
							onCheckedChange={(value) => vm.setSecurityPreference("authenticator", value)}
						/>
					</div>
					<Separator className="my-basalt-space-lg bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label htmlFor="2fa-sms" className="text-basalt-base text-foreground cursor-pointer">
								{t("pages.settings.smsVerification")}
							</label>
							<p className="text-basalt-sm text-muted-foreground">{t("pages.settings.smsDesc")}</p>
						</div>
						<Switch
							id="2fa-sms"
							checked={vm.securityPreferences.sms}
							onCheckedChange={(value) => vm.setSecurityPreference("sms", value)}
						/>
					</div>
				</LayerCard.Body>
			</LayerCard>

			{/* Active sessions */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base font-normal text-muted-foreground">
							{t("pages.settings.activeSessions")}
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1 space-y-basalt-space-lg">
					{vm.sessions.map((session) => (
						<LayerCard
							key={session.device}
							className="flex items-center justify-between gap-basalt-layout"
						>
							<div className="space-y-basalt-space-xs">
								<p className="text-basalt-base text-foreground">
									{session.device}
									{session.current && (
										<Badge variant="success" className="ml-basalt-space-lg">
											{t("common.currentBadge")}
										</Badge>
									)}
								</p>
								<p className="text-basalt-sm text-muted-foreground">{session.location}</p>
							</div>
							{!session.current && (
								<Button
									variant="destructive"
									type="button"
									onClick={() => vm.revoke(session.device)}
									aria-label={`${t("common.revoke")} ${session.device}`}
								>
									{t("common.revoke")}
								</Button>
							)}
						</LayerCard>
					))}
				</LayerCard.Body>
			</LayerCard>
		</div>
	);
}

// ── Appearance ──

function AppearanceSection({ vm }: { vm: SettingsVM }) {
	const { t, i18n } = useTranslation();
	const { theme: activeTheme, setTheme } = useTheme();

	return (
		<div className="space-y-basalt-space-lg">
			{/* Theme */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Palette className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base font-normal text-muted-foreground">
							{t("pages.settings.themeTitle")}
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1">
					<div
						className="grid grid-cols-3 gap-basalt-layout"
						role="radiogroup"
						aria-label={t("pages.settings.themeTitle")}
					>
						{(
							[
								{ key: "light", label: t("pages.settings.light") },
								{ key: "dark", label: t("pages.settings.dark") },
								{ key: "system", label: t("pages.settings.systemTheme") },
							] as const
						).map((theme) => (
							<label
								key={theme.key}
								className={`relative cursor-pointer focus-within:ring-2 focus-within:ring-primary flex flex-col items-center gap-basalt-space-lg rounded-basalt-md border p-basalt-space-lg transition-colors basalt-motion ${
									theme.key === activeTheme
										? "border-basalt-primary bg-basalt-selected"
										: "border-border hover:border-primary/50 hover:bg-basalt-hover"
								}`}
							>
								<input
									type="radio"
									name="settings-theme"
									className="sr-only"
									value={theme.key}
									checked={activeTheme === theme.key}
									onChange={() => setTheme(theme.key)}
									aria-label={theme.label}
								/>
								<div
									className={`h-10 w-full rounded-basalt-md ${
										theme.key === "light"
											? "bg-white border border-gray-200"
											: theme.key === "dark"
												? "bg-basalt-muted"
												: "bg-gradient-to-r from-white to-basalt-muted"
									}`}
								/>
								<span className="text-basalt-sm text-foreground">{theme.label}</span>
							</label>
						))}
					</div>
				</LayerCard.Body>
			</LayerCard>

			{/* Currency & language */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h2 className="text-basalt-base font-normal text-muted-foreground">
							{t("pages.settings.preferences")}
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body
					className={`min-h-0 flex-1 ${vm.compact ? "space-y-basalt-space-sm" : "space-y-basalt-space-lg"}`}
				>
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="settings-currency"
								className="text-basalt-base text-foreground cursor-pointer"
							>
								{t("pages.settings.currency")}
							</label>
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.settings.currencyDesc")} ·{" "}
								{new Intl.NumberFormat(i18n.language, {
									style: "currency",
									currency: vm.currency,
								}).format(1240)}
							</p>
						</div>
						<Select value={vm.currency} onValueChange={(value) => vm.setCurrency(value)}>
							<SelectTrigger id="settings-currency" className="w-auto">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="USD">USD ($)</SelectItem>
								<SelectItem value="EUR">EUR (&euro;)</SelectItem>
								<SelectItem value="GBP">GBP (&pound;)</SelectItem>
								<SelectItem value="JPY">JPY (&yen;)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Separator className="bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="settings-language"
								className="text-basalt-base text-foreground cursor-pointer"
							>
								{t("pages.settings.interfaceLanguage")}
							</label>
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.settings.interfaceLanguageDesc")}
							</p>
						</div>
						<Select
							value={i18n.resolvedLanguage}
							onValueChange={(value) => {
								void i18n.changeLanguage(value);
							}}
						>
							<SelectTrigger id="settings-language" className="w-auto">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="en">English</SelectItem>
								<SelectItem value="zh">简体中文</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<Separator className="bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="settings-compact-mode"
								className="text-basalt-base text-foreground cursor-pointer"
							>
								{t("pages.settings.compactMode")}
							</label>
							<p className="text-basalt-sm text-muted-foreground">
								{t("pages.settings.compactModeDesc")}
							</p>
						</div>
						<Switch
							id="settings-compact-mode"
							checked={vm.compact}
							onCheckedChange={vm.setCompact}
						/>
					</div>
				</LayerCard.Body>
			</LayerCard>
		</div>
	);
}
