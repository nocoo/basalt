import { Avatar, AvatarFallback } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Button } from "@nocoo/basalt/components/button";
import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";
import { CodeBlock, CodeHighlighted } from "@nocoo/basalt/components/code";
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

export default catalogContentFamily({
	badge: {
		docs: extraDocs("Badge", "badge", "Compact status labels.", "<Badge>Stable</Badge>"),
		examples: [
			{
				id: catalogScenarioId("badge", "primary-badges"),
				title: "Primary Badges",
				code: "<Badge>Default</Badge>",
				render: () => <Badge>Default</Badge>,
			},
			{
				id: catalogScenarioId("badge", "other-color-variants"),
				title: "Other color variants",
				code: `<Badge variant="secondary">Secondary</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>`,
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
				code: `<Badge variant="red">Red</Badge>
<Badge variant="orange">Orange</Badge>
<Badge variant="teal">Teal</Badge>
<Badge variant="blue">Blue</Badge>
<Badge variant="purple">Purple</Badge>`,
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
				code: `<Badge dot>Live</Badge>
<Badge dot variant="success">Healthy</Badge>`,
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
				code: "<Text>Status is <Badge>Stable</Badge></Text>",
				render: () => (
					<Text>
						Status is <Badge>Stable</Badge>
					</Text>
				),
			},
			{
				id: catalogScenarioId("badge", "with-an-icon"),
				title: "With an icon",
				code: `<Badge><Check className="size-3" /> Verified</Badge>
<Badge variant="success"><Check className="size-3" /> Healthy</Badge>
<Badge variant="warning"><AlertTriangle className="size-3" /> Warning</Badge>
<Badge variant="error"><CircleAlert className="size-3" /> Error</Badge>
<Badge variant="info"><Info className="size-3" /> Info</Badge>`,
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
				code: '<Link href="#"><Badge>Docs</Badge></Link>',
				render: () => (
					<Link href="#">
						<Badge>Docs</Badge>
					</Link>
				),
			},
		],
	},
	banner: {
		docs: extraDocs(
			"Banner",
			"banner",
			"Displays contextual inline messages for informational, alert, or error states.",
			'<Banner icon={<Info />} title="Update available" description="A new version is ready to install." />',
			[
				{
					name: "variant",
					type: '"default" | "alert" | "error" | "secondary"',
					default: '"default"',
					description: "Visual style of the banner.",
				},
				{
					name: "size",
					type: '"base" | "sm"',
					default: '"base"',
					description: "Compact size for dialogs and tight spaces.",
				},
				{
					name: "icon",
					type: "ReactNode",
					description: "Icon rendered before the banner content.",
				},
				{ name: "title", type: "string", description: "Primary heading text." },
				{
					name: "description",
					type: "ReactNode",
					description: "Secondary copy below the title.",
				},
				{
					name: "action",
					type: "ReactNode",
					description: "Trailing CTA slot. Use Banner.Action for accent-aware buttons.",
				},
				{ name: "className", type: "string" },
			],
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
		examples: [
			{
				id: catalogScenarioId("banner", "variants"),
				title: "Variants",
				code: `<Banner icon={<Info />} title="Update available" description="A new version is ready to install." />
<Banner icon={<AlertTriangle />} variant="alert" title="Session expiring" description="Your session will expire in 5 minutes." />
<Banner icon={<CircleAlert />} variant="error" title="Save failed" description="We couldn't save your changes. Please try again." />
<Banner icon={<Info />} variant="secondary" title="Maintenance scheduled" description="This service will be unavailable for 10 minutes." />`,
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
				code: '<Banner icon={<AlertTriangle />} variant="alert" title="Review required" description="Please review your billing information before proceeding." />',
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
				code: `<Banner
  icon={<Info />}
  title="Update available"
  description="A new version is ready to install."
  action={
    <>
      <Banner.Action>Update</Banner.Action>
      <Banner.Action variant="ghost" icon={<X />} aria-label="Dismiss" />
    </>
  }
/>`,
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
				code: `<Banner
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
				code: `<Banner
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
<Banner size="sm" description="A project named Atlas already exists." />`,
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
				code: `<Banner
  icon={<Info />}
  title="Custom content supported"
  description={
    <Text className="text-inherit">
      This banner supports <strong>custom content</strong> with Text.
    </Text>
  }
/>`,
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
		docs: extraDocs(
			"Empty",
			"empty",
			"Empty-state copy.",
			'<Empty title="No results" description="Try another query." />',
			undefined,
			`import { Empty } from "@nocoo/basalt/components/empty";

export default function Example() {
	return <Empty title="No results" description="Try another query." />;
}`,
		),
		examples: [
			{
				id: catalogScenarioId("empty", "basic"),
				title: "Basic",
				code: '<Empty title="No results" description="Try another query." />',
				render: () => <Empty title="No results" description="Try another query." />,
			},
			{
				id: catalogScenarioId("empty", "with-icon"),
				title: "With icon",
				code: '<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />',
				render: () => (
					<Empty icon={<Inbox />} title="Inbox zero" description="You are all caught up." />
				),
			},
		],
	},
	loader: {
		docs: extraDocs("Loader", "loader", "Indicates a pending state.", "<Loader />"),
		examples: [
			{
				id: catalogScenarioId("loader", "default-size"),
				title: "Default Size",
				code: "<Loader />",
				render: () => <Loader />,
			},
			{
				id: catalogScenarioId("loader", "custom-size"),
				title: "Custom Size",
				code: "<Loader size={16} /><Loader size={24} /><Loader size={32} />",
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
		docs: extraDocs(
			"SkeletonLine",
			"skeleton-line",
			"Placeholder lines while content loads.",
			"<SkeletonLine minWidth={40} maxWidth={55} />",
			undefined,
			`import { SkeletonLine } from "@nocoo/basalt/components/skeleton-line";

export default function Example() {
	return <SkeletonLine minWidth={40} maxWidth={55} />;
}`,
		),
		examples: [
			{
				id: catalogScenarioId("skeleton-line", "default"),
				title: "Default",
				code: `<SkeletonLine minWidth={40} maxWidth={55} />
<SkeletonLine minWidth={75} maxWidth={90} />
<SkeletonLine minWidth={90} maxWidth={100} />`,
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
				code: `<SkeletonLine minWidth={80} maxWidth={100} />
<SkeletonLine minWidth={60} maxWidth={80} />
<SkeletonLine minWidth={40} maxWidth={60} />`,
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
				code: `<SkeletonLine className="h-2" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-4" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-6" minWidth={90} maxWidth={100} />
<SkeletonLine className="h-8" minWidth={90} maxWidth={100} />`,
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
		docs: extraDocs(
			"Meter",
			"meter",
			"Numeric meter.",
			'<Meter value={60} label="Usage" />',
			undefined,
			`import { Meter } from "@nocoo/basalt/components/meter";

export default function Example() {
	return <Meter value={60} label="Usage" />;
}`,
		),
		examples: [
			{
				id: catalogScenarioId("meter", "basic-meter"),
				title: "Basic Meter",
				code: '<Meter value={40} label="Usage" />',
				render: () => <Meter value={40} label="Usage" />,
			},
			{
				id: catalogScenarioId("meter", "custom-value-display"),
				title: "Custom Value Display",
				code: '<Meter value={12} label="Storage" customValue="12 GB" />',
				render: () => <Meter value={12} label="Storage" customValue="12 GB" />,
			},
			{
				id: catalogScenarioId("meter", "hidden-value"),
				title: "Hidden Value",
				code: '<Meter value={72} label="Progress" hideValue />',
				render: () => <Meter value={72} label="Progress" hideValue />,
			},
			{
				id: catalogScenarioId("meter", "full-meter"),
				title: "Full Meter",
				code: '<Meter value={100} label="Complete" />',
				render: () => <Meter value={100} label="Complete" />,
			},
			{
				id: catalogScenarioId("meter", "low-value"),
				title: "Low Value",
				code: '<Meter value={8} label="Quota" />',
				render: () => <Meter value={8} label="Quota" />,
			},
		],
	},
	toast: {
		docs: extraDocs(
			"Toast",
			"toast",
			"Transient notification.",
			"<Button onClick={() => toast('Saved')}>Toast</Button>",
			[
				{ name: "message", type: "string" },
				{
					name: "variant",
					type: '"default" | "success" | "error" | "warning" | "info"',
					description: "Color and default icon.",
				},
				{
					name: "icon",
					type: "ReactNode | false",
					description: "Override or hide the status icon.",
				},
				{
					name: "close",
					type: "boolean",
					default: "true",
					description: "Show an X close control.",
				},
				{ name: "description", type: "ReactNode" },
			],
			`import { Button } from "@nocoo/basalt/components/button";
import { toast } from "@nocoo/basalt/components/toast";

export default function Example() {
	return <Button onClick={() => toast("Saved")}>Toast</Button>;
}`,
		),
		examples: [
			{
				id: catalogScenarioId("toast", "title-only"),
				title: "Title Only",
				code: '<Button onClick={() => toast("Saved")}>Title only</Button>',
				render: () => <Button onClick={() => toast("Saved")}>Title only</Button>,
			},
			{
				id: catalogScenarioId("toast", "title-and-description"),
				title: "Title and Description",
				code: '<Button onClick={() => toast("Saved", { description: "Project updated." })}>With description</Button>',
				render: () => (
					<Button onClick={() => toast("Saved", { description: "Project updated." })}>
						With description
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "success-variant"),
				title: "Success Variant",
				code: '<Button onClick={() => toast.success("Deployed")}>Success</Button>',
				render: () => <Button onClick={() => toast.success("Deployed")}>Success</Button>,
			},
			{
				id: catalogScenarioId("toast", "error-variant"),
				title: "Error Variant",
				code: '<Button onClick={() => toast.error("Failed")}>Error</Button>',
				render: () => <Button onClick={() => toast.error("Failed")}>Error</Button>,
			},
			{
				id: catalogScenarioId("toast", "warning-variant"),
				title: "Warning Variant",
				code: '<Button onClick={() => toast.warning("Expiring")}>Warning</Button>',
				render: () => <Button onClick={() => toast.warning("Expiring")}>Warning</Button>,
			},
			{
				id: catalogScenarioId("toast", "info-variant"),
				title: "Info Variant",
				code: '<Button onClick={() => toast.info("Queued")}>Info</Button>',
				render: () => <Button onClick={() => toast.info("Queued")}>Info</Button>,
			},
			{
				id: catalogScenarioId("toast", "close-button"),
				title: "Close button",
				code: '<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>With close</Button>',
				render: () => (
					<Button onClick={() => toast("Saved", { close: true, description: "Dismiss with X." })}>
						With close
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "hidden-close"),
				title: "Hidden close",
				code: '<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>No close</Button>',
				render: () => (
					<Button onClick={() => toast("Saved", { close: false, description: "No X control." })}>
						No close
					</Button>
				),
			},
			{
				id: catalogScenarioId("toast", "custom-icon"),
				title: "Custom icon",
				code: '<Button onClick={() => toast.success("Verified", { icon: <Check className="size-4" />, description: "Custom icon passed as a parameter." })}>Custom icon</Button>',
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
				code: '<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>',
				render: () => (
					<Button onClick={() => toast.success("Deployed", { icon: false })}>No icon</Button>
				),
			},
		],
	},
	"clipboard-text": {
		docs: extraDocs(
			"ClipboardText",
			"clipboard-text",
			"Copyable text.",
			'<ClipboardText text="bun add @nocoo/basalt" />',
			undefined,
			`import { ClipboardText } from "@nocoo/basalt/components/clipboard-text";

export default function Example() {
	return <ClipboardText text="bun add @nocoo/basalt" />;
}`,
		),
		examples: [
			{
				id: catalogScenarioId("clipboard-text", "short-text"),
				title: "Short Text",
				code: '<ClipboardText text="bun add @nocoo/basalt" />',
				render: () => <ClipboardText text="bun add @nocoo/basalt" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "api-key"),
				title: "API Key",
				code: '<ClipboardText text="project-••••" copyText="project-atlas" />',
				render: () => <ClipboardText text="project-••••" copyText="project-atlas" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "copy-alternate-text"),
				title: "Copy Alternate Text",
				code: '<ClipboardText text="Visible label" copyText="copied-value" />',
				render: () => <ClipboardText text="Visible label" copyText="copied-value" />,
			},
			{
				id: catalogScenarioId("clipboard-text", "long-text"),
				title: "Long Text",
				code: '<ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />',
				render: () => <ClipboardText text="https://basalt.dev.hexly.ai/ui/clipboard-text" />,
			},
		],
	},
	code: {
		docs: extraDocs(
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
		examples: [
			{
				id: catalogScenarioId("code", "typescript"),
				title: "TypeScript",
				code: `<CodeHighlighted code={\`export async function fetchUser(id: string, retries = 3) {
  const response = await fetch("/api/users/" + id);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: user.firstName + " " + user.lastName,
  };
}\`} />`,
				render: () => (
					<CodeHighlighted
						code={`export async function fetchUser(id: string, retries = 3) {
  // Resolve a profile, then return a display name.
  const response = await fetch(\`/api/users/\${id}\`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: \`\${user.firstName} \${user.lastName}\`,
  };
}`}
					/>
				),
			},
			{
				id: catalogScenarioId("code", "react"),
				title: "React",
				code: `<CodeHighlighted code={\`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}\`} />`,
				render: () => (
					<CodeHighlighted
						code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}`}
					/>
				),
			},
		],
	},
	"code-block": {
		docs: extraDocs(
			"CodeBlock",
			"code-block",
			"A fenced code block.",
			"<CodeBlock>const n = 1;</CodeBlock>",
		),
		examples: [
			{
				id: catalogScenarioId("code-block", "basic"),
				title: "Basic",
				code: "<CodeBlock>const n = 1</CodeBlock>",
				render: () => <CodeBlock>const n = 1</CodeBlock>,
			},
		],
	},
	avatar: {
		docs: extraDocs("Avatar", "avatar", "User avatar.", "<Avatar />"),
		examples: [
			{
				id: catalogScenarioId("avatar", "fallback"),
				title: "Fallback",
				code: "<Avatar><AvatarFallback>ZL</AvatarFallback></Avatar>",
				render: () => (
					<Avatar>
						<AvatarFallback>ZL</AvatarFallback>
					</Avatar>
				),
			},
		],
	},
});
