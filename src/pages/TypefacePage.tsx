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
import { useTranslation } from "react-i18next";
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

function stringArray(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

export default function TypefacePage() {
	const { t } = useTranslation();
	const {
		specimenMode,
		customText,
		scaleRows,
		selectSpecimenMode,
		setCustomText,
		resetCustomText,
	} = useTypefaceShowcaseViewModel();

	const doRules = stringArray(t("pages.typeface.doRules", { returnObjects: true }));
	const dontRules = stringArray(t("pages.typeface.dontRules", { returnObjects: true }));

	return (
		<ShowcasePage title={t("pages.typeface.title")} description={t("pages.typeface.description")}>
			<SectionRule title={t("pages.typeface.families")} hint={t("pages.typeface.familiesHint")}>
				<div className="grid grid-cols-1 gap-basalt-layout @[60rem]/island:grid-cols-3">
					{TYPEFACE_FAMILIES.map((family) => (
						<LayerCard key={family.id}>
							<LayerCard.Header className="items-center">
								<div className="min-w-0">
									<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
										{family.name}
									</h3>
									<p className="text-basalt-sm font-normal text-basalt-muted-foreground">
										{t(`pages.typeface.familyRoles.${family.id}`)}
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
									<DescriptionList.Item term={t("pages.typeface.familyToken")}>
										<Code>{family.token}</Code>
									</DescriptionList.Item>
									<DescriptionList.Item term={t("pages.typeface.familyFeatures")}>
										{family.features}
									</DescriptionList.Item>
									<DescriptionList.Item term={t("pages.typeface.familyStack")}>
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

			<SectionRule title={t("pages.typeface.scale")} hint={t("pages.typeface.scaleHint")}>
				<LayerCard>
					<LayerCard.Header divided className="flex-wrap items-center">
						<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
							{t("pages.typeface.scaleHeading")}
						</h3>
						<SegmentControl
							aria-label={t("pages.typeface.modeLabel")}
							value={specimenMode}
							onValueChange={selectSpecimenMode}
							options={[
								{ value: "roles", label: t("pages.typeface.modeRoles") },
								{ value: "bilingual", label: t("pages.typeface.modeBilingual") },
								{ value: "custom", label: t("pages.typeface.modeCustom") },
							]}
						/>
					</LayerCard.Header>
					{specimenMode === "custom" ? (
						<LayerCard.Well className="flex flex-wrap items-center gap-basalt-layout-sm">
							<Input
								className="min-w-48 max-w-96 flex-1"
								value={customText}
								onChange={(event) => setCustomText(event.target.value)}
								placeholder={t("pages.typeface.customPlaceholder")}
								aria-label={t("pages.typeface.customLabel")}
							/>
							<Button variant="outline" onClick={resetCustomText}>
								{t("pages.typeface.resetSpecimen")}
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
						<Table aria-label={t("pages.typeface.scaleTableAria")}>
							<TableHeader>
								<TableRow>
									<TableHead>{t("pages.typeface.colTier")}</TableHead>
									<TableHead>{t("pages.typeface.colToken")}</TableHead>
									<TableHead>{t("pages.typeface.colMetrics")}</TableHead>
									<TableHead>{t("pages.typeface.colSpecimen")}</TableHead>
									<TableHead>{t("pages.typeface.colRoles")}</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{scaleRows.map((row) => (
									<TableRow key={row.id}>
										<TableCell className="whitespace-nowrap">
											<div className="font-medium text-basalt-foreground">
												{t(`pages.typeface.tiers.${row.id}.name`)}
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
												{t(`pages.typeface.tiers.${row.id}.roles`)}
											</span>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
					<LayerCard.Footer className="justify-start text-basalt-sm text-basalt-muted-foreground">
						{t("pages.typeface.scaleFooter")}
					</LayerCard.Footer>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.typeface.geometry")} hint={t("pages.typeface.geometryHint")}>
				<div className="grid grid-cols-1 gap-basalt-layout @[54rem]/island:grid-cols-2">
					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								{t("pages.typeface.controlGeometryTitle")}
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="flex flex-wrap items-center gap-basalt-layout-sm">
							<Button size="sm" variant="outline">
								{t("pages.typeface.actionSmLabel")}
							</Button>
							<Button variant="outline">{t("pages.typeface.actionDefaultLabel")}</Button>
							<SegmentControl
								aria-label={t("pages.typeface.segmentTrackLabel")}
								value="a"
								onValueChange={() => undefined}
								options={[
									{ value: "a", label: t("pages.typeface.segmentFirst") },
									{ value: "b", label: t("pages.typeface.segmentSecond") },
								]}
							/>
							<Button size="lg" variant="outline">
								{t("pages.typeface.actionLgLabel")}
							</Button>
						</LayerCard.Body>
						<div
							data-basalt-table-container=""
							data-edge="attached"
							className="overflow-x-auto border-t border-basalt-border"
						>
							<Table density="compact" aria-label={t("pages.typeface.controlGeometryAria")}>
								<TableHeader>
									<TableRow>
										<TableHead>{t("pages.typeface.colControl")}</TableHead>
										<TableHead>{t("pages.typeface.colTypography")}</TableHead>
										<TableHead>{t("pages.typeface.colInset")}</TableHead>
										<TableHead textAlign="end">{t("pages.typeface.colHeight")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{LINE_BOX_SPECS.map((spec) => (
										<TableRow key={spec.id}>
											<TableCell className="whitespace-nowrap font-medium text-basalt-foreground">
												{t(`pages.typeface.lineBoxes.${spec.id}`)}
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
								{t("pages.typeface.proseTitle")}
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									{t("pages.typeface.proseLeadTight")}
								</p>
								<p className="font-basalt-display text-basalt-xl leading-basalt-tight font-semibold tracking-tight text-basalt-foreground">
									{t("pages.typeface.proseSampleTight")}
								</p>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									{t("pages.typeface.proseLeadBody")}
								</p>
								<p className="text-basalt-base leading-basalt-body text-basalt-foreground">
									{t("pages.typeface.proseSampleBody")}
								</p>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									{t("pages.typeface.proseLeadRelaxed")}
								</p>
								<Text size="md" className="max-w-[65ch]">
									{t("pages.typeface.proseSampleRelaxed")}
								</Text>
							</div>
							<div className="space-y-basalt-space-xs">
								<p className="font-basalt-mono text-basalt-sm text-basalt-muted-foreground">
									{t("pages.typeface.proseMonoLabel")}
								</p>
								<Text variant="mono" size="sm">
									{t("pages.typeface.proseSampleMono")}
								</Text>
							</div>
						</LayerCard.Body>
					</LayerCard>
				</div>
			</SectionRule>

			<SectionRule title={t("pages.typeface.opentype")} hint={t("pages.typeface.opentypeHint")}>
				<div className="grid grid-cols-1 gap-basalt-layout @[54rem]/island:grid-cols-2">
					<LayerCard>
						<LayerCard.Header divided>
							<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
								{t("pages.typeface.disambiguationTitle")}
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								{t("pages.typeface.featuresDefault")}
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
										{t(`pages.typeface.samplePairs.${variant.id}`)}
									</Badge>
								))}
							</div>
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-card-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								{t("pages.typeface.featuresRaw")}
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
								{t("pages.typeface.numericTitle")}
							</h3>
						</LayerCard.Header>
						<LayerCard.Body className="space-y-basalt-card">
							<div className="space-y-basalt-space-sm">
								<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
									{t("pages.typeface.tabularLabel")}
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
							<Meter
								size="sm"
								value={78}
								tone="auto"
								label={t("pages.typeface.meterSampleLabel")}
							/>
						</LayerCard.Body>
						<LayerCard.Well className="space-y-basalt-space-sm">
							<p className="text-basalt-sm font-medium text-basalt-muted-foreground">
								{t("pages.typeface.proportionalLabel")}
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
				title={t("pages.typeface.composition")}
				hint={t("pages.typeface.compositionHint")}
			>
				<div className="space-y-basalt-layout">
					<LayerCard>
						<LayerCard.Header divided className="flex-wrap items-center">
							<div className="min-w-0">
								<h3 className="text-basalt-lg font-semibold text-basalt-foreground">
									{t("pages.typeface.contextHeader")}
								</h3>
								<p className="mt-basalt-space-xs text-basalt-base font-normal text-basalt-muted-foreground">
									{t("pages.typeface.contextSubtitle")}
								</p>
							</div>
							<Button variant="outline">{t("pages.typeface.contextAction")}</Button>
						</LayerCard.Header>
						<div data-basalt-table-container="" data-edge="attached" className="overflow-x-auto">
							<Table aria-label={t("pages.typeface.contextTableAria")}>
								<TableHeader>
									<TableRow>
										<TableHead>{t("pages.typeface.colMember")}</TableHead>
										<TableHead>{t("pages.typeface.colTierRole")}</TableHead>
										<TableHead textAlign="end">{t("pages.typeface.colUtilization")}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									<TableRow>
										<TableCell>
											<div className="flex items-center gap-basalt-row-gap">
												<AvatarInitials name={t("pages.typeface.contextOwnerName")} size="sm" />
												<div className="min-w-0">
													<span className="font-medium text-basalt-foreground">
														{t("pages.typeface.contextOwnerName")}
													</span>
													<span className="ms-basalt-space-lg text-basalt-sm text-basalt-muted-foreground">
														{t("pages.typeface.contextOwnerRole")}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											<TagBadge name={t("pages.typeface.contextServiceTag")} color="success" />
										</TableCell>
										<TableCell textAlign="end">
											<Meter
												size="sm"
												tone="auto"
												value={78}
												aria-label={t("pages.typeface.contextOwnerName")}
											/>
										</TableCell>
									</TableRow>
									<TableRow>
										<TableCell>
											<div className="flex items-center gap-basalt-row-gap">
												<AvatarInitials name={t("pages.typeface.contextMemberTwo")} size="sm" />
												<span className="font-medium text-basalt-foreground">
													{t("pages.typeface.contextMemberTwo")}
												</span>
											</div>
										</TableCell>
										<TableCell>
											<TagBadge name={t("pages.typeface.contextTagTwo")} color="blue" />
										</TableCell>
										<TableCell textAlign="end">
											<Meter
												size="sm"
												tone="auto"
												value={92}
												aria-label={t("pages.typeface.contextMemberTwo")}
											/>
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
									{t("pages.typeface.doTitle")}
								</h3>
								<Badge variant="success">{t("pages.typeface.doBadge")}</Badge>
							</LayerCard.Header>
							<LayerCard.Body>
								<ul className="space-y-basalt-card-sm">
									{doRules.map((rule) => (
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
									{t("pages.typeface.dontTitle")}
								</h3>
								<Badge variant="destructive">{t("pages.typeface.dontBadge")}</Badge>
							</LayerCard.Header>
							<LayerCard.Body>
								<ul className="space-y-basalt-card-sm">
									{dontRules.map((rule) => (
										<li
											key={rule}
											className="flex items-start gap-basalt-row-gap text-basalt-md leading-basalt-body text-basalt-foreground"
										>
											<X
												className="mt-basalt-space-xs size-basalt-icon shrink-0 text-basalt-destructive"
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
