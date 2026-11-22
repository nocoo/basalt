import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
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
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Bell, Camera, CreditCard, Globe, Palette, Shield, Smartphone, User } from "lucide-react";
import { useRef } from "react";
import { DemoFeedback } from "@/components/examples/DemoFeedback";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useSettingsViewModel } from "@/viewmodels/useSettingsViewModel";

// -- Settings sections nav --

const SECTIONS = [
	{ id: "profile", label: "Profile", icon: User },
	{ id: "notifications", label: "Notifications", icon: Bell },
	{ id: "security", label: "Security", icon: Shield },
	{ id: "appearance", label: "Appearance", icon: Palette },
] as const;

type SettingsVM = ReturnType<typeof useSettingsViewModel>;

const DEMO_NOTICES = {
	preferences: "Preferences updated for this demo.",
	revoked: "Session removed from this demo.",
} as const;

// -- Notification toggles --

interface NotifToggle {
	id: string;
	label: string;
	description: string;
	defaultOn: boolean;
}

const NOTIFICATION_TOGGLES: NotifToggle[] = [
	{
		id: "email",
		label: "Email notifications",
		description: "Receive transaction alerts via email",
		defaultOn: true,
	},
	{
		id: "push",
		label: "Push notifications",
		description: "Browser and mobile push alerts",
		defaultOn: true,
	},
	{
		id: "marketing",
		label: "Marketing emails",
		description: "Tips, product updates, and offers",
		defaultOn: false,
	},
	{
		id: "weekly",
		label: "Weekly digest",
		description: "Summary of your weekly spending",
		defaultOn: true,
	},
	{
		id: "security",
		label: "Security alerts",
		description: "Login attempts and password changes",
		defaultOn: true,
	},
];

// -- Component --

export default function SettingsPage() {
	const vm = useSettingsViewModel();
	const { activeSection, setActiveSection } = vm;

	return (
		<ShowcasePage
			title="Settings"
			description="Manage your profile, security, and appearance preferences."
		>
			<div className="grid grid-cols-1 gap-basalt-layout @[52rem]/island:grid-cols-4">
				{/* Left nav */}
				<LayerCard className="flex flex-col @[52rem]/island:col-span-1" padding="none">
					<LayerCard.Body className="flex-1">
						<SidebarNav
							aria-label="Settings"
							className="flex-row flex-wrap @[52rem]/island:flex-col"
						>
							{SECTIONS.map(({ id, label, icon: Icon }) => (
								<SidebarItem
									className="w-auto @[52rem]/island:w-full"
									type="button"
									key={id}
									onClick={() => setActiveSection(id)}
									aria-label={label}
									active={activeSection === id}
								>
									<Icon />
									<span>{label}</span>
								</SidebarItem>
							))}
						</SidebarNav>
					</LayerCard.Body>
					<LayerCard.Footer className="flex-col items-start">
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Local demo. These actions do not update a real account or service.
						</p>
						{vm.notice && (
							<p
								role="status"
								aria-live="polite"
								className="text-basalt-sm text-basalt-muted-foreground"
							>
								{DEMO_NOTICES[vm.notice]}
							</p>
						)}
					</LayerCard.Footer>
				</LayerCard>

				{/* Right content */}
				<div className="@[52rem]/island:col-span-3">
					{activeSection === "profile" && <ProfileSection vm={vm} />}
					{activeSection === "notifications" && <NotificationsSection vm={vm} />}
					{activeSection === "security" && <SecuritySection vm={vm} />}
					{activeSection === "appearance" && <AppearanceSection vm={vm} />}
				</div>
			</div>
		</ShowcasePage>
	);
}

// ── Profile ──

function ProfileSection({ vm }: { vm: SettingsVM }) {
	const photoInput = useRef<HTMLInputElement>(null);

	return (
		<LayerCard className="flex flex-col" padding="none">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<User className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Profile Information
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body>
				<form
					aria-label="Profile Information"
					className="min-h-0 flex-1 space-y-basalt-card"
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
						aria-label="Choose a profile photo"
						onChange={(event) => vm.setPhoto(event.currentTarget.files?.[0]?.name ?? "")}
					/>
					<div className="flex items-center gap-basalt-card">
						<div className="relative">
							<div className="flex h-16 w-16 items-center justify-center rounded-basalt-full bg-basalt-primary/10 text-basalt-link">
								<User className="h-7 w-7" />
							</div>
							<Button
								variant="secondary"
								size="icon"
								type="button"
								className="absolute -bottom-1 -right-1"
								aria-label="Change profile photo"
								onClick={() => photoInput.current?.click()}
							>
								<Camera className="size-basalt-icon-sm" aria-hidden="true" />
							</Button>
						</div>
						<div>
							<p className="text-basalt-base font-medium text-basalt-foreground">
								{vm.profile.firstName} {vm.profile.lastName}
							</p>
							<p className="text-basalt-sm text-basalt-muted-foreground">{vm.profile.email}</p>
							{vm.photo && (
								<p role="status" className="text-basalt-sm text-basalt-muted-foreground break-all">
									{vm.photo}
								</p>
							)}
						</div>
					</div>

					<Separator className="bg-basalt-border" />

					{/* Form fields */}
					<div className="grid grid-cols-1 gap-basalt-card sm:grid-cols-2">
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="settings-first-name" className="text-basalt-foreground">
								First name
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
							<Label htmlFor="settings-last-name" className="text-basalt-foreground">
								Last name
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
							<Label htmlFor="settings-email" className="text-basalt-foreground">
								Email
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
							<Label htmlFor="settings-phone" className="text-basalt-foreground">
								Phone
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
						<Label htmlFor="settings-bio" className="text-basalt-foreground">
							Bio
						</Label>
						<Textarea
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
							Cancel
						</Button>
						<Button variant="default" type="submit" disabled={vm.profileSave.status === "pending"}>
							Save changes
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
	return (
		<LayerCard className="flex flex-col" padding="none">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Bell className="size-basalt-icon text-basalt-muted-foreground" />
					<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
						Notification Preferences
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 divide-y divide-basalt-border/60">
				{NOTIFICATION_TOGGLES.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between gap-basalt-card py-basalt-card-sm first:pt-0 last:pb-0"
					>
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor={`notif-${item.id}`}
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								{item.label}
							</label>
							<p className="text-basalt-sm text-basalt-muted-foreground">{item.description}</p>
						</div>
						<Switch
							id={`notif-${item.id}`}
							checked={vm.notifications[item.id]}
							onCheckedChange={(value) => vm.setNotification(item.id, value)}
						/>
					</div>
				))}
			</LayerCard.Body>
		</LayerCard>
	);
}

