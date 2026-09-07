import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { MapPin } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { DemoFeedback } from "@/components/examples/DemoFeedback";
import { useFormsViewModel } from "@/viewmodels/useFormsViewModel";

export default function FormsPage() {
	const { t } = useTranslation();
	const vm = useFormsViewModel();
	const fileInput = useRef<HTMLInputElement>(null);

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.forms.title")} description={t("pages.forms.description")} />
			<p className="text-sm text-muted-foreground">{t("demo.localOnly")}</p>
			<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<SectionRule title={t("pages.forms.profileForm")}>
					<form
						aria-label={t("pages.forms.profileForm")}
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							vm.profile.submit(
								Object.fromEntries([...data].map(([key, value]) => [key, String(value)])),
							);
						}}
					>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="profile-first" className="text-sm text-foreground">
									{t("pages.forms.firstName")}
								</Label>
								<Input
									id="profile-first"
									name="firstName"
									required
									placeholder={t("pages.forms.firstNamePlaceholder")}
									className="rounded-widget border-border bg-card text-sm"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="profile-last" className="text-sm text-foreground">
									{t("pages.forms.lastName")}
								</Label>
								<Input
									id="profile-last"
									name="lastName"
									required
									placeholder={t("pages.forms.lastNamePlaceholder")}
									className="rounded-widget border-border bg-card text-sm"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="profile-email" className="text-sm text-foreground">
								{t("pages.forms.email")}
							</Label>
							<Input
								id="profile-email"
								name="email"
								required
								type="email"
								placeholder={t("pages.forms.emailPlaceholder")}
								className="rounded-widget border-border bg-card text-sm"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="profile-location" className="text-sm text-foreground">
								{t("pages.forms.location")}
							</Label>
							<div className="relative">
								<MapPin
									className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
									strokeWidth={1.5}
								/>
								<Input
									id="profile-location"
									name="location"
									placeholder={t("pages.forms.locationPlaceholder")}
									className="rounded-widget border-border bg-card pl-10 text-sm"
								/>
							</div>
						</div>
						<Button type="submit" loading={vm.profile.status === "pending"}>
							{t("pages.forms.saveProfile")}
						</Button>
						<DemoFeedback {...vm.profile} />
					</form>
				</SectionRule>

				<SectionRule title={t("pages.forms.security")}>
					<form
						aria-label={t("pages.forms.security")}
						className="space-y-4"
						onSubmit={(event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							vm.updateSecurity(
								String(data.get("password")),
								String(data.get("confirmation")),
								data.has("twoFactor"),
							);
						}}
					>
						<div className="space-y-2">
							<Label htmlFor="security-password" className="text-sm text-foreground">
								{t("pages.forms.password")}
							</Label>
							<Input
								id="security-password"
								name="password"
								required
								minLength={8}
								autoComplete="new-password"
								type="password"
								placeholder="••••••••"
								className="rounded-widget border-border bg-card text-sm"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="security-confirm" className="text-sm text-foreground">
								{t("pages.forms.confirmPassword")}
							</Label>
							<Input
								id="security-confirm"
								name="confirmation"
								required
								minLength={8}
								autoComplete="new-password"
								type="password"
								placeholder="••••••••"
								className="rounded-widget border-border bg-card text-sm"
							/>
						</div>
						<div className="flex items-center justify-between rounded-widget bg-card p-3">
							<div>
								<p className="text-sm text-foreground">{t("pages.forms.twoFactorAuth")}</p>
								<p className="text-xs text-muted-foreground">{t("pages.forms.twoFactorDesc")}</p>
							</div>
							<Switch name="twoFactor" defaultChecked aria-label={t("pages.forms.twoFactorAuth")} />
						</div>
						<Button type="submit" variant="secondary" loading={vm.security.status === "pending"}>
							{t("pages.forms.updateSecurity")}
						</Button>
						{vm.passwordError && (
							<p role="alert" className="text-sm text-destructive">
								{t("demo.passwordMismatch")}
							</p>
						)}
						<DemoFeedback {...vm.security} />
					</form>
				</SectionRule>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<SectionRule title={t("pages.forms.newsletter")}>
					<form
						aria-label={t("pages.forms.newsletter")}
						className="space-y-3"
						onSubmit={(event) => {
							event.preventDefault();
							vm.newsletter.submit({
								email: String(new FormData(event.currentTarget).get("email")),
							});
						}}
					>
						<div className="space-y-2">
							<Label htmlFor="news-email" className="text-sm text-foreground">
								{t("pages.forms.newsletterEmail")}
							</Label>
							<Input
								id="news-email"
								name="email"
								required
								type="email"
								placeholder={t("pages.forms.newsletterEmailPlaceholder")}
								className="rounded-widget border-border bg-card text-sm"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox id="news-consent" name="consent" required />
							<label
								htmlFor="news-consent"
								className="text-xs text-muted-foreground cursor-pointer"
							>
								{t("pages.forms.agreeUpdates")}
							</label>
						</div>
						<Button type="submit" loading={vm.newsletter.status === "pending"}>
							{t("pages.forms.subscribe")}
						</Button>
						<DemoFeedback {...vm.newsletter} />
					</form>
				</SectionRule>

				<SectionRule title={t("pages.forms.fileUpload")}>
					<div className="rounded-widget border border-dashed border-border bg-card p-4 text-center">
						<p className="text-sm text-foreground">{t("demo.selectFiles")}</p>
						<p className="text-xs text-muted-foreground">{t("pages.forms.fileTypes")}</p>
						<input
							type="file"
							multiple
							accept="image/png,image/jpeg,application/pdf"
							ref={fileInput}
							aria-label={t("pages.forms.fileUpload")}
							className="sr-only"
							onChange={(event) => {
								vm.setFiles(
									Array.from(event.currentTarget.files ?? []).map(({ name, size }) => ({
										name,
										size,
									})),
								);
							}}
						/>
						<Button
							variant="secondary"
							size="sm"
							className="mt-3"
							onClick={() => fileInput.current?.click()}
						>
							{t("pages.forms.browseFiles")}
						</Button>
						<ul className="mt-3 space-y-1 text-xs break-words" aria-live="polite">
							{vm.files.map((file, index) => (
								<li key={`${file.name}-${index}`}>
									{file.name} · {Math.ceil(file.size / 1024)} KB
								</li>
							))}
						</ul>
					</div>
				</SectionRule>

				<SectionRule title={t("pages.forms.successState")}>
					<div className="rounded-widget border border-border bg-card p-4">
						<p className="text-sm font-medium text-foreground">
							{t(
								vm.profile.result || vm.newsletter.result || vm.security.result
									? "pages.forms.formSubmitted"
									: "demo.noSubmissions",
							)}
						</p>
						<p className="text-xs text-muted-foreground">{t("demo.localOnly")}</p>
						<Separator className="my-3 bg-border" />
						<Button
							variant="secondary"
							size="sm"
							aria-expanded={vm.detailsOpen}
							onClick={() => vm.setDetailsOpen(!vm.detailsOpen)}
						>
							{t("pages.forms.viewDetails")}
						</Button>
						{vm.detailsOpen && (
							<pre className="mt-3 whitespace-pre-wrap break-words text-xs">
								{JSON.stringify(
									{
										profile: vm.profile.result,
										security: vm.security.result,
										newsletter: vm.newsletter.result,
									},
									null,
									2,
								)}
							</pre>
						)}
					</div>
				</SectionRule>
			</div>
		</div>
	);
}
