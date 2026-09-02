import { Sparkline } from "@nocoo/basalt/charts/sparkline";

export default function SparklineDefault() {
	return <Sparkline data={[{ x: "Mon", y: 12 }]} />;
}
