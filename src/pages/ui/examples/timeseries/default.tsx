import { Timeseries } from "@nocoo/basalt/charts/timeseries";

export default function TimeseriesDefault() {
	return <Timeseries data={[{ x: "Mon", y: 12 }]} />;
}
