import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { Bell, Camera, CreditCard, Globe, Palette, Shield, Smartphone, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// -- Settings sections nav --

const SECTIONS = [
	{ id: "profile", labelKey: "pages.settings.profile", icon: User },
	{ id: "notifications", labelKey: "pages.settings.notifications", icon: Bell },
	{ id: "security", labelKey: "pages.settings.security", icon: Shield },
	{ id: "appearance", labelKey: "pages.settings.appearance", icon: Palette },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

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
	const [activeSection, setActiveSection] = useState<SectionId>("profile");
	const { t } = useTranslation();

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
			{/* Left nav */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none lg:col-span-1">
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4 p-3">
					<nav className="flex flex-row gap-1 lg:flex-col">
						{SECTIONS.map(({ id, labelKey, icon: Icon }) => (
							<button
								type="button"
								key={id}
								onClick={() => setActiveSection(id)}
								aria-label={t(labelKey)}
								className={`flex items-center gap-2 rounded-widget px-3 py-2.5 text-sm transition-colors ${
									activeSection === id
										? "bg-accent text-foreground font-medium"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
								}`}
							>
								<Icon className="h-4 w-4" strokeWidth={1.5} />
								<span className="hidden sm:inline">{t(labelKey)}</span>
							</button>
						))}
					</nav>
				</div>
			</LayerCard>

			{/* Right content */}
			<div className="lg:col-span-3">
				{activeSection === "profile" && <ProfileSection />}
				{activeSection === "notifications" && <NotificationsSection />}
				{activeSection === "security" && <SecuritySection />}
				{activeSection === "appearance" && <AppearanceSection />}
			</div>
		</div>
	);
}

// ── Profile ──

function ProfileSection() {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
			<div className="flex flex-col space-y-2.5 p-4">
				<div className="flex items-center gap-2">
					<User className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h3 className="text-sm font-normal text-muted-foreground">
						{t("pages.settings.profileInfo")}
					</h3>
				</div>
			</div>
			<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-6">
				{/* Avatar */}
				<div className="flex items-center gap-4">
					<div className="relative">
						<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
							<User className="h-7 w-7" strokeWidth={1.5} />
						</div>
						<button
							type="button"
							className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
							aria-label={t("pages.settings.changePhoto")}
						>
							<Camera className="h-3 w-3" aria-hidden="true" strokeWidth={1.5} />
						</button>
					</div>
					<div>
						<p className="text-sm font-medium text-foreground">Alex Johnson</p>
						<p className="text-xs text-muted-foreground">alex@basalt.app</p>
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
							defaultValue="Alex"
							className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-last-name" className="text-sm text-foreground">
							{t("pages.settings.lastName")}
						</Label>
						<Input
							id="settings-last-name"
							defaultValue="Johnson"
							className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-email" className="text-sm text-foreground">
							{t("pages.login.email")}
						</Label>
						<Input
							id="settings-email"
							defaultValue="alex@basalt.app"
							type="email"
							className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="settings-phone" className="text-sm text-foreground">
							{t("pages.settings.phone")}
						</Label>
						<Input
							id="settings-phone"
							defaultValue="+1 (555) 123-4567"
							type="tel"
							className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
						/>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="settings-bio" className="text-sm text-foreground">
						{t("pages.settings.bio")}
					</Label>
					<textarea
						id="settings-bio"
						defaultValue="Product designer and financial enthusiast."
						rows={3}
						className="w-full rounded-widget border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
					/>
				</div>

				<div className="flex justify-end gap-3">
					<button
						type="button"
						className="rounded-widget bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						{t("common.cancel")}
					</button>
					<button
						type="button"
						className="rounded-widget bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						{t("common.save")}
					</button>
				</div>
			</div>
		</LayerCard>
	);
}

// ── Notifications ──

function NotificationsSection() {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
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
							<Switch id={`notif-${item.id}`} defaultChecked={item.defaultOn} />
						</div>
						{i < NOTIFICATION_TOGGLES.length - 1 && <Separator className="bg-border" />}
					</div>
				))}
			</div>
		</LayerCard>
	);
}

