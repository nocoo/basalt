import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { Separator } from "@nocoo/basalt/components/separator";
import { Switch } from "@nocoo/basalt/components/switch";
import { Check, FormInput, Mail, MapPin, Shield, Upload, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageIntro } from "@/components/PageIntro";

function Section({
	title,
	icon: Icon,
	children,
}: {
	title: string;
	icon: React.ElementType;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-card bg-secondary p-4 md:p-5">
			<div className="flex items-center gap-2 mb-4">
				<Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
				<p className="text-sm text-muted-foreground">{title}</p>
			</div>
			{children}
		</div>
	);
}

export default function FormsPage() {
	const { t } = useTranslation();

	return (
		<div className="space-y-4">
			<PageIntro
				title={t("pages.forms.title")}
				description={t("pages.forms.description")}
				eyebrow={t("pages.forms.eyebrow")}
				icon={FormInput}
			/>
			<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
				<Section title={t("pages.forms.profileForm")} icon={User}>
					<form className="space-y-4">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="profile-first" className="text-sm text-foreground">
									{t("pages.forms.firstName")}
								</Label>
								<Input
									id="profile-first"
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
									placeholder={t("pages.forms.locationPlaceholder")}
									className="rounded-widget border-border bg-card pl-10 text-sm"
								/>
							</div>
						</div>
						<Button>{t("pages.forms.saveProfile")}</Button>
					</form>
				</Section>

				<Section title={t("pages.forms.security")} icon={Shield}>
					<form className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="security-password" className="text-sm text-foreground">
								{t("pages.forms.password")}
							</Label>
							<Input
								id="security-password"
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
							<Switch defaultChecked aria-label={t("pages.forms.twoFactorAuth")} />
						</div>
						<Button variant="secondary">{t("pages.forms.updateSecurity")}</Button>
					</form>
				</Section>
			</div>

			<div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<Section title={t("pages.forms.newsletter")} icon={Mail}>
					<form className="space-y-3">
						<div className="space-y-2">
							<Label htmlFor="news-email" className="text-sm text-foreground">
								{t("pages.forms.newsletterEmail")}
							</Label>
							<Input
								id="news-email"
								placeholder={t("pages.forms.newsletterEmailPlaceholder")}
								className="rounded-widget border-border bg-card text-sm"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox id="news-consent" />
							<label
								htmlFor="news-consent"
								className="text-xs text-muted-foreground cursor-pointer"
							>
								{t("pages.forms.agreeUpdates")}
							</label>
						</div>
						<Button>{t("pages.forms.subscribe")}</Button>
					</form>
				</Section>

				<Section title={t("pages.forms.fileUpload")} icon={Upload}>
					<div className="rounded-widget border border-dashed border-border bg-card p-4 text-center">
						<p className="text-sm text-foreground">{t("pages.forms.dropFilesHere")}</p>
						<p className="text-xs text-muted-foreground">{t("pages.forms.fileTypes")}</p>
						<Button variant="secondary" size="sm" className="mt-3">
							{t("pages.forms.browseFiles")}
						</Button>
					</div>
				</Section>

				<Section title={t("pages.forms.successState")} icon={Check}>
					<div className="rounded-widget border border-border bg-card p-4">
						<p className="text-sm font-medium text-foreground">{t("pages.forms.formSubmitted")}</p>
						<p className="text-xs text-muted-foreground">{t("pages.forms.responseRecorded")}</p>
						<Separator className="my-3 bg-border" />
						<Button variant="secondary" size="sm">
							{t("pages.forms.viewDetails")}
						</Button>
					</div>
				</Section>
			</div>
		</div>
	);
}
