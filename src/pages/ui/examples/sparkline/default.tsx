import { Sparkline } from "@nocoo/basalt/charts/sparkline";

const data = Array.from({ length: 24 }, (_, hour) => ({
	x: String(hour),
	y: 12 + Math.round(8 * Math.sin(hour / 3) + 3 * Math.cos(hour / 5)),
}));

export default function SparklineDefault() {
	return <Sparkline data={data} />;
}
