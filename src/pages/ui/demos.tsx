import { Banner } from "@nocoo/basalt/components/banner";
import { Link } from "@nocoo/basalt/components/link";
import { Text } from "@nocoo/basalt/components/text";
import { AlertTriangle, CircleAlert, Info, X } from "lucide-react";
import { EXTRA_EXAMPLES } from "./catalog-ready";
import { type CatalogScenario, catalogScenarioId } from "./catalog-scenario";
import { TOOLTIP_EXAMPLES } from "./examples/tooltip";
import { KUMO_EXAMPLES } from "./kumo-examples";

const BASE_EXAMPLES: Record<string, CatalogScenario[]> = {
	tooltip: TOOLTIP_EXAMPLES,
	banner: [
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
};

export const UI_EXAMPLES: Record<string, CatalogScenario[]> = {
	...EXTRA_EXAMPLES,
	...BASE_EXAMPLES,
	...KUMO_EXAMPLES,
};

export function catalogHeroScenario(slug: string): CatalogScenario | undefined {
	return UI_EXAMPLES[slug]?.[0];
}
