import { HeatmapCalendar } from "@nocoo/basalt/charts/heatmap-calendar";

const YEAR = 2026;

const data = Array.from({ length: 365 }, (_, day) => {
	const date = new Date(YEAR, 0, 1 + day);
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const dateNum = String(date.getDate()).padStart(2, "0");
	const weekend = date.getDay() === 0 || date.getDay() === 6;
	const wave = 4 + 5 * Math.sin(day / 16);
	const value = weekend ? 0 : Math.max(1, Math.round(wave + (day % 9) / 3));
	return { date: `${YEAR}-${month}-${dateNum}`, value };
});

export default function HeatmapCalendarDefault() {
	return <HeatmapCalendar data={data} year={YEAR} />;
}
