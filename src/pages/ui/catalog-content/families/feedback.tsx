import { Avatar, AvatarFallback, AvatarInitials } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { Empty } from "@nocoo/basalt/components/empty";
import { Link } from "@nocoo/basalt/components/link";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import { Progress } from "@nocoo/basalt/components/progress";
import { Skeleton } from "@nocoo/basalt/components/skeleton";
import { Spinner } from "@nocoo/basalt/components/spinner";
import { Text } from "@nocoo/basalt/components/text";
import { toast } from "@nocoo/basalt/components/toast";
import {
	AlertTriangle,
	Check,
	CircleAlert,
	CircleCheck,
	Inbox,
	Info,
	X,
} from "@nocoo/basalt/icons";
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
import LoaderOptions from "../../examples/loader/options";
import loaderOptionsSource from "../../examples/loader/options?raw";
import { SKELETON_COMPOSITION_EXAMPLES } from "../../examples/skeleton";
import { API as avatarApi } from "../../generated/catalog-api/avatar";
import { API as badgeApi } from "../../generated/catalog-api/badge";
import { API as bannerApi } from "../../generated/catalog-api/banner";
import { API as clipboardTextApi } from "../../generated/catalog-api/clipboard-text";
import { API as codeApi } from "../../generated/catalog-api/code";
import { API as codeBlockApi } from "../../generated/catalog-api/code-block";
import { API as emptyApi } from "../../generated/catalog-api/empty";
import { API as loaderApi } from "../../generated/catalog-api/loader";
import { API as meterApi } from "../../generated/catalog-api/meter";
import { API as progressApi } from "../../generated/catalog-api/progress";
import { API as skeletonApi } from "../../generated/catalog-api/skeleton";
import { API as spinnerApi } from "../../generated/catalog-api/spinner";
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
	return (
		<div className={className ?? "flex flex-wrap items-center gap-basalt-space-lg"}>{children}</div>
	);
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
				"Compact status labels. Inherits standard span element attributes and forwards refs and children.",
				"<Badge>Stable</Badge>",
			),
			api: badgeApi,
		},
		examples: [
			{
				id: catalogScenarioId("badge", "tone-matrix"),
				title: "Tone and variant matrix",
				code: scenarioModule(
					`<div className="grid grid-cols-[5rem_repeat(3,auto)] items-center justify-items-start gap-basalt-space-lg">
	<span className="text-basalt-md text-basalt-muted-foreground">Neutral</span>
	<Badge tone="neutral" variant="soft">
		Soft
	</Badge>
	<Badge tone="neutral" variant="solid">
		Solid
	</Badge>
	<Badge tone="neutral" variant="outline">
		Outline
	</Badge>
	<span className="text-basalt-md text-basalt-muted-foreground">Info</span>
	<Badge tone="info" variant="soft">
		Soft
	</Badge>
	<Badge tone="info" variant="solid">
		Solid
	</Badge>
	<Badge tone="info" variant="outline">
		Outline
	</Badge>
	<span className="text-basalt-md text-basalt-muted-foreground">Success</span>
	<Badge tone="success" variant="soft">
		Soft
	</Badge>
	<Badge tone="success" variant="solid">
		Solid
	</Badge>
	<Badge tone="success" variant="outline">
		Outline
	</Badge>
	<span className="text-basalt-md text-basalt-muted-foreground">Warning</span>
	<Badge tone="warning" variant="soft">
		Soft
	</Badge>
	<Badge tone="warning" variant="solid">
		Solid
	</Badge>
	<Badge tone="warning" variant="outline">
		Outline
	</Badge>
	<span className="text-basalt-md text-basalt-muted-foreground">Danger</span>
	<Badge tone="danger" variant="soft">
		Soft
	</Badge>
	<Badge tone="danger" variant="solid">
		Solid
	</Badge>
	<Badge tone="danger" variant="outline">
		Outline
	</Badge>
</div>`,
					['import { Badge } from "@nocoo/basalt/components/badge";'],
				),
				render: () => (
					<div className="grid grid-cols-[5rem_repeat(3,auto)] items-center justify-items-start gap-basalt-space-lg">
						<span className="text-basalt-md text-basalt-muted-foreground">Neutral</span>
						<Badge tone="neutral" variant="soft">
							Soft
						</Badge>
						<Badge tone="neutral" variant="solid">
							Solid
						</Badge>
						<Badge tone="neutral" variant="outline">
							Outline
						</Badge>
						<span className="text-basalt-md text-basalt-muted-foreground">Info</span>
						<Badge tone="info" variant="soft">
							Soft
						</Badge>
						<Badge tone="info" variant="solid">
							Solid
						</Badge>
						<Badge tone="info" variant="outline">
							Outline
						</Badge>
						<span className="text-basalt-md text-basalt-muted-foreground">Success</span>
						<Badge tone="success" variant="soft">
							Soft
						</Badge>
						<Badge tone="success" variant="solid">
							Solid
						</Badge>
						<Badge tone="success" variant="outline">
							Outline
						</Badge>
						<span className="text-basalt-md text-basalt-muted-foreground">Warning</span>
						<Badge tone="warning" variant="soft">
							Soft
						</Badge>
						<Badge tone="warning" variant="solid">
							Solid
						</Badge>
						<Badge tone="warning" variant="outline">
							Outline
						</Badge>
						<span className="text-basalt-md text-basalt-muted-foreground">Danger</span>
						<Badge tone="danger" variant="soft">
							Soft
						</Badge>
						<Badge tone="danger" variant="solid">
							Solid
						</Badge>
						<Badge tone="danger" variant="outline">
							Outline
						</Badge>
					</div>
				),
			},
			{
				id: catalogScenarioId("badge", "dot-badges"),
				title: "Dot badges",
				code: scenarioModule(
					`<div className="flex flex-wrap items-center gap-basalt-space-lg">
	<Badge dot>Live</Badge>
	<Badge dot tone="success">
		Healthy
	</Badge>
</div>`,
					['import { Badge } from "@nocoo/basalt/components/badge";'],
				),
				render: () => (
					<Preview>
						<Badge dot>Live</Badge>
						<Badge dot tone="success">
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
					`<div className="flex flex-wrap items-center gap-basalt-space-lg">
	<Badge>
		<Check className="size-basalt-icon-sm" /> Verified
	</Badge>
	<Badge tone="success">
		<Check className="size-basalt-icon-sm" /> Healthy
	</Badge>
	<Badge tone="warning">
		<AlertTriangle className="size-basalt-icon-sm" /> Warning
	</Badge>
	<Badge tone="danger">
		<CircleAlert className="size-basalt-icon-sm" /> Danger
	</Badge>
	<Badge tone="info">
		<Info className="size-basalt-icon-sm" /> Info
	</Badge>
</div>`,
					[
						'import { Badge } from "@nocoo/basalt/components/badge";',
						'import { AlertTriangle, Check, CircleAlert, Info } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<Preview>
						<Badge>
							<Check className="size-basalt-icon-sm" /> Verified
						</Badge>
						<Badge tone="success">
							<Check className="size-basalt-icon-sm" /> Healthy
						</Badge>
						<Badge tone="warning">
							<AlertTriangle className="size-basalt-icon-sm" /> Warning
						</Badge>
						<Badge tone="danger">
							<CircleAlert className="size-basalt-icon-sm" /> Danger
						</Badge>
						<Badge tone="info">
							<Info className="size-basalt-icon-sm" /> Info
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
				"Displays contextual inline messages for neutral, informational, success, warning, or danger states. Inherits standard div element attributes without exposing a public ref; structured mode (activated by title or description) ignores standard children. BannerAction is a named export alias of Banner.Action; both are ordinary function components wrapping Button without a forwarded ref, mapping tone and size contextually while inheriting standard ButtonHTMLAttributes (disabled, aria-*, event handlers).",
				'<Banner tone="info" icon={<Info />} title="Update available" description="A new version is ready to install." />',
				undefined,
				`import { Banner } from "@nocoo/basalt/components/banner";
import { Info } from "@nocoo/basalt/icons";

export default function Example() {
	return (
		<Banner
			tone="info"
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
				id: catalogScenarioId("banner", "tones"),
				title: "Tones",
				code: scenarioModule(
					`<div className="w-full space-y-basalt-space-lg">
	<Banner
		icon={<Info />}
		title="Maintenance scheduled"
		description="This service will be unavailable for 10 minutes."
	/>
	<Banner
		tone="info"
		icon={<Info />}
		title="Update available"
		description="A new version is ready to install."
	/>
	<Banner
		tone="success"
		icon={<CircleCheck />}
		title="Verification complete"
		description="Your care credentials have been verified."
	/>
	<Banner
		tone="warning"
		icon={<AlertTriangle />}
		title="Session expiring"
		description="Your session will expire in 5 minutes."
	/>
	<Banner
		tone="danger"
		icon={<CircleAlert />}
		title="Save failed"
		description="We couldn't save your changes. Please try again."
	/>
</div>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle, CircleAlert, CircleCheck, Info } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<div className="w-full space-y-basalt-space-lg">
						<Banner
							icon={<Info />}
							title="Maintenance scheduled"
							description="This service will be unavailable for 10 minutes."
						/>
						<Banner
							tone="info"
							icon={<Info />}
							title="Update available"
							description="A new version is ready to install."
						/>
						<Banner
							tone="success"
							icon={<CircleCheck />}
							title="Verification complete"
							description="Your care credentials have been verified."
						/>
						<Banner
							tone="warning"
							icon={<AlertTriangle />}
							title="Session expiring"
							description="Your session will expire in 5 minutes."
						/>
						<Banner
							tone="danger"
							icon={<CircleAlert />}
							title="Save failed"
							description="We couldn't save your changes. Please try again."
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
	tone="warning"
	title="Review required"
	description="Please review your care coordination details before proceeding."
/>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<Banner
						icon={<AlertTriangle />}
						tone="warning"
						title="Review required"
						description="Please review your care coordination details before proceeding."
					/>
				),
			},
			{
				id: catalogScenarioId("banner", "with-action"),
				title: "With action",
				code: scenarioModule(
					`<div className="w-full space-y-basalt-space-lg">
	<Banner
		tone="info"
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
		tone="danger"
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
						'import { CircleAlert, Info, X } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<div className="w-full space-y-basalt-space-lg">
						<Banner
							tone="info"
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
							tone="danger"
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
	tone="danger"
	title="Your account is 90 days past due."
	description="Pay now to avoid interruption."
	action={
		<>
			<Banner.Action>Pay now</Banner.Action>
			<Banner.Action variant="secondary">Open care coordination</Banner.Action>
		</>
	}
/>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { AlertTriangle } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<Banner
						icon={<AlertTriangle />}
						tone="danger"
						title="Your account is 90 days past due."
						description="Pay now to avoid interruption."
						action={
							<>
								<Banner.Action>Pay now</Banner.Action>
								<Banner.Action variant="secondary">Open care coordination</Banner.Action>
							</>
						}
					/>
				),
			},
			{
				id: catalogScenarioId("banner", "compact-size"),
				title: "Compact size",
				code: scenarioModule(
					`<div className="w-full space-y-basalt-space-lg">
	<Banner
		tone="info"
		size="sm"
		description="A patient record named Atlas already exists."
		action={<Link href="#">Open patient record</Link>}
	/>
	<Banner
		tone="info"
		size="sm"
		description="A patient record named Atlas already exists."
		action={
			<>
				<Banner.Action>Open patient record</Banner.Action>
				<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
			</>
		}
	/>
	<Banner tone="info" size="sm" description="A patient record named Atlas already exists." />
</div>`,
					[
						'import { Banner } from "@nocoo/basalt/components/banner";',
						'import { Link } from "@nocoo/basalt/components/link";',
						'import { X } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<div className="w-full space-y-basalt-space-lg">
						<Banner
							tone="info"
							size="sm"
							description="A patient record named Atlas already exists."
							action={<Link href="#">Open patient record</Link>}
						/>
						<Banner
							tone="info"
							size="sm"
							description="A patient record named Atlas already exists."
							action={
								<>
									<Banner.Action>Open patient record</Banner.Action>
									<Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss compact" />
								</>
							}
						/>
						<Banner
							tone="info"
							size="sm"
							description="A patient record named Atlas already exists."
						/>
					</div>
				),
			},
			{
				id: catalogScenarioId("banner", "custom-content"),
				title: "Custom content",
				code: scenarioModule(
					`<Banner
	tone="info"
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
						'import { Info } from "@nocoo/basalt/icons";',
					],
				),
				render: () => (
					<Banner
						tone="info"
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
				"Empty-state copy. Inherits standard div element attributes and forwards refs; supports structured icon, title, description, custom children content, and interactive action controls.",
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
						'import { Inbox } from "@nocoo/basalt/icons";',
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
				"Eight-cell perimeter loader with optional shimmering label and elapsed time, shown after 5000ms by default. Forwards span attributes and respects reduced motion.",
				"<Loader />",
			),
			api: loaderApi,
		},
		examples: [
			{
				id: catalogScenarioId("loader", "options"),
				title: "Orbit, shimmer and timer",
				code: loaderOptionsSource,
				render: () => <LoaderOptions />,
			},
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
					`<div className="flex flex-wrap items-center gap-basalt-space-lg">
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
	skeleton: {
		docs: {
			...extraDocs(
				"Skeleton",
				"skeleton",
				"Placeholder shimmer shapes across line, block, and circle variants while content loads. Forwards div attributes and ref with aria-hidden='true' by default.",
				'<Skeleton width="60%" />',
				undefined,
				`import { Skeleton } from "@nocoo/basalt/components/skeleton";

export default function Example() {
	return <Skeleton width="60%" />;
}`,
			),
			variants: ["line", "block", "circle"],
			api: skeletonApi,
		},
		examples: [
			...SKELETON_COMPOSITION_EXAMPLES,
			{
				id: catalogScenarioId("skeleton", "default"),
				title: "Default",
				code: scenarioModule(
					`<div className="flex w-64 flex-col gap-basalt-space-lg">
	<Skeleton width="45%" />
	<Skeleton width="80%" />
	<Skeleton width="95%" />
</div>`,
					['import { Skeleton } from "@nocoo/basalt/components/skeleton";'],
				),
				render: () => (
					<div className="flex w-64 flex-col gap-basalt-space-lg">
						<Skeleton width="45%" />
						<Skeleton width="80%" />
						<Skeleton width="95%" />
					</div>
				),
			},
			{
				id: catalogScenarioId("skeleton", "variants"),
				title: "Variants",
				code: scenarioModule(
					`<div className="flex w-64 items-center gap-basalt-space-lg">
	<Skeleton variant="circle" width={40} height={40} />
	<div className="min-w-0 flex-1 space-y-basalt-space-lg">
		<Skeleton variant="line" width="60%" />
		<Skeleton variant="block" height={48} />
	</div>
</div>`,
					['import { Skeleton } from "@nocoo/basalt/components/skeleton";'],
				),
				render: () => (
					<div className="flex w-64 items-center gap-basalt-space-lg">
						<Skeleton variant="circle" width={40} height={40} />
						<div className="min-w-0 flex-1 space-y-basalt-space-lg">
							<Skeleton variant="line" width="60%" />
							<Skeleton variant="block" height={48} />
						</div>
					</div>
				),
			},
			{
				id: catalogScenarioId("skeleton", "height"),
				title: "Height",
				code: scenarioModule(
					`<div className="flex w-64 flex-col gap-basalt-space-lg">
	<Skeleton height={8} width="95%" />
	<Skeleton height={16} width="95%" />
	<Skeleton height={24} width="95%" />
	<Skeleton height={32} width="95%" />
</div>`,
					['import { Skeleton } from "@nocoo/basalt/components/skeleton";'],
				),
				render: () => (
					<div className="flex w-64 flex-col gap-basalt-space-lg">
						<Skeleton height={8} width="95%" />
						<Skeleton height={16} width="95%" />
						<Skeleton height={24} width="95%" />
						<Skeleton height={32} width="95%" />
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
				"Matte capacity and utilization meter with continuous capsule and twenty-cell precision segmented variants, semantic tones, and tabular readings. Clamps to 0..100%; non-finite readings display as Unavailable.",
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
				code: scenarioModule(
					'<div className="w-full max-w-sm">\n\t<Meter value={64} label="Usage" />\n</div>',
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm">
						<Meter value={64} label="Usage" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "semantic-tones"),
				title: "Semantic Tones",
				code: scenarioModule(
					`<div className="w-full max-w-sm space-y-basalt-card-sm">
	<Meter value={48} label="API requests" customValue="48k / 100k" tone="default" />
	<Meter value={100} label="Health checks" tone="success" />
	<Meter value={78} label="Memory pressure" tone="warning" />
	<Meter value={94} label="Storage limit" customValue="94.2 / 100 GB" tone="danger" />
</div>`,
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm space-y-basalt-card-sm">
						<Meter value={48} label="API requests" customValue="48k / 100k" tone="default" />
						<Meter value={100} label="Health checks" tone="success" />
						<Meter value={78} label="Memory pressure" tone="warning" />
						<Meter value={94} label="Storage limit" customValue="94.2 / 100 GB" tone="danger" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "segmented"),
				title: "Segmented Variant",
				code: scenarioModule(
					`<div className="w-full max-w-sm space-y-basalt-card-sm">
	<Meter value={65} label="Cluster capacity" variant="segmented" />
	<Meter value={85} label="Auto threshold" variant="segmented" tone="auto" />
</div>`,
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm space-y-basalt-card-sm">
						<Meter value={65} label="Cluster capacity" variant="segmented" />
						<Meter value={85} label="Auto threshold" variant="segmented" tone="auto" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "sizes"),
				title: "Sizes",
				code: scenarioModule(
					`<div className="w-full max-w-sm space-y-basalt-card-sm">
	<Meter value={56} label="Small" size="sm" />
	<Meter value={56} label="Medium" size="md" />
	<Meter value={56} label="Large" size="lg" />
</div>`,
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm space-y-basalt-card-sm">
						<Meter value={56} label="Small" size="sm" />
						<Meter value={56} label="Medium" size="md" />
						<Meter value={56} label="Large" size="lg" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "custom-value-display"),
				title: "Custom Value Display",
				code: scenarioModule(
					'<div className="w-full max-w-sm">\n\t<Meter value={62} label="Storage" customValue="62.4 / 100 GB" />\n</div>',
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm">
						<Meter value={62} label="Storage" customValue="62.4 / 100 GB" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "hidden-value"),
				title: "Hidden Value",
				code: scenarioModule(
					'<div className="w-full max-w-sm">\n\t<Meter value={72} label="Progress" hideValue />\n</div>',
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm">
						<Meter value={72} label="Progress" hideValue />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "full-meter"),
				title: "Full Meter",
				code: scenarioModule(
					'<div className="w-full max-w-sm">\n\t<Meter value={100} label="Complete" tone="success" />\n</div>',
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm">
						<Meter value={100} label="Complete" tone="success" />
					</div>
				),
			},
			{
				id: catalogScenarioId("meter", "low-value"),
				title: "Low Value",
				code: scenarioModule(
					'<div className="w-full max-w-sm">\n\t<Meter value={8} label="Quota" />\n</div>',
					['import { Meter } from "@nocoo/basalt/components/meter";'],
				),
				render: () => (
					<div className="w-full max-w-sm">
						<Meter value={8} label="Quota" />
					</div>
				),
			},
		],
	},
	toast: {
		docs: {
			...extraDocs(
				"Toast",
				"toast",
				"Transient notification stack. Mounts the Sonner notification viewport on a section element forwarding refs. Mount a single global Toaster at the application root without an id so standard toast notifications display properly; catalog previews already have a global Toaster mounted so previews do not remount it. Dispatches are handled via the toast(message, options) imperative API, where message is a ReactNode. When icon: false is specified, status and default toast icons are suppressed.",
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
					'<Button onClick={() => toast("Saved", { description: "Care plan updated." })}>\n\tWith description\n</Button>',
				),
				render: () => (
					<Button onClick={() => toast("Saved", { description: "Care plan updated." })}>
						With description
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "success-tone"),
				title: "Success tone",
				code: toastScenarioModule(
					'<Button onClick={() => toast.success("Care plan updated")}>Success</Button>',
				),
				render: () => <Button onClick={() => toast.success("Care plan updated")}>Success</Button>,
			},
			{
				id: catalogScenarioId("toast", "danger-tone"),
				title: "Danger tone",
				code: toastScenarioModule('<Button onClick={() => toast.danger("Failed")}>Danger</Button>'),
				render: () => <Button onClick={() => toast.danger("Failed")}>Danger</Button>,
			},
			{
				id: catalogScenarioId("toast", "warning-tone"),
				title: "Warning tone",
				code: toastScenarioModule(
					'<Button onClick={() => toast.warning("Expiring")}>Warning</Button>',
				),
				render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
			},
			{
				id: catalogScenarioId("toast", "info-tone"),
				title: "Info tone",
				code: toastScenarioModule('<Button onClick={() => toast.info("Queued")}>Info</Button>'),
				render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
			},
			{
				id: catalogScenarioId("toast", "loading"),
				title: "Loading",
				code: toastScenarioModule(
					'<Button onClick={() => toast.loading("Syncing records")}>Loading</Button>',
				),
				render: () => <Button onClick={() => toast.loading("Syncing records")}>Loading</Button>,
			},
			{
				id: catalogScenarioId("toast", "promise"),
				title: "Promise",
				code: toastScenarioModule(
					`<Button
	onClick={() =>
		toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
			loading: "Saving care plan",
			success: "Care plan saved",
			error: "Save failed",
		})
	}
