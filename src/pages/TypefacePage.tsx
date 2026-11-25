import { AvatarInitials } from "@nocoo/basalt/components/avatar";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import { Code, CodeHighlighted } from "@nocoo/basalt/components/code";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Meter } from "@nocoo/basalt/components/meter";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { SegmentControl } from "@nocoo/basalt/components/segment-control";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { TagBadge } from "@nocoo/basalt/components/tag-badge";
import { Text } from "@nocoo/basalt/components/text";
import { Check, X } from "lucide-react";
import { ShowcasePage } from "@/components/ShowcasePage";
import { cn } from "@/lib/utils";
import {
	LINE_BOX_SPECS,
	NUMERIC_LEDGER_SAMPLES,
	OPENTYPE_VARIANTS,
	TYPEFACE_CODE_SNIPPET,
	TYPEFACE_FAMILIES,
} from "@/models/typeface";
import { useTypefaceShowcaseViewModel } from "@/viewmodels/useTypefaceShowcaseViewModel";

const FAMILY_ROLES: Record<string, string> = {
	sans: "Headings, KPIs, default UI & prose",
	mono: "Code, IDs & telemetry",
};

const TIER_LABELS: Record<string, { name: string; roles: string }> = {
	"3xl": {
		name: "Page / metric",
		roles: "PageHeader h1 and primary KPI numerals (StatCard)",
	},
	xl: {
		name: "Section",
		roles: 'Section h2/h3 headings, SectionRule variant="heading", modal/drawer titles',
	},
	lg: {
		name: "Card title",
		roles: "Structured non-asChild LayerCard.Header and dashboard panel headings",
	},
	base: {
		name: "Body",
		roles: "Default controls, Label, Body prose, asChild disclosures",
	},
	md: {
		name: "Compact",
		roles:
			'Table/DataTable cells & captions, size="sm" controls, sidebar destinations and search, SegmentControl, CodeBlock',
	},
	sm: {
		name: "Auxiliary",
		roles: "Badges, TableHead, field hints/errors, SectionRule uppercase labels, inline Code",
	},
	xs: {
		name: "Micro",
		roles:
			'Compact 24px AvatarInitials, compact Meter size="sm" readouts, sidebar group/partition labels and search shortcut, chart micro-labels',
	},
};

const LINE_BOX_LABELS: Record<string, string> = {
	controlSm: "Button / Input (sm)",
	controlDefault: "Button / Select (default)",
	segmentedTrack: "SegmentControl / ToggleGroup",
	sidebarRow: "Sidebar destination row",
	controlLg: "Button (lg)",
	tableRow: "Table / DataTable row",
	banner: "Banner surface",
};

const OPENTYPE_SAMPLE_LABELS: Record<string, string> = {
	cv02: "cv02 · open 4",
	cv03: "cv03 · open 6",
	cv04: "cv04 · open 9",
	cv11: "cv11 · single-story a",
};

const DO_RULES = [
	"Keep toolbar Tabs, Buttons, and Selects at default 34px / 14px height unless the whole toolbar is intentionally compact.",
	"Let Table and DataTable inherit text-basalt-md (13px) so data rows stay crisply one step below 14px controls.",
	"Keep TableHead compact at 12px medium without artificial letter-spacing.",
	"Apply font-basalt-display + tabular-nums on KPI figures and dynamic readouts.",
	"Attach CodeHighlighted directly to LayerCard and use LayerCard.Header asChild only for disclosures.",
];

const DONT_RULES = [
	'Do not mix size="sm" buttons next to default 34px Selects or Tabs in card toolbars.',
	"Do not use responsive text overrides such as text-basalt-sm sm:text-basalt-base.",
	"Do not shrink arbitrary text with inline px font sizes or non-canonical tokens like text-basalt-2xl.",
	"Do not force control heights with fixed h-* classes instead of line box + shared padding.",
	"Do not drop secondary or placeholder text below 4.5:1 WCAG contrast.",
];

