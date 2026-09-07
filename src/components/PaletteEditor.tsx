import { Button } from "@nocoo/basalt/components/button";
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
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-1">
					<h3 className="text-sm font-medium">{t("pages.palette.customTitle")}</h3>
					<p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
						{t("pages.palette.customDescription")}
					</p>
				</div>
				<span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
					{t(`pages.palette.mode.${preference.mode}`)}
				</span>
			</div>
			<details className="mt-4">
				<summary className="w-fit cursor-pointer rounded-md text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-primary">
					{t("pages.palette.editColors")}
				</summary>
				<form
					className="mt-4 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						if (valid)
							setMessage(t(apply(draft) ? "pages.palette.saved" : "pages.palette.sessionOnly"));
					}}
				>
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{ACCENT_SWATCHES.map((swatch) => (
							<fieldset
								key={swatch.id}
								className="min-w-0 space-y-2 rounded-xl border border-border p-3"
							>
								<legend className="px-1 text-xs font-medium">{swatch.label}</legend>
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
											className="grid grid-cols-[2.5rem_2.5rem_minmax(0,1fr)] items-center gap-2"
										>
											<label
												htmlFor={`${id}-${swatch.id}-${mode}`}
												className="text-xs text-muted-foreground"
											>
												{t(`pages.palette.${mode}`)}
											</label>
											<input
												type="color"
												aria-label={`${label} ${t("pages.palette.colorPicker")}`}
												className="size-9 cursor-pointer rounded-md border border-border bg-transparent p-1"
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
												className="min-w-0 font-mono text-xs"
												onChange={(event) => update(event.target.value)}
											/>
										</div>
									);
								})}
							</fieldset>
						))}
					</div>
					{!valid && (
						<p id={`${id}-error`} role="alert" className="text-xs text-destructive">
							{t("pages.palette.invalidColor")}
						</p>
					)}
					<div className="flex flex-wrap gap-2">
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
			</details>
			<div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
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
				<p role="status" className="text-xs text-muted-foreground">
					{message}
				</p>
			</div>
		</LayerCard>
	);
}
