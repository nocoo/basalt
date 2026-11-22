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
import { DemoFeedback } from "@/components/examples/DemoFeedback";
import { ShowcasePage } from "@/components/ShowcasePage";
import { useFormsViewModel } from "@/viewmodels/useFormsViewModel";

const FORM_STACK_CLASS = "space-y-basalt-layout";
const FIELD_STACK_CLASS = "space-y-basalt-space-lg";

export default function FormsPage() {
	const vm = useFormsViewModel();

	return (
		<ShowcasePage
			title="Form layouts that feel premium"
			description="Input clusters, validation states, and action blocks designed for conversion and clarity."
		>
			<div className="grid grid-cols-1 gap-basalt-layout @[48rem]/island:grid-cols-2">
				<SectionRule title="Profile Form" className="flex flex-col space-y-0 gap-basalt-layout-sm">
					<LayerCard padding="lg" className="flex-1">
						<form
							aria-label="Profile Form"
							data-form-stack=""
							className={FORM_STACK_CLASS}
							onSubmit={(event) => {
								event.preventDefault();
								const data = new FormData(event.currentTarget);
								vm.profile.submit(
									Object.fromEntries([...data].map(([key, value]) => [key, String(value)])),
								);
							}}
						>
							<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2">
								<div data-field="" className={FIELD_STACK_CLASS}>
									<Label htmlFor="profile-first" className="text-basalt-foreground">
										First name
									</Label>
									<Input id="profile-first" name="firstName" required placeholder="Alex" />
								</div>
								<div data-field="" className={FIELD_STACK_CLASS}>
									<Label htmlFor="profile-last" className="text-basalt-foreground">
										Last name
									</Label>
									<Input id="profile-last" name="lastName" required placeholder="Johnson" />
								</div>
							</div>
							<div data-field="" className={FIELD_STACK_CLASS}>
								<Label htmlFor="profile-email" className="text-basalt-foreground">
									Email
								</Label>
								<Input
									id="profile-email"
									name="email"
									required
									type="email"
									placeholder="alex@basalt.app"
								/>
							</div>
							<div data-field="" className={FIELD_STACK_CLASS}>
								<Label htmlFor="profile-location" className="text-basalt-foreground">
									Location
								</Label>
								<InputGroup>
									<InputGroup.Addon>
										<MapPin />
									</InputGroup.Addon>
									<InputGroup.Input
										id="profile-location"
										name="location"
										placeholder="San Francisco, CA"
									/>
								</InputGroup>
							</div>
							<Button type="submit" loading={vm.profile.status === "pending"}>
								Save profile
							</Button>
							<DemoFeedback {...vm.profile} />
						</form>
					</LayerCard>
				</SectionRule>

				<SectionRule title="Security" className="flex flex-col space-y-0 gap-basalt-layout-sm">
					<LayerCard padding="lg" className="flex-1">
						<form
							aria-label="Security"
							data-form-stack=""
							className={FORM_STACK_CLASS}
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
							<div data-field="" className={FIELD_STACK_CLASS}>
								<Label htmlFor="security-password" className="text-basalt-foreground">
									Password
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
							<div data-field="" className={FIELD_STACK_CLASS}>
								<Label htmlFor="security-confirm" className="text-basalt-foreground">
									Confirm password
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
							<div className="flex items-center justify-between gap-basalt-card rounded-basalt-md border border-basalt-border/60 p-basalt-card-sm">
								<div>
									<p className="text-basalt-base text-basalt-foreground">
										Two-factor authentication
									</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										Add a layer of protection
									</p>
								</div>
								<Switch name="twoFactor" defaultChecked aria-label="Two-factor authentication" />
							</div>
							<Button type="submit" variant="secondary" loading={vm.security.status === "pending"}>
								Update security
							</Button>
							{vm.passwordError && (
								<p role="alert" className="text-basalt-base text-basalt-danger-solid">
									Use at least 8 characters and matching passwords.
								</p>
							)}
							<DemoFeedback {...vm.security} />
						</form>
					</LayerCard>
				</SectionRule>
			</div>

			<div className="grid grid-cols-1 gap-basalt-layout @[60rem]/island:grid-cols-3">
				<SectionRule title="Newsletter" className="flex flex-col space-y-0 gap-basalt-layout-sm">
					<LayerCard padding="lg" className="flex-1">
						<form
							aria-label="Newsletter"
							data-form-stack=""
							className={FORM_STACK_CLASS}
							onSubmit={(event) => {
								event.preventDefault();
								vm.newsletter.submit({
									email: String(new FormData(event.currentTarget).get("email")),
								});
							}}
						>
							<div data-field="" className={FIELD_STACK_CLASS}>
								<Label htmlFor="news-email" className="text-basalt-foreground">
									Email
								</Label>
								<Input
									id="news-email"
									name="email"
									required
									type="email"
									placeholder="you@company.com"
								/>
							</div>
							<div className="flex items-center gap-basalt-space-lg">
								<Checkbox id="news-consent" name="consent" required />
								<label
									htmlFor="news-consent"
									className="text-basalt-sm text-basalt-muted-foreground cursor-pointer"
								>
									I agree to receive product updates.
								</label>
							</div>
							<Button type="submit" loading={vm.newsletter.status === "pending"}>
								Subscribe
							</Button>
							<DemoFeedback {...vm.newsletter} />
						</form>
					</LayerCard>
				</SectionRule>

				<SectionRule title="File Upload" className="flex flex-col space-y-0 gap-basalt-layout-sm">
					<LayerCard padding="lg" className="flex-1">
						<div className="space-y-basalt-card">
							<FileDropzone
								label="File Upload"
								description="PNG, JPG, or PDF up to 4MB"
								accept="image/png,image/jpeg,application/pdf"
								maxSize={4 * 1024 * 1024}
								browseLabel="Browse files"
								onFilesAccepted={(files) =>
									vm.setFiles(files.map(({ name, size }) => ({ name, size })))
								}
							/>
							<ul className="space-y-basalt-space-sm text-basalt-sm break-words" aria-live="polite">
								{vm.files.map((file, index) => (
									<li key={`${file.name}-${index}`}>
										{file.name} · {Math.ceil(file.size / 1024)} KB
									</li>
								))}
							</ul>
						</div>
					</LayerCard>
				</SectionRule>

				<SectionRule title="Success State" className="flex flex-col space-y-0 gap-basalt-layout-sm">
					<LayerCard padding="lg" className="flex-1">
						<p className="text-basalt-base font-medium text-basalt-foreground">
							{vm.profile.result || vm.newsletter.result || vm.security.result
								? "Form submitted"
								: "No submissions yet"}
						</p>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Local demo. These actions do not update a real account or service.
						</p>
						<Separator className="my-basalt-card-sm bg-basalt-border" />
						<Button
							variant="secondary"
							size="sm"
							aria-expanded={vm.detailsOpen}
							onClick={() => vm.setDetailsOpen(!vm.detailsOpen)}
						>
							View details
						</Button>
						{vm.detailsOpen && (
							<pre className="mt-basalt-card-sm whitespace-pre-wrap break-words text-basalt-sm">
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
