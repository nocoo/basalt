import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ACCENT_SWATCHES } from "@nocoo/basalt/providers/accent";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { classicPaletteColors, isHexColor, validPaletteColors } from "@/lib/custom-palette";
import { useSitePalette } from "./SitePaletteProvider";

export function PaletteEditor() {
	const { t } = useTranslation();
	const { preference, apply, restoreClassic } = useSitePalette();
	const [draft, setDraft] = useState(preference.colors);
	const [message, setMessage] = useState("");
	const id = useId();
	useEffect(() => setDraft(preference.colors), [preference.colors]);
	const valid = validPaletteColors(draft);
	return (
		<LayerCard>
			<LayerCard.Header className="flex-wrap">
				<div className="space-y-basalt-space-sm">
					<h3 className="text-basalt-base font-medium">{t("pages.palette.customTitle")}</h3>
					<p className="max-w-2xl text-basalt-sm leading-basalt-relaxed text-muted-foreground">
						{t("pages.palette.customDescription")}
					</p>
				</div>
				<Badge variant="outline">{t(`pages.palette.mode.${preference.mode}`)}</Badge>
			</LayerCard.Header>
			<Collapsible>
				<LayerCard.Header asChild>
					<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
						{t("pages.palette.editColors")}
					</CollapsibleTrigger>
				</LayerCard.Header>
				<CollapsibleContent unstyled>
					<LayerCard.Body className="border-t border-basalt-border">
						<form
							className="space-y-basalt-layout"
							onSubmit={(event) => {
								event.preventDefault();
								if (valid)
									setMessage(t(apply(draft) ? "pages.palette.saved" : "pages.palette.sessionOnly"));
							}}
						>
							<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 xl:grid-cols-3">
								{ACCENT_SWATCHES.map((swatch) => (
									<fieldset
										key={swatch.id}
										className="min-w-0 space-y-basalt-space-lg rounded-basalt-lg border border-border p-basalt-card"
									>
										<legend className="px-basalt-space-sm text-basalt-sm font-medium">
											{swatch.label}
										</legend>
										{(["light", "dark"] as const).map((mode) => {
											const color = draft[swatch.id][mode];
											const update = (value: string) => {
												setDraft((current) => ({
													...current,
													[swatch.id]: { ...current[swatch.id], [mode]: value },
												}));
												setMessage("");
											};
											const label = `${swatch.label} · ${t(`pages.palette.${mode}`)}`;
											return (
												<div
													key={mode}
													className="grid grid-cols-[2.5rem_2.5rem_minmax(0,1fr)] items-center gap-basalt-space-lg"
												>
													<label
														htmlFor={`${id}-${swatch.id}-${mode}`}
														className="text-basalt-sm text-muted-foreground"
													>
														{t(`pages.palette.${mode}`)}
													</label>
													<input
														type="color"
														aria-label={`${label} ${t("pages.palette.colorPicker")}`}
														className="size-9 cursor-pointer rounded-basalt-md border border-border bg-transparent p-basalt-space-sm"
														value={isHexColor(color) ? color : "#000000"}
														onChange={(event) => update(event.target.value)}
													/>
													<Input
														id={`${id}-${swatch.id}-${mode}`}
														aria-label={label}
														value={color}
														maxLength={7}
														pattern="#[0-9a-fA-F]{6}"
														required
														aria-invalid={!isHexColor(color)}
														aria-describedby={!isHexColor(color) ? `${id}-error` : undefined}
														className="min-w-0 font-mono text-basalt-sm"
														onChange={(event) => update(event.target.value)}
													/>
												</div>
											);
										})}
									</fieldset>
								))}
							</div>
							{!valid && (
								<p id={`${id}-error`} role="alert" className="text-basalt-sm text-destructive">
									{t("pages.palette.invalidColor")}
								</p>
							)}
							<div className="flex flex-wrap gap-basalt-space-lg">
								<Button type="submit" disabled={!valid}>
									{t("pages.palette.saveCustom")}
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setDraft(classicPaletteColors());
										setMessage("");
									}}
								>
									{t("pages.palette.resetDraft")}
								</Button>
							</div>
						</form>
					</LayerCard.Body>
				</CollapsibleContent>
			</Collapsible>
			<LayerCard.Footer className="justify-start">
				<Button
					size="sm"
					variant="outline"
					disabled={preference.mode === "classic"}
					onClick={() =>
						setMessage(t(restoreClassic() ? "pages.palette.restored" : "pages.palette.sessionOnly"))
					}
				>
					{t("pages.palette.useClassic")}
				</Button>
				<p role="status" className="text-basalt-sm text-muted-foreground">
					{message}
				</p>
			</LayerCard.Footer>
		</LayerCard>
	);
}
