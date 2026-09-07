import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Bell, Camera, CreditCard, Globe, Palette, Shield, Smartphone, User } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { DemoFeedback } from "@/components/examples/DemoFeedback";
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
		<div className="space-y-6">
			<PageHeader title={t("pages.settings.title")} description={t("pages.settings.description")} />
			<p className="text-sm text-muted-foreground">{t("demo.localOnly")}</p>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
				{/* Left nav */}
				<LayerCard className="flex flex-col lg:col-span-1" padding="none">
					<div className="min-h-0 flex-1 px-4 pt-0 pb-4 p-3">
						<nav
							aria-label={t("pages.settings.title")}
							className="flex flex-row flex-wrap gap-1 lg:flex-col"
						>
							{SECTIONS.map(({ id, labelKey, icon: Icon }) => (
								<button
									type="button"
									key={id}
									onClick={() => setActiveSection(id)}
									aria-label={t(labelKey)}
									aria-current={activeSection === id ? "page" : undefined}
									className={`flex items-center gap-2 rounded-widget px-3 py-2.5 text-sm transition-colors ${
										activeSection === id
											? "bg-accent text-foreground font-medium"
											: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
									}`}
								>
									<Icon className="h-4 w-4" strokeWidth={1.5} />
									<span className="text-xs sm:text-sm">{t(labelKey)}</span>
								</button>
							))}
						</nav>
					</div>
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
				<p role="status" className="text-sm text-muted-foreground">
					{t(`demo.${vm.notice}`)}
				</p>
			)}
		</div>
	);
}

// ── Profile ──

function ProfileSection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();
	const photoInput = useRef<HTMLInputElement>(null);

	return (
		<LayerCard className="flex flex-col" padding="none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("pages.settings.profileInfo")}
					</h3>
				</div>
			</div>
			<form
				aria-label={t("pages.settings.profileInfo")}
				className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-6"
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
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
							<User className="h-7 w-7" strokeWidth={1.5} />
						</div>
						<button
							type="button"
							className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
							aria-label={t("pages.settings.changePhoto")}
							onClick={() => photoInput.current?.click()}
						>
							<Camera className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} />
						</button>
					</div>
					<div>
						<p className="text-sm font-medium text-foreground">
							{vm.profile.firstName} {vm.profile.lastName}
						</p>
						<p className="text-xs text-muted-foreground">{vm.profile.email}</p>
						{vm.photo && (
							<p role="status" className="text-xs text-muted-foreground break-all">
								{vm.photo}
							</p>
						)}
					</div>
				</div>

				<Separator className="bg-border" />

				{/* Form fields */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="settings-first-name" className="text-sm text-foreground">
							{t("pages.settings.firstName")}
						</Label>
						<Input
							id="settings-first-name"
							name="firstName"
							disabled={vm.profileSave.status === "pending"}
							required
							value={vm.draft.firstName}
							onChange={(event) => vm.changeField("firstName", event.target.value)}
							className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-last-name" className="text-sm text-foreground">
							{t("pages.settings.lastName")}
						</Label>
						<Input
							id="settings-last-name"
							name="lastName"
							disabled={vm.profileSave.status === "pending"}
							required
							value={vm.draft.lastName}
							onChange={(event) => vm.changeField("lastName", event.target.value)}
							className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-email" className="text-sm text-foreground">
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
							className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-phone" className="text-sm text-foreground">
							{t("pages.settings.phone")}
						</Label>
						<Input
							id="settings-phone"
							name="phone"
							disabled={vm.profileSave.status === "pending"}
							value={vm.draft.phone}
							onChange={(event) => vm.changeField("phone", event.target.value)}
							type="tel"
							className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="settings-bio" className="text-sm text-foreground">
						{t("pages.settings.bio")}
					</Label>
					<textarea
						id="settings-bio"
						name="bio"
						disabled={vm.profileSave.status === "pending"}
						value={vm.draft.bio}
						onChange={(event) => vm.changeField("bio", event.target.value)}
						rows={3}
						className="w-full rounded-widget border border-border bg-basalt-control px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
					/>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						onClick={vm.cancelProfile}
						className="rounded-widget bg-basalt-control px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						{t("common.cancel")}
					</button>
					<button
						type="submit"
						disabled={vm.profileSave.status === "pending"}
						className="rounded-widget disabled:opacity-50 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						{t("common.save")}
					</button>
				</div>
				<DemoFeedback {...vm.profileSave} />
			</form>
		</LayerCard>
	);
}

// ── Notifications ──

