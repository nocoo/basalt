import { HeaderAction } from "@nocoo/basalt/components/app-header";
import { Popover, PopoverContent, PopoverTrigger } from "@nocoo/basalt/components/popover";
import { useAccent } from "@nocoo/basalt/providers/accent";
import { useTranslation } from "react-i18next";

export function AccentPicker() {
	const { t } = useTranslation();
	const { accent, setAccent, swatches } = useAccent();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<HeaderAction label={t("common.themePalette")}>
					<span
						className="h-3.5 w-3.5 rounded-basalt-full ring-1 ring-basalt-border"
						style={{ background: "hsl(var(--basalt-primary))" }}
						aria-hidden="true"
					/>
				</HeaderAction>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-56 p-basalt-space-lg">
				<p className="mb-basalt-space-lg px-basalt-space-sm text-basalt-sm text-basalt-muted-foreground">
					{t("common.themePalette")}
				</p>
				<div className="grid grid-cols-6 gap-basalt-space-md">
					{swatches.map((swatch) => {
						const selected = swatch.id === accent;
						return (
							<button
								key={swatch.id}
								type="button"
								className={`basalt-focus flex h-8 w-8 items-center justify-center rounded-basalt-md ${
									selected
										? "bg-basalt-selected ring-2 ring-basalt-primary"
										: "ring-1 ring-basalt-border"
								}`}
								aria-label={swatch.label}
								aria-pressed={selected}
								onClick={() => setAccent(swatch.id)}
							>
								<span
									className="h-4 w-4 rounded-basalt-full"
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
