import { HeatmapCalendar } from "@nocoo/basalt/charts/heatmap-calendar";
import { Button } from "@nocoo/basalt/components/button";
import { useState } from "react";

const INITIAL_VALUES = [0, 1, 2, 3, 4, 1, 0, 2, 3, 4, 0, 1, 2, 3];

export default function HeatmapCalendarAccessibleValues() {
	const [values, setValues] = useState<number[]>(INITIAL_VALUES);

	return (
		<div className="w-full max-w-sm space-y-basalt-space-lg">
			<div className="flex flex-wrap items-center gap-basalt-space-lg">
				<Button size="sm" variant="outline" onClick={() => setValues([0, 1])}>
					Shrink to 2
				</Button>
				<Button size="sm" variant="outline" onClick={() => setValues([])}>
					Empty Matrix
				</Button>
				<Button size="sm" variant="outline" onClick={() => setValues(INITIAL_VALUES)}>
					Restore (0–4)
				</Button>
			</div>

			<p className="text-basalt-sm text-basalt-muted-foreground">
				Keyboard navigation: Press{" "}
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">Tab</kbd> to focus the matrix.
				Use <kbd className="rounded-basalt-sm border px-basalt-space-sm">←</kbd>/
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">→</kbd> to step ±1 item, and{" "}
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">↑</kbd>/
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">↓</kbd> to step ±7 items
				(previous/next row in the same column). Use{" "}
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">Home</kbd>/
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">End</kbd> to jump to first/last
				value, and <kbd className="rounded-basalt-sm border px-basalt-space-sm">Escape</kbd> to
				dismiss tooltips. Press{" "}
				<kbd className="rounded-basalt-sm border px-basalt-space-sm">Tab</kbd> once to exit the
				matrix. Full 0–4 scale with visible focus ring on zero values.
			</p>

			<HeatmapCalendar values={values} ariaLabel="Activity matrix across intensity levels" />
		</div>
	);
}