export default function TypefacePage() {
	const {
		specimenMode,
		customText,
		scaleRows,
		selectSpecimenMode,
		setCustomText,
		resetCustomText,
	} = useTypefaceShowcaseViewModel();

	return (
		<ShowcasePage
			title="Typeface"
			description="Positional typography rules for dense interfaces: two app typefaces (Inter and JetBrains Mono), seven canonical scale tiers, integer line boxes, OpenType disambiguation, and tabular numerals."
		>
			<SectionRule
				title="Typeface families"
				hint="Two self-hosted app fonts pair unified Inter UI/display copy with JetBrains Mono fixed-width telemetry."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[48rem]/island:grid-cols-2">
					{TYPEFACE_FAMILIES.map((family) => (
						<LayerCard key={family.id}>
							<LayerCard.Header className="items-center">
								<div className="min-w-0">
									<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
										{family.name}
									</h3>
									<p className="text-basalt-sm font-normal text-basalt-muted-foreground">
										{FAMILY_ROLES[family.id]}
									</p>
								</div>
								<Code className="shrink-0">{family.utility}</Code>
							</LayerCard.Header>
							<LayerCard.Body className="space-y-basalt-card-sm">
								<p className={family.sampleClass}>{family.heroSample}</p>
								<p className={family.bodyClass}>{family.pangram}</p>
								<div className="flex flex-wrap items-center gap-basalt-layout-sm pt-basalt-space-sm">
									{family.weights.map((sample) => (
										<span
											key={sample.weight}
											className={cn(sample.className, "text-basalt-foreground")}
										>
											{sample.weight} {sample.label}
										</span>
									))}
								</div>
							</LayerCard.Body>
							<LayerCard.Well>
								<DescriptionList columns={1}>
									<DescriptionList.Item term="Token">
										<Code>{family.token}</Code>
									</DescriptionList.Item>
									<DescriptionList.Item term="OpenType">{family.features}</DescriptionList.Item>
									<DescriptionList.Item term="Fallback stack">
										<span className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
											{family.stack}
										</span>
									</DescriptionList.Item>
								</DescriptionList>
							</LayerCard.Well>
						</LayerCard>
					))}
				</div>
			</SectionRule>

			<SectionRule
				title="Seven-tier positional scale"
				hint="Typography is assigned by structural position, not by arbitrary breakpoint size steps."
			>
				<LayerCard>
					<LayerCard.Header divided className="flex-wrap items-center">
						<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
							Canonical scale ramp
						</h3>
						<SegmentControl
							aria-label="Specimen preview mode"
							value={specimenMode}
							onValueChange={selectSpecimenMode}
							options={[
								{ value: "roles", label: "Roles" },
								{ value: "bilingual", label: "Bilingual" },
								{ value: "custom", label: "Custom" },
							]}
						/>
					</LayerCard.Header>
					{specimenMode === "custom" ? (
						<LayerCard.Well className="flex flex-wrap items-center gap-basalt-layout-sm">
							<Input
								className="min-w-48 max-w-96 flex-1"
								value={customText}
								onChange={(event) => setCustomText(event.target.value)}
								placeholder="Enter preview text across all 7 tiers..."
								aria-label="Custom specimen preview text"
							/>
							<Button variant="outline" onClick={resetCustomText}>
								Reset
							</Button>
						</LayerCard.Well>
					) : null}
					<div
						data-basalt-table-container=""
						data-edge="attached"
						className={cn(
							"overflow-x-auto",
							specimenMode === "custom" && "border-t border-basalt-border",
						)}
					>
						<Table aria-label="Basalt seven-tier typographic scale">
							<TableHeader>
								<TableRow>
									<TableHead>Tier</TableHead>
									<TableHead>Token & utility</TableHead>
									<TableHead>Line box · tracking · weight</TableHead>
									<TableHead>Live specimen</TableHead>
									<TableHead>Canonical roles</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{scaleRows.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="whitespace-nowrap">
											<div className="font-medium text-basalt-foreground">
												{TIER_LABELS[row.id]?.name}
											</div>
											<div className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground tabular-nums">
												{row.px} / {row.rem}
											</div>
										</TableCell>
										<TableCell className="whitespace-nowrap">
											<div className="space-y-basalt-space-xs">
												<div>
													<Code>{row.utility}</Code>
												</div>
												<div className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
													{row.token}
												</div>
											</div>
										</TableCell>
										<TableCell className="whitespace-nowrap">
											<div className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground tabular-nums">
												<div>{row.lineBox}</div>
												<div>
													{row.tracking} · {row.weight}
												</div>
											</div>
										</TableCell>
										<TableCell className="min-w-48">
											<span
												data-typeface-tier={row.id}
												className={cn("block [overflow-wrap:anywhere]", row.specimenClass)}
											>
												{row.specimen}
											</span>
										</TableCell>
										<TableCell>
											<span className="text-basalt-sm text-basalt-muted-foreground">
												{TIER_LABELS[row.id]?.roles}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<LayerCard.Footer className="justify-start text-basalt-sm text-basalt-muted-foreground">
						Independent display exemptions remain isolated to LandingPage and NotFound
						(text-basalt-10xl). Never use sm:text-basalt-* responsive size jumps.
					</LayerCard.Footer>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Line boxes & reading measures"
				hint="Controls reach target heights through font-size + line-height + shared padding — never hardcoded CSS heights."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[54rem]/island:grid-cols-2">
					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								Interactive control line boxes
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="flex flex-wrap items-center gap-basalt-layout-sm">
							<Button size="sm" variant="outline">
								Compact (28px)
							</Button>
							<Button variant="outline">Default (34px)</Button>
							<SegmentControl
								aria-label="Segmented track geometry"
								value="a"
								onValueChange={() => undefined}
								options={[
									{ value: "a", label: "Compact 13px" },
									{ value: "b", label: "34px track" },
								]}
							/>
							<Button size="lg" variant="outline">
								Large (40px)
							</Button>
						</LayerCard.Body>
						<div
							data-basalt-table-container=""
							data-edge="attached"
							className="overflow-x-auto border-t border-basalt-border"
						>
							<Table density="compact" aria-label="Control and surface line-box reference">
								<TableHeader>
									<TableRow>
										<TableHead>Surface / control</TableHead>
										<TableHead>Font / line box</TableHead>
										<TableHead>Padding / border</TableHead>
										<TableHead textAlign="end">Target height</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{LINE_BOX_SPECS.map((spec) => (
										<TableRow key={spec.id}>
											<TableCell className="whitespace-nowrap font-medium text-basalt-foreground">
												{LINE_BOX_LABELS[spec.id]}
											</TableCell>
											<TableCell className="whitespace-nowrap font-basalt-mono text-basalt-muted-foreground tabular-nums">
												{spec.typography}
											</TableCell>
											<TableCell className="whitespace-nowrap font-basalt-mono text-basalt-muted-foreground tabular-nums">
												{spec.inset}
											</TableCell>
											<TableCell
												textAlign="end"
												className="whitespace-nowrap font-basalt-mono font-medium text-basalt-foreground"
											>
												{spec.targetHeight}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								Leading & reading measure
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									Tight · 1.25 (30px on 24px headings & KPIs)
								</p>
								<p className="font-basalt-display text-basalt-xl leading-basalt-tight font-semibold text-basalt-foreground">
									Q4 Clinical Network Utilization — +18.4%
								</p>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									Body · 1.43 (20px on 14px UI copy)
								</p>
								<p className="text-basalt-base leading-basalt-body text-basalt-foreground">
									Controls, labels, and form help align on crisp 20px body line boxes.
								</p>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									Relaxed · 1.5 (65ch reading prose)
								</p>
								<Text size="md" className="max-w-[65ch]">
									Long-form documentation paragraphs stay bounded around 65ch width with 1.5 relaxed
									leading so dense technical pages remain comfortable during extended sessions.
								</Text>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									Mono · 13px (--basalt-font-mono)
								</p>
								<Text variant="mono" size="sm">
									bun add @nocoo/basalt # 01Il O0 -&gt; fixed cell grid
								</Text>
							</div>
						</LayerCard.Body>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule
				title="OpenType & numeric precision"
				hint="Inter enables stylistic alternation (cv02, cv03, cv04, cv11) globally; metrics lock to fixed tabular advances."
			>
				<div className="grid grid-cols-1 gap-basalt-layout @[54rem]/island:grid-cols-2">
					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								Glyph disambiguation
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								Basalt default · cv02, cv03, cv04, cv11
							</p>
							<p className="text-basalt-3xl leading-basalt-tight font-semibold tracking-tight text-basalt-foreground">
								Il1 · O0 · 4 6 9 · a g
							</p>
							<p className="font-basalt-sans text-basalt-base text-basalt-muted-foreground">
								tok_live_I1l0O9a46
							</p>
							<div className="flex flex-wrap gap-basalt-space-lg">
								{OPENTYPE_VARIANTS.map((variant) => (
									<Badge key={variant.id} variant="outline">
										{OPENTYPE_SAMPLE_LABELS[variant.id]}
									</Badge>
								))}
							</div>
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-card-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								Disabled · font-feature-settings: normal
							</p>
							<p className="text-basalt-3xl leading-basalt-tight font-semibold tracking-tight text-basalt-muted-foreground [font-feature-settings:normal]">
								Il1 · O0 · 4 6 9 · a g
							</p>
							<p className="text-basalt-base text-basalt-muted-foreground [font-feature-settings:normal]">
								tok_live_I1l0O9a46
							</p>
						</LayerCard.Well>
					</LayerCard>

					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								Tabular vs proportional numerals
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							<div className="space-y-basalt-space-sm">
								<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
									tabular-nums (vertical decimal lock)
								</p>
								{NUMERIC_LEDGER_SAMPLES.map((value) => (
									<div
										key={value}
										className="text-end font-basalt-display text-basalt-xl font-semibold text-basalt-foreground tabular-nums"
									>
										{value}
									</div>
								))}
							</div>
							<Meter size="sm" value={78} tone="auto" label='Meter size="sm" (11px mono)' />
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-space-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								proportional-nums (horizontal jitter)
							</p>
							{NUMERIC_LEDGER_SAMPLES.map((value) => (
								<div
									key={value}
									className="text-end font-basalt-display text-basalt-xl font-semibold text-basalt-muted-foreground [font-variant-numeric:proportional-nums]"
								>
									{value}
								</div>
							))}
						</LayerCard.Well>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule
				title="Hierarchy in context & rules"
				hint="How the seven tiers compose inside a real card without colliding in visual weight."
			>
				<div className="space-y-basalt-layout">
					<LayerCard>
						<LayerCard.Header divided className="flex-wrap items-center">
							<div className="min-w-0">
								<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
									Runtime typography anatomy (15px Card Header)
								</h3>
								<p className="mt-basalt-space-xs text-basalt-base font-normal text-basalt-muted-foreground">
									Subtitle description · 14px muted foreground
								</p>
							</div>
							<Button variant="outline">Toolbar parity (34px / 14px)</Button>
						</LayerCard.Header>
						<div data-basalt-table-container="" data-edge="attached" className="overflow-x-auto">
							<Table aria-label="Annotated live typography composition table">
								<TableHeader>
									<TableRow>
										<TableHead>Owner (13px · 11px avatar)</TableHead>
										<TableHead>Tag (12px)</TableHead>
										<TableHead textAlign="end">Meter (11px readout)</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>
											<div className="flex items-center gap-basalt-row-gap">
												<AvatarInitials name="Sarah Nguyen" size="sm" />
												<div className="min-w-0">
													<span className="font-medium text-basalt-foreground">Sarah Nguyen</span>
													<span className="ms-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
														Tier-1 Lead
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<TagBadge name="Production" color="success" />
										</TableCell>
										<TableCell textAlign="end">
											<Meter size="sm" tone="auto" value={78} aria-label="Sarah Nguyen" />
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<div className="flex items-center gap-basalt-row-gap">
												<AvatarInitials name="Mark Darnalds" size="sm" />
												<span className="font-medium text-basalt-foreground">Mark Darnalds</span>
											</div>
										</TableCell>
										<TableCell>
											<TagBadge name="Verification" color="blue" />
										</TableCell>
										<TableCell textAlign="end">
											<Meter size="sm" tone="auto" value={92} aria-label="Mark Darnalds" />
										</TableCell>
									</TableRow>
								</TableBody>
							</Table>
						</div>
						<CodeHighlighted attached title="typography-tokens.css" code={TYPEFACE_CODE_SNIPPET} />
					</LayerCard>

					<div className="grid grid-cols-1 gap-basalt-layout @[48rem]/island:grid-cols-2">
						<LayerCard>
							<LayerCard.Header divided className="items-center">
								<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
									Typography norms
								</h3>
								<Badge tone="success">Do</Badge>
							</LayerCard.Header>
							<LayerCard.Body>
								<ul className="space-y-basalt-card-sm">
									{DO_RULES.map((rule) => (
										<li
											key={rule}
											className="flex items-start gap-basalt-row-gap text-basalt-md leading-basalt-body text-basalt-foreground"
										>
											<Check
												className="mt-basalt-space-xs size-basalt-icon shrink-0 text-basalt-success"
												strokeWidth={1.75}
												aria-hidden="true"
											/>
											<span>{rule}</span>
										</li>
									))}
								</ul>
							</LayerCard.Body>
						</LayerCard>

						<LayerCard>
							<LayerCard.Header divided className="items-center">
								<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
									Anti-patterns to avoid
								</h3>
								<Badge tone="danger" variant="solid">
									Don't
								</Badge>
							</LayerCard.Header>
							<LayerCard.Body>
								<ul className="space-y-basalt-card-sm">
									{DONT_RULES.map((rule) => (
										<li
											key={rule}
											className="flex items-start gap-basalt-row-gap text-basalt-md leading-basalt-body text-basalt-foreground"
										>
											<X
												className="mt-basalt-space-xs size-basalt-icon shrink-0 text-basalt-danger-solid"
												strokeWidth={1.75}
												aria-hidden="true"
											/>
											<span>{rule}</span>
										</li>
									))}
								</ul>
							</LayerCard.Body>
						</LayerCard>
					</div>
				</div>
			</SectionRule>
		</ShowcasePage>
	);
}