// ── Security ──

function SecuritySection({ vm }: { vm: SettingsVM }) {
	return (
		<div className="space-y-basalt-card">
			{/* Password */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Shield className="size-basalt-icon text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Password</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body>
					<form
						aria-label="Password"
						className="min-h-0 flex-1 space-y-basalt-card"
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
							<Label htmlFor="settings-current-password" className="text-basalt-foreground">
								Current password
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
						<div className="grid grid-cols-1 gap-basalt-card sm:grid-cols-2">
							<div className="space-y-basalt-space-lg">
								<Label htmlFor="settings-new-password" className="text-basalt-foreground">
									New password
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
								<Label htmlFor="settings-confirm-password" className="text-basalt-foreground">
									Confirm new password
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
								Update password
							</Button>
						</div>
						{vm.passwordError && (
							<p role="alert" className="text-basalt-base text-basalt-danger-solid">
								Use at least 8 characters and matching passwords.
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
						<Smartphone className="size-basalt-icon text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">
							Two-Factor Authentication
						</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1">
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="2fa-authenticator"
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								Authenticator app
							</label>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Add an extra layer of security with TOTP
							</p>
						</div>
						<Switch
							id="2fa-authenticator"
							checked={vm.securityPreferences.authenticator}
							onCheckedChange={(value) => vm.setSecurityPreference("authenticator", value)}
						/>
					</div>
					<Separator className="my-basalt-card-sm bg-basalt-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="2fa-sms"
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								SMS verification
							</label>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Receive codes via text message
							</p>
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
						<Globe className="size-basalt-icon text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Active Sessions</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1 divide-y divide-basalt-border/60">
					{vm.sessions.map((session) => (
						<div
							key={session.device}
							className="flex items-center justify-between gap-basalt-card py-basalt-card-sm first:pt-0 last:pb-0"
						>
							<div className="space-y-basalt-space-xs">
								<p className="text-basalt-base text-basalt-foreground">
									{session.device}
									{session.current && (
										<Badge tone="success" className="ml-basalt-space-lg">
											Current
										</Badge>
									)}
								</p>
								<p className="text-basalt-sm text-basalt-muted-foreground">{session.location}</p>
							</div>
							{!session.current && (
								<Button
									variant="destructive"
									type="button"
									onClick={() => vm.revoke(session.device)}
									aria-label={`Revoke ${session.device}`}
								>
									Revoke
								</Button>
							)}
						</div>
					))}
				</LayerCard.Body>
			</LayerCard>
		</div>
	);
}

// ── Appearance ──

function AppearanceSection({ vm }: { vm: SettingsVM }) {
	const { theme: activeTheme, setTheme } = useTheme();

	return (
		<div className="space-y-basalt-card">
			{/* Theme */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<Palette className="size-basalt-icon text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Theme</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body className="min-h-0 flex-1">
					<div className="grid grid-cols-3 gap-basalt-layout" role="radiogroup" aria-label="Theme">
						{(
							[
								{ key: "light", label: "Light" },
								{ key: "dark", label: "Dark" },
								{ key: "system", label: "System" },
							] as const
						).map((theme) => (
							<label
								key={theme.key}
								className={`basalt-focus-group relative cursor-pointer flex flex-col items-center gap-basalt-card-sm rounded-basalt-md border p-basalt-card-sm transition-colors basalt-motion ${
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
								<span className="text-basalt-sm text-basalt-foreground">{theme.label}</span>
							</label>
						))}
					</div>
				</LayerCard.Body>
			</LayerCard>

			{/* Preferences */}
			<LayerCard className="flex flex-col" padding="none">
				<LayerCard.Header className="flex-col">
					<div className="flex items-center gap-basalt-space-lg">
						<CreditCard className="size-basalt-icon text-basalt-muted-foreground" />
						<h2 className="text-basalt-lg font-semibold text-basalt-foreground">Preferences</h2>
					</div>
				</LayerCard.Header>
				<LayerCard.Body
					className={`min-h-0 flex-1 ${vm.compact ? "space-y-basalt-card-sm" : "space-y-basalt-card"}`}
				>
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="settings-currency"
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								Currency
							</label>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Default display currency ·{" "}
								{new Intl.NumberFormat("en-US", {
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
					<Separator className="bg-basalt-border" />
					<div className="flex items-center justify-between">
						<div className="space-y-basalt-space-xs">
							<label
								htmlFor="settings-compact-mode"
								className="text-basalt-base text-basalt-foreground cursor-pointer"
							>
								Compact mode
							</label>
							<p className="text-basalt-sm text-basalt-muted-foreground">
								Use tighter spacing in this preferences preview.
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
