import { Area, AreaChart as RechartsArea, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SAMPLE } from "./sample";

export function AreaChart({ data = SAMPLE }: { data?: typeof SAMPLE }) {
	return (
		<div className="h-36 w-56 text-basalt-primary">
			<ResponsiveContainer>
				<RechartsArea data={data}>
					<XAxis dataKey="x" hide />
					<YAxis hide />
					<Area dataKey="y" stroke="currentColor" fill="currentColor" fillOpacity={0.2} />
				</RechartsArea>
			</ResponsiveContainer>
		</div>
	);
}