>
	Run promise
</Button>`,
				),
				render: () => (
					<Button
						onClick={() =>
							toast.promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
								loading: "Saving care plan",
								success: "Care plan saved",
								error: "Save failed",
							})
						}
					>
						Run promise
					</Button>
				),
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
			icon: <Check className="size-basalt-icon-lg" />,
			description: "Custom icon passed as a parameter.",
		})
	}
>
	Custom icon
</Button>`,
					['import { Check } from "@nocoo/basalt/icons";'],
				),
				render: () => (
					<Button
						onClick={() =>
							toast.success("Verified", {
								icon: <Check className="size-basalt-icon-lg" />,
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
					'<Button onClick={() => toast.success("Care plan updated", { icon: false })}>No icon</Button>',
				),
				render: () => (
					<Button onClick={() => toast.success("Care plan updated", { icon: false })}>
						No icon
					</Button>
				),
			},
		],
	},
	"clipboard-text": {
		docs: {
			...extraDocs(
				"ClipboardText",
				"clipboard-text",
				"Copyable text. Inline code snippet paired with an icon copy button and forwarded ref.",
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
				code: scenarioModule('<ClipboardText text="care plan-••••" copyText="care plan-atlas" />', [
					'import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";',
				]),
				render: () => <ClipboardText text="care plan-••••" copyText="care plan-atlas" />,
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
				"Syntax-highlighted source with a file header, icon, copy feedback and optional line numbers.",
				'<CodeHighlighted code={\'export async function fetchUser(id: string, retries = 3) { const response = await fetch("/api/patients/" + id); if (!response.ok) { throw new Error("Patient not found"); } return response.json(); }\'} />',
				undefined,
				`import { CodeHighlighted } from "@nocoo/basalt/components/code";

export default function Example() {
	return (
		<CodeHighlighted code={'export async function fetchUser(id: string, retries = 3) { const response = await fetch("/api/patients/" + id); if (!response.ok) { throw new Error("Patient not found"); } return response.json(); }'} />
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
				"A compact code panel with optional title, icon, exact-source copy and line numbers.",
				'<CodeBlock title="example.ts" lineNumbers>{"const n = 1;"}</CodeBlock>',
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
				id: catalogScenarioId("avatar", "colored-initials"),
				title: "Colored two-letter initials",
				code: scenarioModule(
					'<div className="flex items-center gap-basalt-space-lg"><AvatarInitials name="Alpine Churn" colorKey="alpine" size="sm" /><AvatarInitials name="Amber Scoop" colorKey="amber" size="sm" /><AvatarInitials name="Aurora Scoops" colorKey="aurora" /><AvatarInitials name="Zheng Li" initials="ZL" /></div>',
					['import { AvatarInitials } from "@nocoo/basalt/components/avatar";'],
				),
				render: () => (
					<div className="flex items-center gap-basalt-space-lg">
						<AvatarInitials name="Alpine Churn" colorKey="alpine" size="sm" />
						<AvatarInitials name="Amber Scoop" colorKey="amber" size="sm" />
						<AvatarInitials name="Aurora Scoops" colorKey="aurora" />
						<AvatarInitials name="Zheng Li" initials="ZL" />
					</div>
				),
			},
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
	spinner: {
		docs: {
			description: "Matte rotating ring indicator for inline and localized busy states.",
			usage: scenarioModule("<Spinner />", [
				'import { Spinner } from "@nocoo/basalt/components/spinner";',
			]),
			variants: ["sm", "md", "lg"],
			api: spinnerApi,
		},
		examples: [
			{
				id: catalogScenarioId("spinner", "sizes"),
				title: "Sizes",
				code: scenarioModule(
					`<div className="flex items-center gap-basalt-layout">
	<Spinner size="sm" label="Small spinner" />
	<Spinner size="md" label="Medium spinner" />
	<Spinner size="lg" label="Large spinner" />
</div>`,
					['import { Spinner } from "@nocoo/basalt/components/spinner";'],
				),
				render: () => (
					<div className="flex items-center gap-basalt-layout">
						<Spinner size="sm" label="Small spinner" />
						<Spinner size="md" label="Medium spinner" />
						<Spinner size="lg" label="Large spinner" />
					</div>
				),
			},
			{
				id: catalogScenarioId("spinner", "with-label"),
				title: "Inline busy status",
				code: scenarioModule(
					`<div className="inline-flex items-center gap-basalt-space-md text-basalt-sm text-basalt-muted-foreground">
	<Spinner size="sm" aria-hidden="true" />
	<span>Syncing deployment state…</span>
</div>`,
					['import { Spinner } from "@nocoo/basalt/components/spinner";'],
				),
				render: () => (
					<div className="inline-flex items-center gap-basalt-space-md text-basalt-sm text-basalt-muted-foreground">
						<Spinner size="sm" aria-hidden="true" />
						<span>Syncing deployment state…</span>
					</div>
				),
			},
		],
	},
	progress: {
		docs: {
			description:
				"Matte horizontal task progress bar supporting determinate completion and indeterminate motion.",
			usage: scenarioModule('<Progress value={64} aria-label="Upload progress" />', [
				'import { Progress } from "@nocoo/basalt/components/progress";',
			]),
			variants: ["default", "success", "warning", "danger"],
			api: progressApi,
		},
		examples: [
			{
				id: catalogScenarioId("progress", "tones"),
				title: "Semantic tones",
				code: scenarioModule(
					`<div className="flex w-full max-w-md flex-col gap-basalt-layout">
	<Progress value={68} aria-label="Default task progress" />
	<Progress value={100} tone="success" aria-label="Completed task progress" />
	<Progress value={78} tone="warning" aria-label="Warning task progress" />
	<Progress value={92} tone="danger" aria-label="Critical task progress" />
</div>`,
					['import { Progress } from "@nocoo/basalt/components/progress";'],
				),
				render: () => (
					<div className="flex w-full max-w-md flex-col gap-basalt-layout">
						<Progress value={68} aria-label="Default task progress" />
						<Progress value={100} tone="success" aria-label="Completed task progress" />
						<Progress value={78} tone="warning" aria-label="Warning task progress" />
						<Progress value={92} tone="danger" aria-label="Critical task progress" />
					</div>
				),
			},
			{
				id: catalogScenarioId("progress", "sizes"),
				title: "Sizes",
				code: scenarioModule(
					`<div className="flex w-full max-w-md flex-col gap-basalt-layout">
	<Progress value={45} size="sm" aria-label="Small progress" />
	<Progress value={45} size="md" aria-label="Medium progress" />
	<Progress value={45} size="lg" aria-label="Large progress" />
</div>`,
					['import { Progress } from "@nocoo/basalt/components/progress";'],
				),
				render: () => (
					<div className="flex w-full max-w-md flex-col gap-basalt-layout">
						<Progress value={45} size="sm" aria-label="Small progress" />
						<Progress value={45} size="md" aria-label="Medium progress" />
						<Progress value={45} size="lg" aria-label="Large progress" />
					</div>
				),
			},
			{
				id: catalogScenarioId("progress", "indeterminate"),
				title: "Indeterminate",
				code: scenarioModule(
					'<Progress className="max-w-md" aria-label="Installing dependencies" />',
					['import { Progress } from "@nocoo/basalt/components/progress";'],
				),
				render: () => <Progress className="max-w-md" aria-label="Installing dependencies" />,
			},
		],
	},
});
