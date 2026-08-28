import { Bar, BarChart as RechartsBar, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SAMPLE } from "./sample";

export function BarChart({ data = SAMPLE }: { data?: typeof SAMPLE }) {
	return (
		<div className="h-36 w-56 text-basalt-primary">
			<ResponsiveContainer>
				<RechartsBar data={data}>
					<XAxis dataKey="x" hide />
					<YAxis hide />
					<Bar dataKey="y" fill="currentColor" />
				</RechartsBar>
			</ResponsiveContainer>
		</div>
	);
}
