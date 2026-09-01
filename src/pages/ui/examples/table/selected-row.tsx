import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";

export default function TableSelectedRow() {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Name</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				<TableRow variant="selected">
					<TableCell>Selected</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>Idle</TableCell>
				</TableRow>
			</TableBody>
		</Table>
	);
}
