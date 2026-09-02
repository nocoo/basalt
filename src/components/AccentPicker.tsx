import { Button } from "@nocoo/basalt/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { useAccent } from "@nocoo/basalt/providers/accent";
import { useTranslation } from "react-i18next";

export function AccentPicker() {
	const { t } = useTranslation();
	const { accent, setAccent, swatches } = useAccent();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					aria-label={t("common.themePalette")}
				>
					<span
						className="h-3.5 w-3.5 rounded-full ring-1 ring-basalt-border"
						style={{ background: "hsl(var(--basalt-primary))" }}
						aria-hidden="true"
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56 p-2">
				<p className="mb-2 px-1 text-xs text-basalt-muted-foreground">{t("common.themePalette")}</p>
				<div className="grid grid-cols-6 gap-1.5">
					{swatches.map((swatch) => {
						const selected = swatch.id === accent;
						return (
							<button
								key={swatch.id}
								type="button"
								className={`flex h-8 w-8 items-center justify-center rounded-md ${
									selected ? "ring-2 ring-basalt-foreground" : "ring-1 ring-basalt-border"
								}`}
								aria-label={swatch.label}
								aria-pressed={selected}
								onClick={() => setAccent(swatch.id)}
							>
								<span
									className="h-4 w-4 rounded-full"
									style={{ background: `hsl(var(${swatch.token}))` }}
									aria-hidden="true"
								/>
							</button>
						);
					})}
				</div>
			</PopoverContent>
		</Popover>
	);
}
