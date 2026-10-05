import { Check, Minus, Plus } from "lucide-react";
import { useId } from "react";
import type { DiffTableColumn, DiffTableRow } from "../models/diff-table";
import { cn } from "../utils/cn";
import { useDiffTableViewModel } from "../viewmodels/use-diff-table";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import { LayerCard } from "./layer-card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

export type { DiffTableColumn, DiffTableRow } from "../models/diff-table";

export interface DiffTableProps {
	/** Stable columns and text/number cells. */
	columns: readonly DiffTableColumn[];
	/** Proposed rows; remount with a new key for a different proposal. */
	rows: readonly DiffTableRow[];
	/** Heading and accessible table name. @default "Proposed changes" */
	title?: string;
	/** Explicitly apply only selected changes; rejection keeps the selection for retry. */
	onApply: (changes: readonly DiffTableRow[]) => void | Promise<void>;
	disabled?: boolean;
	className?: string;
}

export function DiffTable({
	title = "Proposed changes",
	columns,
	className,
	...props
}: DiffTableProps) {
	const vm = useDiffTableViewModel(props);
	const id = useId();
	return (
		<LayerCard
			padding="none"
			aria-labelledby={id}
			className={cn("min-w-0 overflow-hidden", className)}
		>
			<header className="flex flex-wrap items-center justify-between gap-basalt-2 border-b border-basalt-border px-basalt-card-sm py-basalt-2">
				<h3 id={id} className="text-[13px] font-medium">
					{title}
				</h3>
				<span className="text-xs text-basalt-muted-foreground">Select changes to apply</span>
			</header>
			<div
				role="region"
				aria-label={`${title} scroll area`}
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow region supports keyboard scrolling.
				tabIndex={0}
				className="overflow-x-auto outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-basalt-ring"
			>
				<Table aria-label={title} aria-busy={vm.status === "applying" || undefined}>
					<TableHeader>
						<TableRow>
							<TableHead scope="col">Change</TableHead>
							{columns.map((column) => (
								<TableHead key={column.id} scope="col" style={{ minWidth: column.width }}>
									{column.label}
								</TableHead>
							))}
							<TableHead scope="col">
								<span className="sr-only">Include change</span>
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{props.rows.map((row) => {
							const included = row.change !== "unchanged" && !vm.excluded.includes(row.id);
							return (
								<TableRow
									key={row.id}
									data-diff-change={row.change}
									data-included={included}
									aria-selected={row.change !== "unchanged" ? included : undefined}
									className={cn(
										"basalt-agent-reveal",
										row.change !== "unchanged" && !vm.blocked && "cursor-pointer",
									)}
									onClick={(event) => {
										if (event.target instanceof Element && event.target.closest("button, a, input"))
											return;
										vm.toggle(row.id);
									}}
								>
									<TableCell className="whitespace-nowrap text-xs">
										<span className="inline-flex items-center gap-basalt-1">
											{row.change === "add" ? (
												<Plus aria-hidden="true" className="size-basalt-icon-sm" />
											) : row.change === "remove" ? (
												<Minus aria-hidden="true" className="size-basalt-icon-sm" />
											) : null}
											{row.change === "unchanged"
												? "Keep"
												: row.change === "add"
													? "Add"
													: "Remove"}
										</span>
									</TableCell>
									{columns.map((column) => (
										<TableCell
											key={column.id}
											className={cn(
												"whitespace-nowrap",
												included && row.change === "remove" && "line-through",
											)}
											style={{ minWidth: column.width }}
										>
											{row.values[column.id] ?? "—"}
										</TableCell>
									))}
									<TableCell>
										{row.change !== "unchanged" && (
											<Checkbox
												disabled={vm.blocked}
												checked={included}
												aria-label={`Include ${row.change === "add" ? "addition" : "removal"} ${row.label}`}
												onCheckedChange={() => vm.toggle(row.id)}
											/>
										)}
									</TableCell>
								</TableRow>
							);
						})}
						{props.rows.length === 0 && (
							<TableRow>
								<TableCell colSpan={columns.length + 2}>
									<p role="status" className="text-basalt-muted-foreground">
										No proposed changes
									</p>
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			{vm.error && (
				<p role="alert" className="px-basalt-card-sm py-basalt-2 text-xs text-basalt-danger">
					{vm.error}
				</p>
			)}
			<footer className="flex flex-wrap items-center justify-between gap-basalt-2 border-t border-basalt-border p-basalt-card-sm">
				{vm.status === "applied" ? (
					<p role="status" className="inline-flex items-center gap-basalt-1_5 text-sm">
						<Check aria-hidden="true" className="size-basalt-icon" />
						{vm.selected.length} changes applied
					</p>
				) : (
					<>
						<span className="text-xs tabular-nums text-basalt-muted-foreground">
							{vm.removals} removals · {vm.additions} additions
						</span>
						<Button
							size="sm"
							loading={vm.status === "applying"}
							disabled={vm.blocked || vm.selected.length === 0}
							onClick={() => void vm.apply()}
						>
							Apply {vm.selected.length} changes
						</Button>
					</>
				)}
			</footer>
		</LayerCard>
	);
}
