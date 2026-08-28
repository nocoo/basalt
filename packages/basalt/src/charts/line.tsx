import { Line, LineChart as RechartsLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SAMPLE } from "./sample";

export function LineChart({ data = SAMPLE }: { data?: typeof SAMPLE }) {
	return (
		<div className="h-36 w-56 text-basalt-primary">
			<ResponsiveContainer>
				<RechartsLine data={data}>
					<XAxis dataKey="x" hide />
					<YAxis hide />
					<Line type="monotone" dataKey="y" stroke="currentColor" dot={false} />
				</RechartsLine>
			</ResponsiveContainer>
		</div>
	);
}
