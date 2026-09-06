import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { Empty } from "@nocoo/basalt/components/empty";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";
import { Text } from "@nocoo/basalt/components/text";
import { toast } from "@nocoo/basalt/components/toast";
import { AlertTriangle, Check, CircleAlert, Inbox, Info, X } from "lucide-react";
import type { ReactNode } from "react";
import { catalogContentFamily } from "../../catalog-content";
import { catalogScenarioId } from "../../catalog-scenario";
import {
	type CatalogApiProp,
	type CatalogDocsDraft,
	provenanceFromLegacy,
} from "../../catalog-source";
import { CODE_EXAMPLES } from "../../examples/code";
import { CODE_BLOCK_EXAMPLES } from "../../examples/code-block";
import { EMPTY_ACTION_EXAMPLES } from "../../examples/empty";
import { API as avatarApi } from "../../generated/catalog-api/avatar";
import { API as badgeApi } from "../../generated/catalog-api/badge";
import { API as bannerApi } from "../../generated/catalog-api/banner";
import { API as clipboardTextApi } from "../../generated/catalog-api/clipboard-text";
import { API as codeApi } from "../../generated/catalog-api/code";
import { API as codeBlockApi } from "../../generated/catalog-api/code-block";
import { API as emptyApi } from "../../generated/catalog-api/empty";
import { API as loaderApi } from "../../generated/catalog-api/loader";
import { API as meterApi } from "../../generated/catalog-api/meter";
import { API as skeletonLineApi } from "../../generated/catalog-api/skeleton-line";
import { API as toastApi } from "../../generated/catalog-api/toast";

const EXTRA_PROVENANCE = provenanceFromLegacy({
	repo: "pew",
	sha: "97a890fabe6e",
	file: "packages/web/src/components",
});

function extraDocs(
	name: string,
	slug: string,
	description: string,
	sample: string,
	props: CatalogApiProp[] = [{ name: "className", type: "string" }],
	usage?: string,
): CatalogDocsDraft {
	const importSlug = slug === "code-block" ? "code" : slug;
	return {
		description,
		usage:
			usage ??
			`import { ${name} } from "@nocoo/basalt/components/${importSlug}";\n\nexport default function Example() {\n\treturn ${sample};\n}`,
		variants: [],
		api: [
			{
				name,
				props: props.map((prop) => ({
					...prop,
					description: prop.description ?? prop.name,
				})),
			},
		],
		provenance: EXTRA_PROVENANCE,
	};
}

function Preview({ children, className }: { children: ReactNode; className?: string }) {
	return <div className={className ?? "flex flex-wrap items-center gap-3"}>{children}</div>;
}

function scenarioModule(code: string, imports: string[]): string {
	const importLines = imports.join("\n");
	return `${importLines}\n\nexport default function Example() {\n\treturn (\n\t\t${code.split("\n").join("\n\t\t")}\n\t);\n}`;
}

function toastScenarioModule(buttonCode: string, extraImports: string[] = []): string {
	const allImports = [
		'import { Button } from "@nocoo/basalt/components/button";',
		'import { toast } from "@nocoo/basalt/components/toast";',
		...extraImports,
	];
	return `${allImports.join("\n")}\n\n// Mount a single global <Toaster /> at the application root.\nexport default function Example() {\n\treturn (\n\t\t${buttonCode.split("\n").join("\n\t\t")}\n\t);\n}`;
}

