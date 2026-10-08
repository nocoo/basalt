import { Sparkline } from "@nocoo/basalt/charts/sparkline";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";

const carePlans = [
	{ name: "Harbor Health", probability: 82, trend: [4, 4, 10, 3, 2, 7, 11, 7, 5, 11, 7, 5, 7, 14] },
	{
		name: "Northstar Care",
		probability: 24,
		trend: [3, 4, 10, 4, 1, 7, 11, 7, 11, 7, 11, 7, 7, 14],
	},
	{
		name: "Fieldwork Clinic",
		probability: 44,
		trend: [3, 4, 10, 5, 2, 7, 11, 7, 11, 7, 11, 7, 7, 14],
	},
	{
		name: "Orbit Wellness",
		probability: 38,
		trend: [4, 4, 10, 3, 2, 4, 7, 4, 11, 4, 11, 7, 4, 14],
	},
];

export default function SparklineDefault() {
	return (
		<div className="min-w-0 max-w-full overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Patient</TableHead>
						<TableHead>Care plan adherence</TableHead>
						<TableHead>Activity trend</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{carePlans.map((account) => (
						<TableRow key={account.name}>
							<TableCell className="whitespace-nowrap font-medium">{account.name}</TableCell>
							<TableCell>
								<Meter
									value={account.probability}
									aria-label={`${account.name} care plan adherence`}
									className="w-36"
								/>
							</TableCell>
							<TableCell>
								<Sparkline
									data={account.trend.map((y, x) => ({ x, y }))}
									ariaLabel={`${account.name} activity trend`}
									summary={
										<span className="sr-only">Daily activity: {account.trend.join(", ")}.</span>
									}
									accessibilityLayer={false}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