// ── Security ──

function SecuritySection() {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			{/* Password */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Shield className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.passwordTitle")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="settings-current-password" className="text-sm text-foreground">
							{t("pages.settings.currentPassword")}
						</Label>
						<Input
							id="settings-current-password"
							type="password"
							placeholder="••••••••"
							className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="settings-new-password" className="text-sm text-foreground">
								{t("pages.settings.newPassword")}
							</Label>
							<Input
								id="settings-new-password"
								type="password"
								placeholder="••••••••"
								className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="settings-confirm-password" className="text-sm text-foreground">
								{t("pages.settings.confirmPassword")}
							</Label>
							<Input
								id="settings-confirm-password"
								type="password"
								placeholder="••••••••"
								className="rounded-widget border-border bg-card text-sm focus-visible:ring-primary"
							/>
						</div>
					</div>
					<div className="flex justify-end">
						<button
							type="button"
							className="rounded-widget bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							{t("pages.settings.updatePassword")}
						</button>
					</div>
				</div>
			</LayerCard>

			{/* Two-factor */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
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
						<Switch id="2fa-authenticator" />
					</div>
					<Separator className="my-4 bg-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="2fa-sms" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.smsVerification")}
							</label>
							<p className="text-xs text-muted-foreground">{t("pages.settings.smsDesc")}</p>
						</div>
						<Switch id="2fa-sms" defaultChecked />
					</div>
				</div>
			</LayerCard>

			{/* Active sessions */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<Globe className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.activeSessions")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-3">
					{[
						{ device: "MacBook Pro — Chrome", location: "San Francisco, US", current: true },
						{ device: "iPhone 15 — Safari", location: "San Francisco, US", current: false },
						{ device: "Windows PC — Firefox", location: "New York, US", current: false },
					].map((session) => (
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

function AppearanceSection() {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			{/* Theme */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
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
							<button
								type="button"
								key={theme.key}
								role="radio"
								aria-checked={theme.key === "dark"}
								className={`flex flex-col items-center gap-2 rounded-widget border p-4 transition-colors ${
									theme.key === "dark"
										? "border-primary bg-accent"
										: "border-border hover:border-primary/50 hover:bg-accent/50"
								}`}
							>
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
							</button>
						))}
					</div>
				</div>
			</LayerCard>

			{/* Currency & language */}
			<LayerCard className="flex flex-col ring-0 rounded-card border-0 bg-secondary shadow-none">
				<div className="flex flex-col space-y-2.5 p-4">
					<div className="flex items-center gap-2">
						<CreditCard className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
						<h3 className="text-sm font-normal text-muted-foreground">
							{t("pages.settings.preferences")}
						</h3>
					</div>
				</div>
				<div className="min-h-0 flex-1 px-4 pt-0 pb-4 space-y-4">
					<div className="flex items-center justify-between">
						<div className="space-y-0.5">
							<label htmlFor="settings-currency" className="text-sm text-foreground cursor-pointer">
								{t("pages.settings.currency")}
							</label>
							<p className="text-xs text-muted-foreground">{t("pages.settings.currencyDesc")}</p>
						</div>
						<select
							id="settings-currency"
							className="rounded-widget border border-border bg-card px-3 py-1.5 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
						>
							<option>USD ($)</option>
							<option>EUR (&euro;)</option>
							<option>GBP (&pound;)</option>
							<option>JPY (&yen;)</option>
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
							className="rounded-widget border border-border bg-card px-3 py-1.5 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary"
						>
							<option>{t("pages.settings.english")}</option>
							<option>{t("pages.settings.spanish")}</option>
							<option>{t("pages.settings.french")}</option>
							<option>{t("pages.settings.german")}</option>
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
						<Switch id="settings-compact-mode" />
					</div>
				</div>
			</LayerCard>
		</div>
	);
}
