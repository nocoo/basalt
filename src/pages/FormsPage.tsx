import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { FileDropzone } from "@nocoo/basalt/components/file-dropzone";
import { Input } from "@nocoo/basalt/components/input";
import { InputGroup } from "@nocoo/basalt/components/input-group";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DemoFeedback } from "@/components/examples/DemoFeedback";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useFormsViewModel } from "@/viewmodels/useFormsViewModel";

export default function FormsPage() {
	const { t } = useTranslation();
	const vm = useFormsViewModel();

	return (
		<ShowcasePage title={t("pages.forms.title")} description={t("pages.forms.description")}>
			<p className="text-basalt-base text-muted-foreground">{t("demo.localOnly")}</p>
			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-2">
				<SectionRule title={t("pages.forms.profileForm")}>
					<form
						aria-label={t("pages.forms.profileForm")}
						className="space-y-basalt-space-lg"
						onSubmit={(event) => {
							event.preventDefault();
							const data = new FormData(event.currentTarget);
							vm.profile.submit(
								Object.fromEntries([...data].map(([key, value]) => [key, String(value)])),
							);
						}}
					>
						<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2">
							<div className="space-y-basalt-space-lg">
								<Label htmlFor="profile-first" className="text-foreground">
									{t("pages.forms.firstName")}
								</Label>
								<Input
									id="profile-first"
									name="firstName"
									required
									placeholder={t("pages.forms.firstNamePlaceholder")}
								/>
							</div>
							<div className="space-y-basalt-space-lg">
								<Label htmlFor="profile-last" className="text-foreground">
									{t("pages.forms.lastName")}
								</Label>
								<Input
									id="profile-last"
									name="lastName"
									required
									placeholder={t("pages.forms.lastNamePlaceholder")}
								/>
							</div>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="profile-email" className="text-foreground">
								{t("pages.forms.email")}
							</Label>
							<Input
								id="profile-email"
								name="email"
								required
								type="email"
								placeholder={t("pages.forms.emailPlaceholder")}
							/>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="profile-location" className="text-foreground">
								{t("pages.forms.location")}
							</Label>
							<InputGroup>
								<InputGroup.Addon>
									<MapPin strokeWidth={1.5} />
								</InputGroup.Addon>
								<InputGroup.Input
									id="profile-location"
									name="location"
									placeholder={t("pages.forms.locationPlaceholder")}
								/>
							</InputGroup>
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
						className="space-y-basalt-space-lg"
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
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="security-password" className="text-foreground">
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
							/>
						</div>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="security-confirm" className="text-foreground">
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
							/>
						</div>
						<LayerCard className="flex items-center justify-between">
							<div>
								<p className="text-basalt-base text-foreground">{t("pages.forms.twoFactorAuth")}</p>
								<p className="text-basalt-sm text-muted-foreground">
									{t("pages.forms.twoFactorDesc")}
								</p>
							</div>
							<Switch name="twoFactor" defaultChecked aria-label={t("pages.forms.twoFactorAuth")} />
						</LayerCard>
						<Button type="submit" variant="secondary" loading={vm.security.status === "pending"}>
							{t("pages.forms.updateSecurity")}
						</Button>
						{vm.passwordError && (
							<p role="alert" className="text-basalt-base text-destructive">
								{t("demo.passwordMismatch")}
							</p>
						)}
						<DemoFeedback {...vm.security} />
					</form>
				</SectionRule>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout lg:grid-cols-3">
				<SectionRule title={t("pages.forms.newsletter")}>
					<form
						aria-label={t("pages.forms.newsletter")}
						className="space-y-basalt-space-lg"
						onSubmit={(event) => {
							event.preventDefault();
							vm.newsletter.submit({
								email: String(new FormData(event.currentTarget).get("email")),
							});
						}}
					>
						<div className="space-y-basalt-space-lg">
							<Label htmlFor="news-email" className="text-foreground">
								{t("pages.forms.newsletterEmail")}
							</Label>
							<Input
								id="news-email"
								name="email"
								required
								type="email"
								placeholder={t("pages.forms.newsletterEmailPlaceholder")}
							/>
						</div>
						<div className="flex items-center gap-basalt-space-lg">
							<Checkbox id="news-consent" name="consent" required />
							<label
								htmlFor="news-consent"
								className="text-basalt-sm text-muted-foreground cursor-pointer"
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
					<div className="space-y-basalt-space-lg">
						<FileDropzone
							label={t("pages.forms.fileUpload")}
							description={t("pages.forms.fileTypes")}
							accept="image/png,image/jpeg,application/pdf"
							maxSize={4 * 1024 * 1024}
							browseLabel={t("pages.forms.browseFiles")}
							onFilesAccepted={(files) =>
								vm.setFiles(files.map(({ name, size }) => ({ name, size })))
							}
						/>
						<ul
							className="mt-basalt-space-lg space-y-basalt-space-sm text-basalt-sm break-words"
							aria-live="polite"
						>
							{vm.files.map((file, index) => (
								<li key={`${file.name}-${index}`}>
									{file.name} · {Math.ceil(file.size / 1024)} KB
								</li>
							))}
						</ul>
					</div>
				</SectionRule>

				<SectionRule title={t("pages.forms.successState")}>
					<LayerCard>
						<p className="text-basalt-base font-medium text-foreground">
							{t(
								vm.profile.result || vm.newsletter.result || vm.security.result
									? "pages.forms.formSubmitted"
									: "demo.noSubmissions",
							)}
						</p>
						<p className="text-basalt-sm text-muted-foreground">{t("demo.localOnly")}</p>
						<Separator className="my-basalt-space-lg bg-border" />
						<Button
							variant="secondary"
							size="sm"
							aria-expanded={vm.detailsOpen}
							onClick={() => vm.setDetailsOpen(!vm.detailsOpen)}
						>
							{t("pages.forms.viewDetails")}
						</Button>
						{vm.detailsOpen && (
							<pre className="mt-basalt-space-lg whitespace-pre-wrap break-words text-basalt-sm">
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
					</LayerCard>
				</SectionRule>
			</div>
		</ShowcasePage>
	);
}
