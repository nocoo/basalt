import { LayerCard } from "@nocoo/basalt/components/layer-card";
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
		<div className="w-full space-y-basalt-space-lg">
			<Table aria-label="Selected row">
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
			<LayerCard padding="none">
				<Table aria-label="Direct card with spanning cells">
					<TableHeader>
						<TableRow>
							<TableHead className="ps-basalt-table-edge">Region</TableHead>
							<TableHead className="pe-basalt-table-edge">Site</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell className="ps-basalt-table-edge" rowSpan={2}>
								North
							</TableCell>
							<TableCell className="pe-basalt-table-edge">Alpha</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="pe-basalt-table-edge">Beta</TableCell>
						</TableRow>
						<TableRow>
							<TableCell className="ps-basalt-table-edge pe-basalt-table-edge" colSpan={2}>
								Nested inset
								<Table aria-label="Nested inset">
									<TableBody>
										<TableRow>
											<TableCell>Child</TableCell>
										</TableRow>
									</TableBody>
								</Table>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</LayerCard>
		</div>
	);
}