export default catalogContentFamily({
	badge: {
		docs: {
			...extraDocs(
				"Badge",
				"badge",
				"Compact status labels. Inherits standard span element attributes and forwards children; does not expose a public ref.",
				"<Badge>Stable</Badge>",
			),
			api: badgeApi,
		},
		examples: [
			{
				id: catalogScenarioId("badge", "primary-badges"),
				title: "Primary Badges",
				code: scenarioModule("<Badge>Default</Badge>", [
					'import { Badge } from "@nocoo/basalt/components/badge";',
				]),
				render: () => <Badge>Default</Badge>,
			},
			{
				id: catalogScenarioId("badge", "other-color-variants"),
				title: "Other color variants",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-3">
	<Badge variant="secondary">Secondary</Badge>
	<Badge variant="info">Info</Badge>
	<Badge variant="success">Success</Badge>
	<Badge variant="warning">Warning</Badge>
	<Badge variant="error">Error</Badge>
	<Badge variant="destructive">Destructive</Badge>
	<Badge variant="outline">Outline</Badge>
</div>`,
					['import { Badge } from "@nocoo/basalt/components/badge";'],
				),
				render: () => (
					<Preview>
						<Badge variant="secondary">Secondary</Badge>
						<Badge variant="info">Info</Badge>
						<Badge variant="success">Success</Badge>
						<Badge variant="warning">Warning</Badge>
						<Badge variant="error">Error</Badge>
						<Badge variant="destructive">Destructive</Badge>
						<Badge variant="outline">Outline</Badge>
					</Preview>
				),
			},
			{
				id: catalogScenarioId("badge", "color-tokens"),
				title: "Color tokens",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-3">
	<Badge variant="red">Red</Badge>
	<Badge variant="orange">Orange</Badge>
	<Badge variant="teal">Teal</Badge>
	<Badge variant="blue">Blue</Badge>
	<Badge variant="purple">Purple</Badge>
</div>`,
					['import { Badge } from "@nocoo/basalt/components/badge";'],
				),
				render: () => (
					<Preview>
						<Badge variant="red">Red</Badge>
						<Badge variant="orange">Orange</Badge>
						<Badge variant="teal">Teal</Badge>
						<Badge variant="blue">Blue</Badge>
						<Badge variant="purple">Purple</Badge>
					</Preview>
				),
			},
			{
				id: catalogScenarioId("badge", "dot-badges"),
				title: "Dot badges",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-3">
	<Badge dot>Live</Badge>
	<Badge dot variant="success">
		Healthy
	</Badge>
</div>`,
					['import { Badge } from "@nocoo/basalt/components/badge";'],
				),
				render: () => (
					<Preview>
						<Badge dot>Live</Badge>
						<Badge dot variant="success">
							Healthy
						</Badge>
					</Preview>
				),
			},
			{
				id: catalogScenarioId("badge", "in-a-sentence"),
				title: "In a sentence",
				code: scenarioModule(
					`<Text>
	Status is <Badge>Stable</Badge>
</Text>`,
					[
						'import { Badge } from "@nocoo/basalt/components/badge";',
						'import { Text } from "@nocoo/basalt/components/text";',
					],
				),
				render: () => (
					<Text>
						Status is <Badge>Stable</Badge>
					</Text>
				),
			},
			{
				id: catalogScenarioId("badge", "with-an-icon"),
				title: "With an icon",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-3">
	<Badge>
		<Check className="size-3" /> Verified
	</Badge>
	<Badge variant="success">
		<Check className="size-3" /> Healthy
	</Badge>
	<Badge variant="warning">
		<AlertTriangle className="size-3" /> Warning
	</Badge>
	<Badge variant="error">
		<CircleAlert className="size-3" /> Error
	</Badge>
	<Badge variant="info">
		<Info className="size-3" /> Info
	</Badge>
</div>`,
					[
						'import { Badge } from "@nocoo/basalt/components/badge";',
						'import { AlertTriangle, Check, CircleAlert, Info } from "lucide-react";',
					],
				),
				render: () => (
					<Preview>
						<Badge>
							<Check className="size-3" /> Verified
						</Badge>
						<Badge variant="success">
							<Check className="size-3" /> Healthy
						</Badge>
						<Badge variant="warning">
							<AlertTriangle className="size-3" /> Warning
						</Badge>
						<Badge variant="error">
							<CircleAlert className="size-3" /> Error
						</Badge>
						<Badge variant="info">
							<Info className="size-3" /> Info
						</Badge>
					</Preview>
				),
			},
			{
				id: catalogScenarioId("badge", "linked-badge"),
				title: "Linked badge",
				code: scenarioModule(
					`<Link href="#">
	<Badge>Docs</Badge>
</Link>`,
					[
						'import { Badge } from "@nocoo/basalt/components/badge";',
						'import { Link } from "@nocoo/basalt/components/link";',
					],
				),
				render: () => (
					<Link href="#">
						<Badge>Docs</Badge>
					</Link>
				),
			},
		],
	},
	banner: {
		docs: {
			...extraDocs(
				"Banner",
				"banner",
				"Displays contextual inline messages for informational, alert, or error states. Inherits standard div element attributes without exposing a public ref; structured mode (activated by title or description) ignores standard children. BannerAction is a named export alias of Banner.Action; both are ordinary function components wrapping Button without a forwarded ref, mapping variant and size contextually while inheriting standard ButtonHTMLAttributes (disabled, aria-*, event handlers).",
				'<Banner icon={<Info />} title="Update available" description="A new version is ready to install." />',
				undefined,
				`import { Banner } from "@nocoo/basalt/components/banner";
import { Info } from "lucide-react";

export default function Example() {
	return (
		<Banner
			icon={<Info />}
			title="Update available"
			description="A new version is ready to install."
		/>
	);
}`,
			),
			api: bannerApi,
		},
		examples: [
			{
				id: catalogScenarioId("banner", "variants"),
				title: "Variants",
				code: scenarioModule(
					`<div className="w-full space-y-3">
	<Banner
		icon={<Info />}
		title="Update available"
		description="A new version is ready to install."
	/>
	<Banner
		icon={<AlertTriangle />}
		variant="alert"
		title="Session expiring"
		description="Your session will expire in 5 minutes."
	/>
	<Banner
		icon={<CircleAlert />}
		variant="error"
		title="Save failed"
		description="We couldn't save your changes. Please try again."
	/>
	<Banner
		icon={<Info />}
		variant="secondary"
		title="Maintenance scheduled"
		description="This service will be unavailable for 10 minutes."
	/>
</div>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle, CircleAlert, Info } from "lucide-react";',
					],
				),
				render: () => (
					<div className="w-full space-y-3">
						<Banner
							icon={<Info />}
							title="Update available"
							description="A new version is ready to install."
						/>
						<Banner
							icon={<AlertTriangle />}
							variant="alert"
							title="Session expiring"
							description="Your session will expire in 5 minutes."
						/>
						<Banner
							icon={<CircleAlert />}
							variant="error"
							title="Save failed"
							description="We couldn't save your changes. Please try again."
						/>
						<Banner
							icon={<Info />}
							variant="secondary"
							title="Maintenance scheduled"
							description="This service will be unavailable for 10 minutes."
						/>
					</div>
				),
			},
			{
				id: catalogScenarioId("banner", "with-icon"),
				title: "With icon",
				code: scenarioModule(
					`<Banner
	icon={<AlertTriangle />}
	variant="alert"
	title="Review required"
	description="Please review your billing information before proceeding."
/>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle } from "lucide-react";',
					],
				),
				render: () => (
					<Banner
						icon={<AlertTriangle />}
						variant="alert"
						title="Review required"
						description="Please review your billing information before proceeding."
					/>
				),
			},
			{
				id: catalogScenarioId("banner", "with-action"),
				title: "With action",
				code: scenarioModule(
					`<div className="w-full space-y-3">
	<Banner
		icon={<Info />}
		title="Update available"
		description="A new version is ready to install."
		action={
			<>
				<Banner.Action>Update</Banner.Action>
				<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
			</>
		}
	/>
	<Banner
		variant="error"
		icon={<CircleAlert />}
		title="Save failed"
		description="We couldn't save your changes. Please try again."
		action={
			<>
				<Banner.Action>Retry</Banner.Action>
				<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss error" />
			</>
		}
	/>
</div>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { CircleAlert, Info, X } from "lucide-react";',
					],
				),
				render: () => (
					<div className="w-full space-y-3">
						<Banner
							icon={<Info />}
							title="Update available"
							description="A new version is ready to install."
							action={
								<>
									<Banner.Action>Update</Banner.Action>
									<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
								</>
							}
						/>
						<Banner
							variant="error"
							icon={<CircleAlert />}
							title="Save failed"
							description="We couldn't save your changes. Please try again."
							action={
								<>
									<Banner.Action>Retry</Banner.Action>
									<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss error" />
								</>
							}
						/>
					</div>
				),
			},
			{
				id: catalogScenarioId("banner", "with-multiple-actions"),
				title: "With multiple actions",
				code: scenarioModule(
					`<Banner
	icon={<AlertTriangle />}
	variant="error"
	title="Your account is 90 days past due."
	description="Pay now to avoid interruption."
	action={
		<>
			<Banner.Action>Pay now</Banner.Action>
			<Banner.Action variant="secondary">Go to billing</Banner.Action>
		</>
	}
/>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle } from "lucide-react";',
					],
				),
				render: () => (
					<Banner
						icon={<AlertTriangle />}
						variant="error"
						title="Your account is 90 days past due."
						description="Pay now to avoid interruption."
						action={
							<>
								<Banner.Action>Pay now</Banner.Action>
								<Banner.Action variant="secondary">Go to billing</Banner.Action>
							</>
						}
					/>
				),
			},
			{
				id: catalogScenarioId("banner", "compact-size"),
				title: "Compact size",
				code: scenarioModule(
					`<div className="w-full space-y-3">
	<Banner
		size="sm"
		description="A project named Atlas already exists."
		action={<Link href="#">Open project</Link>}
	/>
	<Banner
		size="sm"
		description="A project named Atlas already exists."
		action={
			<>
				<Banner.Action>Open project</Banner.Action>
				<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
			</>
		}
	/>
	<Banner size="sm" description="A project named Atlas already exists." />
</div>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { Link } from "@nocoo/basalt/components/link";',
						'import { X } from "lucide-react";',
					],
				),
				render: () => (
					<div className="w-full space-y-3">
						<Banner
							size="sm"
							description="A project named Atlas already exists."
							action={<Link href="#">Open project</Link>}
						/>
						<Banner
							size="sm"
							description="A project named Atlas already exists."
							action={
								<>
									<Banner.Action>Open project</Banner.Action>
									<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
								</>
							}
						/>
						<Banner size="sm" description="A project named Atlas already exists." />
					</div>
				),
			},
			{
				id: catalogScenarioId("banner", "custom-content"),
				title: "Custom content",
				code: scenarioModule(
					`<Banner
	icon={<Info />}
	title="Custom content supported"
	description={
		<Text className="text-inherit">
			This banner supports <strong>custom content</strong> with Text.
		</Text>
	}
/>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { Text } from "@nocoo/basalt/components/text";',
						'import { Info } from "lucide-react";',
					],
				),
				render: () => (
					<Banner
						icon={<Info />}
						title="Custom content supported"
						description={
							<Text className="text-inherit">
								This banner supports <strong>custom content</strong> with Text.
							</Text>
						}
					/>
				),
			},
		],
	},
	empty: {
		docs: {
			...extraDocs(
				"Empty",
				"empty",
				"Empty-state copy. Inherits standard div element attributes without exposing a public ref; supports structured icon, title, description, custom children content, and interactive action controls.",
				'<Empty title="No results" description="Try another query." />',
				undefined,
				`import { Empty } from "@nocoo/basalt/components/empty";

export default function Example() {
	return <Empty title="No results" description="Try another query." />;
}`,
			),
			api: emptyApi,
		},
		examples: [
			{
				id: catalogScenarioId("empty", "basic"),
				title: "Basic",
				code: scenarioModule('<Empty title="No results" description="Try another query." />', [
					'import { Empty } from "@nocoo/basalt/components/empty";',
				]),
				render: () => <Empty title="No results" description="Try another query." />,
			},
			{
				id: catalogScenarioId("empty", "with-icon"),
				title: "With icon",
				code: scenarioModule(
					'<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />',
					[
						'import { Empty } from "@nocoo/basalt/components/empty";',
						'import { Inbox } from "lucide-react";',
					],
				),
				render: () => (
					<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />
				),
			},
			...EMPTY_ACTION_EXAMPLES,
		],
	},
	loader: {
		docs: {
			...extraDocs(
				"Loader",
				"loader",
				"Indicates a pending state. Forwards standard SVG attributes with size controlling width and height, defaults role='status' and aria-label='Loading' (overridable via props), and does not expose a public ref.",
				"<Loader />",
			),
			api: loaderApi,
		},
		examples: [
			{
				id: catalogScenarioId("loader", "default-size"),
				title: "Default Size",
				code: scenarioModule("<Loader />", [
					'import { Loader } from "@nocoo/basalt/components/loader";',
				]),
				render: () => <Loader />,
			},
			{
				id: catalogScenarioId("loader", "custom-size"),
				title: "Custom Size",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-3">
	<Loader size={16} />
	<Loader size={24} />
	<Loader size={32} />
</div>`,
					['import { Loader } from "@nocoo/basalt/components/loader";'],
				),
				render: () => (
					<Preview>
						<Loader size={16} />
						<Loader size={24} />
						<Loader size={32} />
					</Preview>
				),
			},
		],
	},
	"skeleton-line": {
		docs: {
			...extraDocs(
				"SkeletonLine",
				"skeleton-line",
				"Placeholder lines while content loads. Forwards standard div element attributes with aria-hidden='true' by default, merges style overrides over computed width geometry, and does not expose a public ref.",
				"<SkeletonLine minWidth={40} maxWidth={55} />",
				undefined,
				`import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";

export default function Example() {
	return <SkeletonLine minWidth={40} maxWidth={55} />;
}`,
			),
			api: skeletonLineApi,
		},
		examples: [
			{
				id: catalogScenarioId("skeleton-line", "default"),
				title: "Default",
				code: scenarioModule(
					`<div className="flex w-64 flex-col gap-3">
	<SkeletonLine minWidth={40} maxWidth={55} />
	<SkeletonLine minWidth={75} maxWidth={90} />
	<SkeletonLine minWidth={90} maxWidth={100} />
</div>`,
					['import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";'],
				),
				render: () => (
					<div className="flex w-64 flex-col gap-3">
						<SkeletonLine minWidth={40} maxWidth={55} />
						<SkeletonLine minWidth={75} maxWidth={90} />
						<SkeletonLine minWidth={90} maxWidth={100} />
					</div>
				),
			},
			{
				id: catalogScenarioId("skeleton-line", "width"),
				title: "Width",
				code: scenarioModule(
					`<div className="flex w-64 flex-col gap-3">
	<SkeletonLine minWidth={80} maxWidth={100} />
	<SkeletonLine minWidth={60} maxWidth={80} />
	<SkeletonLine minWidth={40} maxWidth={60} />
</div>`,
					['import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";'],
				),
				render: () => (
					<div className="flex w-64 flex-col gap-3">
						<SkeletonLine minWidth={80} maxWidth={100} />
						<SkeletonLine minWidth={60} maxWidth={80} />
						<SkeletonLine minWidth={40} maxWidth={60} />
					</div>
				),
			},
			{
				id: catalogScenarioId("skeleton-line", "height"),
				title: "Height",
				code: scenarioModule(
					`<div className="flex w-64 flex-col gap-3">
	<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
	<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
	<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
	<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />
</div>`,
					['import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";'],
				),
				render: () => (
					<div className="flex w-64 flex-col gap-3">
						<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
						<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
						<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
						<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />
					</div>
				),
			},
		],
	},
	meter: {
		docs: {
			...extraDocs(
				"Meter",
				"meter",
				"Numeric meter. Renders a percentage progress bar clamped to 0..100% without exposing public ref, arbitrary HTML attributes, or change events.",
				'<Meter value={60} label="Usage" />',
				undefined,
				`import { Meter } from "@nocoo/basalt/components/meter";

export default function Example() {
	return <Meter value={60} label="Usage" />;
}`,
			),
			api: meterApi,
		},
		examples: [
			{
				id: catalogScenarioId("meter", "basic-meter"),
				title: "Basic Meter",
				code: scenarioModule('<Meter value={40} label="Usage" />', [
					'import { Meter } from "@nocoo/basalt/components/meter";',
				]),
				render: () => <Meter value={40} label="Usage" />,
			},
			{
				id: catalogScenarioId("meter", "custom-value-display"),
				title: "Custom Value Display",
				code: scenarioModule('<Meter value={12} label="Storage" customValue="12 GB" />', [
					'import { Meter } from "@nocoo/basalt/components/meter";',
				]),
				render: () => <Meter value={12} label="Storage" customValue="12 GB" />,
			},
			{
				id: catalogScenarioId("meter", "hidden-value"),
				title: "Hidden Value",
				code: scenarioModule('<Meter value={72} label="Progress" hideValue />', [
					'import { Meter } from "@nocoo/basalt/components/meter";',
				]),
				render: () => <Meter value={72} label="Progress" hideValue />,
			},
			{
				id: catalogScenarioId("meter", "full-meter"),
				title: "Full Meter",
				code: scenarioModule('<Meter value={100} label="Complete" />', [
					'import { Meter } from "@nocoo/basalt/components/meter";',
				]),
				render: () => <Meter value={100} label="Complete" />,
			},
			{
				id: catalogScenarioId("meter", "low-value"),
				title: "Low Value",
				code: scenarioModule('<Meter value={8} label="Quota" />', [
					'import { Meter } from "@nocoo/basalt/components/meter";',
				]),
				render: () => <Meter value={8} label="Quota" />,
			},
		],
	},
	toast: {
		docs: {
			...extraDocs(
				"Toast",
				"toast",
				"Transient notification stack. Toast is an alias for Toaster, which mounts the Sonner notification viewport on a section element forwarding refs. Mount a single global Toaster at the application root without an id so standard toast notifications display properly; catalog previews already have a global Toaster mounted so previews do not remount it. Dispatches are handled via the toast(message, options) imperative API, where message is a ReactNode. When icon: false is specified, status and default toast icons are suppressed.",
				"<Button onClick={() => toast('Saved')}>Toast</Button>",
				undefined,
				`import { Button } from "@nocoo/basalt/components/button";
import { Toaster, toast } from "@nocoo/basalt/components/toast";

export function App() {
	return (
		<>
			<Toaster />
			<Button onClick={() => toast("Saved")}>Toast</Button>
		</>
	);
}`,
			),
			api: toastApi,
		},
		examples: [
			{
				id: catalogScenarioId("toast", "title-only"),
				title: "Title Only",
				code: toastScenarioModule('<Button onClick={() => toast("Saved")}>Title only</Button>'),
				render: () => <Button onClick={() => toast("Saved")}>Title only</Button>,
			},
			{
				id: catalogScenarioId("toast", "title-and-description"),
				title: "Title and Description",
				code: toastScenarioModule(
					'<Button onClick={() => toast("Saved", { description: "Project updated." })}>\n\tWith description\n</Button>',
				),
				render: () => (
					<Button onClick={() => toast("Saved", { description: "Project updated." })}>
						With description
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "success-variant"),
				title: "Success Variant",
				code: toastScenarioModule(
					'<Button onClick={() => toast.success("Deployed")}>Success</Button>',
				),
				render: () => <Button onClick={() => toast.success("Deployed")}>Success</Button>,
			},
			{
				id: catalogScenarioId("toast", "error-variant"),
				title: "Error Variant",
				code: toastScenarioModule('<Button onClick={() => toast.error("Failed")}>Error</Button>'),
				render: () => <Button onClick={() => toast.error("Failed")}>Error</Button>,
			},
			{
				id: catalogScenarioId("toast", "warning-variant"),
				title: "Warning Variant",
				code: toastScenarioModule(
					'<Button onClick={() => toast.warning("Expiring")}>Warning</Button>',
				),
				render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
			},
			{
				id: catalogScenarioId("toast", "info-variant"),
				title: "Info Variant",
				code: toastScenarioModule('<Button onClick={() => toast.info("Queued")}>Info</Button>'),
				render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
			},
			{
				id: catalogScenarioId("toast", "close-button"),
				title: "Close button",
				code: toastScenarioModule(
					'<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>\n\tWith close\n</Button>',
				),
				render: () => (
					<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>
						With close
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "hidden-close"),
				title: "Hidden close",
				code: toastScenarioModule(
					'<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>\n\tNo close\n</Button>',
				),
				render: () => (
					<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>
						No close
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "custom-icon"),
				title: "Custom icon",
				code: toastScenarioModule(
					`<Button
	onClick={() =>
		toast.success("Verified", {
			icon: <Check className="size-4" />,
			description: "Custom icon passed as a parameter.",
		})
	}
>
	Custom icon
</Button>`,
					['import { Check } from "lucide-react";'],
				),
				render: () => (
					<Button
						onClick={() =>
							toast.success("Verified", {
								icon: <Check className="size-4" />,
								description: "Custom icon passed as a parameter.",
							})
						}
					>
						Custom icon
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "hidden-icon"),
				title: "Hidden icon",
				code: toastScenarioModule(
					'<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>',
				),
				render: () => (
					<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>
				),
			},
		],
	},
	"clipboard-text": {
		docs: {
			...extraDocs(
				"ClipboardText",
				"clipboard-text",
				"Copyable text. Inline code snippet paired with an icon copy button; does not forward native HTML attributes or expose a public ref.",
				'<ClipboardText text="bun add @nocoo/basalt" />',
				undefined,
				`import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";

export default function Example() {
	return <ClipboardText text="bun add @nocoo/basalt" />;
}`,
			),
			api: clipboardTextApi,
		},
		examples: [
			{
				id: catalogScenarioId("clipboard-text", "short-text"),
				title: "Short Text",
				code: scenarioModule('<ClipboardText text="bun add @nocoo/basalt" />', [
					'import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";',
				]),
				render: () => <ClipboardText text="bun add @nocoo/basalt" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "api-key"),
				title: "API Key",
				code: scenarioModule('<ClipboardText text="project-••••" copyText="project-atlas" />', [
					'import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";',
				]),
				render: () => <ClipboardText text="project-••••" copyText="project-atlas" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "copy-alternate-text"),
				title: "Copy Alternate Text",
				code: scenarioModule('<ClipboardText text="Visible label" copyText="copied-value" />', [
					'import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";',
				]),
				render: () => <ClipboardText text="Visible label" copyText="copied-value" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "long-text"),
				title: "Long Text",
				code: scenarioModule(
					'<ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />',
					['import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";'],
				),
				render: () => <ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />,
			},
		],
	},
	code: {
		docs: {
			...extraDocs(
				"Code",
				"code",
				"Syntax-highlighted code.",
				'<CodeHighlighted code={\'export async function fetchUser(id: string, retries = 3) { const response = await fetch("/api/users/" + id); if (!response.ok) { throw new Error("User not found"); } return response.json(); }\'} />',
				undefined,
				`import { CodeHighlighted } from "@nocoo/basalt/components/code";

export default function Example() {
	return (
		<CodeHighlighted code={'export async function fetchUser(id: string, retries = 3) { const response = await fetch("/api/users/" + id); if (!response.ok) { throw new Error("User not found"); } return response.json(); }'} />
	);
}`,
			),
			api: codeApi,
		},
		examples: CODE_EXAMPLES,
	},
	"code-block": {
		docs: {
			...extraDocs(
				"CodeBlock",
				"code-block",
				"A fenced code block.",
				"<CodeBlock>const n = 1;</CodeBlock>",
			),
			api: codeBlockApi,
		},
		examples: CODE_BLOCK_EXAMPLES,
	},
	avatar: {
		docs: {
			...extraDocs(
				"Avatar",
				"avatar",
				"User avatar. Composes Avatar, AvatarImage, and AvatarFallback with full ref forwarding and native HTML span/img inheritance.",
				"<Avatar />",
			),
			api: avatarApi,
		},
		examples: [
			{
				id: catalogScenarioId("avatar", "fallback"),
				title: "Fallback",
				code: scenarioModule(
					`<Avatar>
	<AvatarFallback>ZL</AvatarFallback>
</Avatar>`,
					['import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";'],
				),
				render: () => (
					<Avatar>
						<AvatarFallback>ZL</AvatarFallback>
					</Avatar>
				),
			},
		],
	},
});
