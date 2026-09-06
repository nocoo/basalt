import {
	type ComponentProps,
	type FocusEvent,
	forwardRef,
	type KeyboardEvent,
	type ReactNode,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/tooltip";
import { cn } from "../utils/cn";
import { heatmapColorScales } from "./heatmap-calendar";

export type HeatmapMatrixValue = number | null | undefined;

export interface HeatmapMatrixCellContext {
	rowIndex: number;
	colIndex: number;
	rowLabel: string;
	columnLabel: string;
	value: HeatmapMatrixValue;
	formattedValue: string;
	isMissing: boolean;
	colorIndex: number;
}

export interface HeatmapMatrixProps extends Omit<ComponentProps<"div">, "children"> {
	/**
	 * Ordered row labels (e.g. weekdays ["Mon", "Tue", ...], service tiers, or regions).
	 */
	rowLabels: readonly string[];
	/**
	 * Ordered column labels (e.g. 24 hours ["00:00", ...], days, or status buckets).
	 */
	columnLabels: readonly string[];
	/**
	 * 2D matrix of values indexed by [rowIndex][colIndex].
	 * Supports ragged rows, null, undefined, and non-finite values (treated as missing).
	 * Numeric `0` is a valid reading and distinct from missing data.
	 */
	values: readonly (readonly HeatmapMatrixValue[])[];
	/**
	 * Explicit [min, max] domain for color intensity scaling.
	 * If reversed [max, min], bounds are automatically normalized to [min, max].
	 * If equal [v, v], values <= v receive level 0 while values > v clamp to the highest level.
	 * If non-finite or omitted, dynamically derived solely from visible finite numeric cells in the dataset (or [0, 0] if no finite values exist).
	 * Values at or below min receive level 0; values >= max clamp to the highest level.
	 */
	domain?: readonly [min: number, max: number];
	/**
	 * Sequential color palette array from lowest to highest intensity.
	 * If empty or single-color, gracefully resolves to base level.
	 * @default heatmapColorScales.green
	 */
	colorScale?: readonly string[];
	/**
	 * Formatter for numeric values displayed in tooltips and accessible labels.
	 * Defaults to `value.toLocaleString()`.
	 */
	valueFormatter?: (value: number) => string;
	/**
	 * Placeholder string used for missing/null/undefined readings.
	 * @default "—"
	 */
	missingLabel?: string;
	/**
	 * Accessible label describing the matrix purpose or metric name.
	 * @default "Heatmap matrix"
	 */
	metricLabel?: string;
	/**
	 * Accessible name for the entire grid region.
	 * @default "Heatmap matrix"
	 */
	ariaLabel?: string;
	/**
	 * Pixel height (and default width) of each matrix data cell.
	 * @default 16
	 */
	cellSize?: number;
	/**
	 * Pixel width of each matrix column / data cell.
	 * When omitted, falls back to `cellSize` for square cells.
	 * Allows wider rectangular cells to fit readable column headers (e.g. timestamps or service names).
	 */
	columnWidth?: number;
	/**
	 * Pixel gap between adjacent cells.
	 * @default 2
	 */
	cellGap?: number;
	/**
	 * Text for lowest bound legend.
	 * @default "Less"
	 */
	lessLabel?: string;
	/**
	 * Text for highest bound legend.
	 * @default "More"
	 */
	moreLabel?: string;
	/**
	 * Whether to show the bottom intensity scale legend.
	 * @default true
	 */
	showLegend?: boolean;
	/**
	 * Custom cell tooltip content renderer.
	 * If provided, replaces the default tooltip contents.
	 */
	renderTooltip?: (cell: HeatmapMatrixCellContext) => ReactNode;
}

function resolveColorIndex(
	value: HeatmapMatrixValue,
	min: number,
	max: number,
	colorScaleLength: number,
): number {
	if (value == null || typeof value !== "number" || !Number.isFinite(value)) {
		return -1; // missing indicator
	}
	if (colorScaleLength <= 1) {
		return 0;
	}
	const levels = colorScaleLength - 1;
	if (max <= min) {
		return value > min ? levels : 0;
	}
	const clamped = Math.max(min, Math.min(max, value));
	const normalized = (clamped - min) / (max - min);
	if (normalized <= 0) {
		return 0;
	}
	return Math.min(levels, Math.ceil(normalized * levels));
}

export const HeatmapMatrix = forwardRef<HTMLDivElement, HeatmapMatrixProps>(function HeatmapMatrix(
	{
		rowLabels,
		columnLabels,
		values,
		domain,
		colorScale = heatmapColorScales.green,
		valueFormatter = (val) => val.toLocaleString(),
		missingLabel = "—",
		metricLabel = "Heatmap matrix",
		ariaLabel = "Heatmap matrix",
		cellSize = 16,
		columnWidth,
		cellGap = 2,
		lessLabel = "Less",
		moreLabel = "More",
		showLegend = true,
		renderTooltip,
		className,
		style,
		onFocus,
		onBlur,
		onKeyDown,
		...rest
	},
	ref,
) {
	const matrixId = useId();
	const numRows = rowLabels.length;
	const numCols = columnLabels.length;
	const effectiveColWidth = columnWidth ?? cellSize;

	// Derive domain restricted to visible row/col matrix bounds
	const [minVal, maxVal] = useMemo(() => {
		if (domain) {
			const [d0, d1] = domain;
			if (Number.isFinite(d0) && Number.isFinite(d1)) {
				return [Math.min(d0, d1), Math.max(d0, d1)];
			}
		}
		let lowest = Number.POSITIVE_INFINITY;
		let highest = Number.NEGATIVE_INFINITY;
		for (let r = 0; r < numRows; r++) {
			const row = values[r];
			if (!row) continue;
			for (let c = 0; c < numCols; c++) {
				const v = row[c];
				if (typeof v === "number" && Number.isFinite(v)) {
					if (v < lowest) lowest = v;
					if (v > highest) highest = v;
				}
			}
		}
		if (!Number.isFinite(lowest) || !Number.isFinite(highest)) {
			return [0, 0];
		}
		return [lowest, highest];
	}, [domain, values, numRows, numCols]);

	// Focus state: active cell position [rowIndex, colIndex]
	const [activePos, setActivePos] = useState<[number, number]>([0, 0]);
	const [openTooltipPos, setOpenTooltipPos] = useState<string | null>(null);
	const dismissedByEscapeRef = useRef(false);

	const activePosRef = useRef<[number, number]>([0, 0]);
	activePosRef.current = activePos;

	const containerRef = useRef<HTMLDivElement | null>(null);
	const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
	const isFocusedInsideRef = useRef(false);

	// Clamp active position when dimensions change
	useEffect(() => {
		const hadFocus = isFocusedInsideRef.current;
		if (numRows === 0 || numCols === 0) {
			setActivePos(([curR, curC]) => {
				if (curR === 0 && curC === 0) return [curR, curC];
				return [0, 0];
			});
			setOpenTooltipPos(null);
			if (hadFocus) {
				containerRef.current?.focus();
			}
			return;
		}

		const [curR, curC] = activePosRef.current;
		const nextR = Math.min(numRows - 1, Math.max(0, curR));
		const nextC = Math.min(numCols - 1, Math.max(0, curC));

		setActivePos((prev) => {
			if (prev[0] === nextR && prev[1] === nextC) {
				return prev;
			}
			return [nextR, nextC];
		});

		if (hadFocus) {
			const key = `${nextR}-${nextC}`;
			const target = cellRefs.current.get(key);
			if (target && document.activeElement !== target) {
				target.focus();
			}
		}
	}, [numRows, numCols]);

	const handleContainerKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape") {
			dismissedByEscapeRef.current = true;
			setOpenTooltipPos(null);
		}

		// Call caller onKeyDown first so caller can inspect or preventDefault
		onKeyDown?.(e);
		if (e.defaultPrevented) {
			return;
		}

		if (numRows === 0 || numCols === 0) return;
		if (e.key === "Escape") return;

		const [currentRow, currentCol] = activePosRef.current;
		let nextR = currentRow;
		let nextC = currentCol;

		if (e.key === "ArrowRight") {
			nextC = Math.min(numCols - 1, currentCol + 1);
		} else if (e.key === "ArrowLeft") {
			nextC = Math.max(0, currentCol - 1);
		} else if (e.key === "ArrowDown") {
			nextR = Math.min(numRows - 1, currentRow + 1);
		} else if (e.key === "ArrowUp") {
			nextR = Math.max(0, currentRow - 1);
		} else if (e.key === "Home") {
			nextC = 0;
		} else if (e.key === "End") {
			nextC = numCols - 1;
		} else if (e.key === "PageUp") {
			nextR = 0;
		} else if (e.key === "PageDown") {
			nextR = numRows - 1;
		} else {
			return;
		}

		e.preventDefault();
		dismissedByEscapeRef.current = false;
		setActivePos([nextR, nextC]);
		const nextKey = `${nextR}-${nextC}`;
		setOpenTooltipPos(nextKey);
		const targetButton = cellRefs.current.get(nextKey);
		if (targetButton) {
			targetButton.focus();
			const scrollContainer = targetButton.closest<HTMLElement>(
				'[role="region"][aria-label$="scrollable table"]',
			);
			const rowHeader = targetButton.closest("tr")?.querySelector<HTMLElement>('th[scope="row"]');

			if (scrollContainer) {
				const containerRect = scrollContainer.getBoundingClientRect();
				const btnRect = targetButton.getBoundingClientRect();
				const stickyWidth = rowHeader ? rowHeader.getBoundingClientRect().width : 0;

				const visibleLeft = containerRect.left + stickyWidth;
				const visibleRight = containerRect.right;

				if (btnRect.left < visibleLeft) {
					scrollContainer.scrollLeft -= visibleLeft - btnRect.left + cellGap;
				} else if (btnRect.right > visibleRight) {
					scrollContainer.scrollLeft += btnRect.right - visibleRight + cellGap;
				}
			} else if (typeof targetButton.scrollIntoView === "function") {
				targetButton.scrollIntoView({ block: "nearest", inline: "nearest" });
			}
		}
	};

	const handleContainerFocus = (e: FocusEvent<HTMLDivElement>) => {
		isFocusedInsideRef.current = true;
		onFocus?.(e);
	};

	const handleContainerBlur = (e: FocusEvent<HTMLDivElement>) => {
		if (!e.currentTarget.contains(e.relatedTarget)) {
			isFocusedInsideRef.current = false;
			dismissedByEscapeRef.current = false;
		}
		onBlur?.(e);
	};

	const callerCleanupRef = useRef<(() => void) | undefined>(undefined);

	const setRootRef = useCallback(
		(node: HTMLDivElement | null) => {
			containerRef.current = node;

			if (callerCleanupRef.current) {
				callerCleanupRef.current();
				callerCleanupRef.current = undefined;
			}

			if (typeof ref === "function") {
				const cleanup = ref(node);
				if (typeof cleanup === "function") {
					callerCleanupRef.current = cleanup;
				}
			} else if (ref) {
				ref.current = node;
			}

			return () => {
				containerRef.current = null;
				if (callerCleanupRef.current) {
					callerCleanupRef.current();
					callerCleanupRef.current = undefined;
				} else if (typeof ref === "function") {
					ref(null);
				} else if (ref) {
					ref.current = null;
				}
			};
		},
		[ref],
	);

	const isEmpty = numRows === 0 || numCols === 0;

	return (
		<TooltipProvider>
			<div
				ref={setRootRef}
				tabIndex={isEmpty ? -1 : undefined}
				role="region"
				aria-label={ariaLabel}
				data-testid="heatmap-matrix"
				className={cn(
					"flex flex-col gap-2 rounded-lg border border-basalt-border/60 bg-basalt-card p-3 text-xs outline-none",
					isEmpty ? "text-basalt-muted-foreground" : "text-basalt-foreground",
					className,
				)}
				style={style}
				onFocus={handleContainerFocus}
				onBlur={handleContainerBlur}
				onKeyDown={handleContainerKeyDown}
				{...rest}
			>
				{isEmpty ? (
					<span className="italic">{missingLabel}</span>
				) : (
					<>
						{/* Scrollable table container */}
						<div
							tabIndex={-1}
							role="region"
							aria-label={`${ariaLabel} scrollable table`}
							className="w-full overflow-x-auto outline-none"
						>
							<table
								// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: W3C ARIA interactive 2D grid table with descendant roving tab buttons
								role="grid"
								aria-label={ariaLabel}
								className="border-separate"
								style={{ borderSpacing: cellGap }}
							>
								<thead>
									<tr>
										{/* Top-left empty header */}
										<th
											scope="col"
											className="sticky left-0 z-10 bg-basalt-card p-0 text-left font-normal"
											style={{ minWidth: 64 }}
										>
											<span className="sr-only">Row \ Column</span>
										</th>
										{columnLabels.map((col, colIdx) => (
											<th
												key={`${matrixId}-col-${colIdx}`}
												scope="col"
												className="p-0 text-center font-mono text-[10px] text-basalt-muted-foreground select-none"
												style={{
													width: effectiveColWidth,
													maxWidth: effectiveColWidth,
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
												title={col}
											>
												{col}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{rowLabels.map((rowName, rowIdx) => (
										<tr key={`${matrixId}-row-${rowIdx}`}>
											<th
												scope="row"
												className="sticky left-0 z-10 bg-basalt-card pr-2 text-left font-medium text-basalt-foreground select-none"
												style={{
													lineHeight: `${cellSize}px`,
													minWidth: 64,
													whiteSpace: "nowrap",
												}}
											>
												{rowName}
											</th>
											{columnLabels.map((colName, colIdx) => {
												const cellKey = `${rowIdx}-${colIdx}`;
												const rawVal = values[rowIdx]?.[colIdx];
												const isMissing =
													rawVal == null || typeof rawVal !== "number" || !Number.isFinite(rawVal);
												const colorIdx = resolveColorIndex(
													rawVal,
													minVal,
													maxVal,
													colorScale.length,
												);

												const formattedVal = isMissing
													? missingLabel
													: valueFormatter(rawVal as number);

												const cellBg =
													colorIdx < 0
														? "hsl(var(--basalt-muted) / 0.4)"
														: (colorScale[colorIdx] ?? "hsl(var(--basalt-muted))");

												const accessibleCellLabel = `${rowName}, ${colName}: ${formattedVal} (${metricLabel})`;
												const isSelected = activePos[0] === rowIdx && activePos[1] === colIdx;
												const isOpen = openTooltipPos === cellKey;

												const cellContext: HeatmapMatrixCellContext = {
													rowIndex: rowIdx,
													colIndex: colIdx,
													rowLabel: rowName,
													columnLabel: colName,
													value: rawVal,
													formattedValue: formattedVal,
													isMissing,
													colorIndex: colorIdx,
												};

												return (
													// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: ARIA gridcell container wrapping roving interactive button
													// biome-ignore lint/a11y/useFocusableInteractive: Focus is managed on child button via roving tabindex
													<td key={cellKey} role="gridcell" className="p-0 text-center">
														<Tooltip
															open={isOpen}
															onOpenChange={(next) => {
																if (next) {
																	if (!dismissedByEscapeRef.current) {
																		setOpenTooltipPos(cellKey);
																	}
																} else {
																	setOpenTooltipPos((curr) => {
																		if (curr !== cellKey) return curr;
																		if (dismissedByEscapeRef.current) return null;
																		const isCellFocused =
																			document.activeElement === cellRefs.current.get(cellKey);
																		return isCellFocused ? curr : null;
																	});
																}
															}}
														>
															<TooltipTrigger asChild>
																<button
																	ref={(el) => {
																		if (el) cellRefs.current.set(cellKey, el);
																		else cellRefs.current.delete(cellKey);
																	}}
																	type="button"
																	aria-label={accessibleCellLabel}
																	tabIndex={isSelected ? 0 : -1}
																	onFocus={() => {
																		setActivePos([rowIdx, colIdx]);
																		dismissedByEscapeRef.current = false;
																		setOpenTooltipPos(cellKey);
																	}}
																	onBlur={() => {
																		setOpenTooltipPos((curr) => (curr === cellKey ? null : curr));
																	}}
																	className="box-border block cursor-pointer rounded-xs border-0 p-0 transition-colors hover:ring-1 hover:ring-basalt-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-basalt-ring"
																	style={{
																		width: effectiveColWidth,
																		height: cellSize,
																		backgroundColor: cellBg,
																	}}
																/>
															</TooltipTrigger>
															<TooltipContent
																id={`${matrixId}-${cellKey}`}
																onEscapeKeyDown={() => {
																	dismissedByEscapeRef.current = true;
																	setOpenTooltipPos(null);
																}}
															>
																{renderTooltip ? (
																	renderTooltip(cellContext)
																) : (
																	<div className="text-xs">
																		<div className="font-semibold text-basalt-popover-foreground">
																			{rowName} · {colName}
																		</div>
																		<div className="text-basalt-muted-foreground">
																			{metricLabel}:{" "}
																			<span className="font-medium text-basalt-popover-foreground">
																				{formattedVal}
																			</span>
																		</div>
																	</div>
																)}
															</TooltipContent>
														</Tooltip>
													</td>
												);
											})}
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Legend footer */}
						{showLegend ? (
							<div
								className="mt-1 flex items-center justify-end gap-1 text-[11px] text-basalt-muted-foreground select-none"
								aria-hidden="true"
							>
								<span>{lessLabel}</span>
								<div
									className="rounded-xs"
									title="Missing data"
									style={{
										width: cellSize,
										height: cellSize,
										backgroundColor: "hsl(var(--basalt-muted) / 0.4)",
									}}
								/>
								{colorScale.map((color, idx) => (
									<div
										key={`${color}-${idx}`}
										className="rounded-xs"
										style={{
											width: cellSize,
											height: cellSize,
											backgroundColor: color,
										}}
									/>
								))}
								<span>{moreLabel}</span>
							</div>
						) : null}
					</>
				)}
			</div>
		</TooltipProvider>
	);
});

HeatmapMatrix.displayName = "HeatmapMatrix";
