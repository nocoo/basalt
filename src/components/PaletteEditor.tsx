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
import { classicPaletteColors, isHexColor, validPaletteColors } from "@/lib/custom-palette";
import { useSitePalette } from "./SitePaletteProvider";

const MODE_LABELS = {
	classic: "Classic palette",
	custom: "Custom palette",
} as const;

export function PaletteEditor() {
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
					<h3 className="text-basalt-base font-medium">Your own palette</h3>
					<p className="max-w-2xl text-basalt-sm leading-basalt-relaxed text-basalt-muted-foreground">
						Edit the light and dark colors, then save to apply them. Your palette stays in this
						browser across pages and visits. Chart colors stay fixed.
					</p>
				</div>
				<Badge variant="outline">{MODE_LABELS[preference.mode]}</Badge>
			</LayerCard.Header>
			<Collapsible>
				<LayerCard.Header asChild>
					<CollapsibleTrigger className="w-full hover:bg-basalt-hover">
						Customize all 12 colors
					</CollapsibleTrigger>
				</LayerCard.Header>
				<CollapsibleContent unstyled>
					<LayerCard.Body className="border-t border-basalt-border">
						<form
							className="space-y-basalt-layout"
							onSubmit={(event) => {
								event.preventDefault();
								if (valid)
									setMessage(
										apply(draft)
											? "Custom palette saved in this browser."
											: "Applied for this session. Browser storage is unavailable.",
									);
							}}
						>
							<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2 xl:grid-cols-3">
								{ACCENT_SWATCHES.map((swatch) => (
									<fieldset
										key={swatch.id}
										className="min-w-0 space-y-basalt-space-lg rounded-basalt-lg border border-basalt-border p-basalt-card"
									>
										<legend className="px-basalt-space-sm text-basalt-sm font-medium">
											{swatch.label}
										</legend>
										{(["light", "dark"] as const).map((mode) => {
											const modeLabel = mode === "light" ? "Light" : "Dark";
											const color = draft[swatch.id][mode];
											const update = (value: string) => {
												setDraft((current) => ({
													...current,
													[swatch.id]: { ...current[swatch.id], [mode]: value },
												}));
												setMessage("");
											};
											const label = `${swatch.label} · ${modeLabel}`;
											return (
												<div
													key={mode}
													className="grid grid-cols-[2.5rem_2.5rem_minmax(0,1fr)] items-center gap-basalt-space-lg"
												>
													<label
														htmlFor={`${id}-${swatch.id}-${mode}`}
														className="text-basalt-sm text-basalt-muted-foreground"
													>
														{modeLabel}
													</label>
													<input
														type="color"
														aria-label={`${label} color picker`}
														className="size-9 cursor-pointer rounded-basalt-md border border-basalt-border bg-transparent p-basalt-space-sm"
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
								<p
									id={`${id}-error`}
									role="alert"
									className="text-basalt-sm text-basalt-danger-solid"
								>
									Use a six-digit hex color, such as #73c2fb, for every swatch.
								</p>
							)}
							<div className="flex flex-wrap gap-basalt-space-lg">
								<Button type="submit" disabled={!valid}>
									Save custom palette
								</Button>
								<Button
									variant="outline"
									onClick={() => {
										setDraft(classicPaletteColors());
										setMessage("");
									}}
								>
									Reset draft colors
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
						setMessage(
							restoreClassic()
								? "Classic palette restored. Your custom colors are kept in the editor."
								: "Applied for this session. Browser storage is unavailable.",
						)
					}
				>
					Restore classic palette
				</Button>
				<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
					{message}
				</p>
			</LayerCard.Footer>
		</LayerCard>
	);
}