function NotificationsSection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col" padding="none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<Bell className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("pages.settings.notificationPrefs")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-1">
				{NOTIFICATION_TOGGLES.map((item, i) => (
					<div key={item.id}>
						<div className="flex items-center justify-between py-3">
							<div className="space-y-0.5">
								<label
									htmlFor={`notif-${item.id}`}
									className="text-sm text-foreground cursor-pointer"
								>
									{t(item.labelKey)}
								</label>
								<p className="text-xs text-muted-foreground">{t(item.descriptionKey)}</p>
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
			</div>
		</LayerCard>
	);
}

// ── Security ──

function SecuritySection({ vm }: { vm: SettingsVM }) {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			{/* Password */}
			<LayerCard className="flex flex-col" padding="none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.passwordTitle")}
						</h3>
					</div>
				</div>
				<form
					aria-label={t("pages.settings.passwordTitle")}
					className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-4"
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
					<div className="space-y-2">
						<Label htmlFor="settings-current-password" className="text-sm text-foreground">
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
							className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="settings-new-password" className="text-sm text-foreground">
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
								className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="settings-confirm-password" className="text-sm text-foreground">
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
								className="rounded-widget border-border bg-basalt-control text-sm focus-visible:ring-primary"
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={vm.passwordSave.status === "pending"}
							className="rounded-widget disabled:opacity-50 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							{t("pages.settings.updatePassword")}
						</button>
					</div>
					{vm.passwordError && (
						<p role="alert" className="text-sm text-destructive">
							{t("demo.passwordMismatch")}
						</p>
					)}
					<DemoFeedback {...vm.passwordSave} />
				</form>
			</LayerCard>

			{/* Two-factor */}
			<LayerCard className="flex flex-col" padding="none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Smartphone className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.twoFactor")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="2fa-authenticator" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.authenticatorApp")}
							</label>
							<p className="text-xs text-muted-foreground">
								{t("pages.settings.authenticatorDesc")}
							</p>
						</div>
						<Switch
							id="2fa-authenticator"
							checked={vm.securityPreferences.authenticator}
							onCheckedChange={(value) => vm.setSecurityPreference("authenticator", value)}
						/>
					</div>
					<Separator className="my-4 bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="2fa-sms" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.smsVerification")}
							</label>
							<p className="text-xs text-muted-foreground">{t("pages.settings.smsDesc")}</p>
						</div>
						<Switch
							id="2fa-sms"
							checked={vm.securityPreferences.sms}
							onCheckedChange={(value) => vm.setSecurityPreference("sms", value)}
						/>
					</div>
				</div>
			</LayerCard>

			{/* Active sessions */}
			<LayerCard className="flex flex-col" padding="none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.activeSessions")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-3">
					{vm.sessions.map((session) => (
						<div
							key={session.device}
							className="flex items-center justify-between rounded-widget border border-border p-3"
						>
							<div className="space-y-0.5">
								<p className="text-sm text-foreground">
									{session.device}
									{session.current && (
										<span className="ml-2 rounded-sm bg-success/10 px-1.5 py-0.5 text-xs font-medium text-success">
											{t("common.currentBadge")}
										</span>
									)}
								</p>
								<p className="text-xs text-muted-foreground">{session.location}</p>
							</div>
							{!session.current && (
								<button
									type="button"
									onClick={() => vm.revoke(session.device)}
									aria-label={`${t("common.revoke")} ${session.device}`}
									className="text-xs text-destructive hover:text-destructive/80 transition-colors"
								>
									{t("common.revoke")}
								</button>
							)}
						</div>
					))}
				</div>
			</LayerCard>
		</div>
	);
}

// ── Appearance ──

function AppearanceSection({ vm }: { vm: SettingsVM }) {
	const { t, i18n } = useTranslation();
	const { theme: activeTheme, setTheme } = useTheme();

	return (
		<div className="space-y-4">
			{/* Theme */}
			<LayerCard className="flex flex-col" padding="none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Palette className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.themeTitle")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4">
					<div
						className="grid grid-cols-3 gap-3"
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
								className={`relative cursor-pointer focus-within:ring-2 focus-within:ring-primary flex flex-col items-center gap-2 rounded-widget border p-4 transition-colors ${
									theme.key === activeTheme
										? "border-primary bg-accent"
										: "border-border hover:border-primary/50 hover:bg-accent/50"
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
									className={`h-10 w-full rounded-lg ${
										theme.key === "light"
											? "bg-white border border-gray-200"
											: theme.key === "dark"
												? "bg-[#171717]"
												: "bg-gradient-to-r from-white to-[#171717]"
									}`}
								/>
								<span className="text-xs text-foreground">{theme.label}</span>
							</label>
						))}
					</div>
				</div>
			</LayerCard>

			{/* Currency & language */}
			<LayerCard className="flex flex-col" padding="none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.preferences")}
						</h3>
					</div>
				</div>
				<div className={`min-h-0 flex-1 px-4 pt-0 pb-4 ${vm.compact ? "space-y-2" : "space-y-4"}`}>
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="settings-currency" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.currency")}
							</label>
							<p className="text-xs text-muted-foreground">
								{t("pages.settings.currencyDesc")} ·{" "}
								{new Intl.NumberFormat(i18n.language, {
									style: "currency",
									currency: vm.currency,
								}).format(1240)}
							</p>
						</div>
						<select
							id="settings-currency"
							value={vm.currency}
							onChange={(event) => vm.setCurrency(event.target.value)}
							className="rounded-widget border border-border bg-basalt-control px-3 py-1.5 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
						>
							<option value="USD">USD ($)</option>
							<option value="EUR">EUR (&euro;)</option>
							<option value="GBP">GBP (&pound;)</option>
							<option value="JPY">JPY (&yen;)</option>
						</select>
					</div>
					<Separator className="bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="settings-language" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.interfaceLanguage")}
							</label>
							<p className="text-xs text-muted-foreground">
								{t("pages.settings.interfaceLanguageDesc")}
							</p>
						</div>
						<select
							id="settings-language"
							value={i18n.resolvedLanguage}
							onChange={(event) => {
								void i18n.changeLanguage(event.target.value);
							}}
							className="rounded-widget border border-border bg-basalt-control px-3 py-1.5 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
						>
							<option value="en">English</option>
							<option value="zh">简体中文</option>
						</select>
					</div>
					<Separator className="bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label
								htmlFor="settings-compact-mode"
								className="text-sm text-foreground cursor-pointer"
							>
								{t("pages.settings.compactMode")}
							</label>
							<p className="text-xs text-muted-foreground">{t("pages.settings.compactModeDesc")}</p>
						</div>
						<Switch
							id="settings-compact-mode"
							checked={vm.compact}
							onCheckedChange={vm.setCompact}
						/>
					</div>
				</div>
			</LayerCard>
		</div>
	);
}
