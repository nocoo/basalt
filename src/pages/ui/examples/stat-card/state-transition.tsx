import { BarChart } from "@nocoo/basalt/charts/bar";
import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Button } from "@nocoo/basalt/components/button";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { AlertCircle, Database, Inbox, Plus, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type LoadState = "idle" | "loading" | "error" | "empty" | "success";

const CHART_DATA = [
	{ x: "00:00", y: 420 },
	{ x: "04:00", y: 280 },
	{ x: "08:00", y: 690 },
	{ x: "12:00", y: 950 },
	{ x: "16:00", y: 840 },
	{ x: "20:00", y: 530 },
];

export default function StatCardStateTransition() {
	const [state, setState] = useState<LoadState>("idle");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const clearCurrentTimer = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			timerRef.current = null;
		}
	};

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, []);

	const simulateFetch = (outcome: "success" | "error" | "empty") => {
		clearCurrentTimer();
		setState("loading");
		timerRef.current = setTimeout(() => {
			setState(outcome);
		}, 600);
	};

	return (
		<div className="w-full max-w-xl space-y-basalt-space-lg">
			<div className="flex flex-wrap items-center gap-basalt-space-lg">
				<Button
					size="sm"
					variant="outline"
					disabled={state === "loading"}
					onClick={() => simulateFetch("success")}
				>
					Simulate Success
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={state === "loading"}
					onClick={() => simulateFetch("error")}
				>
					Simulate Error
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={state === "loading"}
					onClick={() => simulateFetch("empty")}
				>
					Simulate Empty
				</Button>
				<Button
					size="sm"
					variant="outline"
					disabled={state === "loading"}
					onClick={() => {
						clearCurrentTimer();
						setState("idle");
					}}
				>
					Reset (Idle)
				</Button>
			</div>

			{/* StatCard with caller-controlled status: when loading, error, or empty, stale value/trend are withdrawn */}
			<StatCard
				title="Vitals sync rate"
				value="840 req/min"
				subtitle={
					state === "error" || state === "empty" ? undefined : "Measured over the last 60 minutes"
				}
				icon={Database}
				trend={
					state === "idle" || state === "success"
						? { value: 12.4, label: "vs baseline" }
						: undefined
				}
				status={
					state === "loading" ? (
						<span className="inline-flex items-center text-basalt-base font-medium text-basalt-muted-foreground">
							Refreshing ingestion telemetry...
						</span>
					) : state === "error" ? (
						<span className="inline-flex items-center gap-basalt-space-md text-basalt-base font-medium text-basalt-destructive">
							<AlertCircle className="h-4 w-4" />
							Wearable sync offline
						</span>
					) : state === "empty" ? (
						<span className="inline-flex items-center gap-basalt-space-md text-basalt-base font-medium text-basalt-muted-foreground">
							<Inbox className="h-4 w-4" />
							No active ingestion events
						</span>
					) : undefined
				}
				action={
					<Button
						size="sm"
						variant="outline"
						className="gap-basalt-space-md text-basalt-sm"
						aria-disabled={state === "loading"}
						aria-label={state === "empty" ? "Configure ingestion" : "Refresh ingestion telemetry"}
						onClick={() => {
							if (state !== "loading") {
								simulateFetch("success");
							}
						}}
					>
						{state === "empty" ? (
							<>
								<Plus className="h-3.5 w-3.5" />
								Configure
							</>
						) : (
							<>
								<RefreshCw className="h-3.5 w-3.5" />
								{state === "error" ? "Retry" : "Refresh"}
							</>
						)}
					</Button>
				}
			/>

			{/* Composite LayerCard container pairing metrics and chart with fixed height */}
			<LayerCard outlined className="overflow-hidden">
				<LayerCard.Header className="flex-col sm:flex-row sm:items-center">
					<div>
						<h3 className="text-basalt-base font-semibold text-basalt-foreground">
							Telemetry Timeline
						</h3>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Hourly request distribution
						</p>
					</div>
					<div className="flex shrink-0 items-center">
						<span className="text-basalt-sm font-medium text-basalt-muted-foreground">
							Status: <strong className="text-basalt-foreground uppercase">{state}</strong>
						</span>
					</div>
				</LayerCard.Header>

				<LayerCard.Body>
					{/* Fixed height container (min-h-[17.5rem]) ensures states never collapse the layout across viewports */}
					<div className="relative flex min-h-[17.5rem] w-full flex-col justify-center">
						{state === "loading" && (
							<LayerCard.Loading label="Fetching latest ingestion telemetry..." />
						)}

						{state === "error" && (
							<div
								role="alert"
								className="flex flex-col items-center justify-center space-y-basalt-space-lg text-center"
							>
								<div className="rounded-basalt-full bg-basalt-destructive/10 p-basalt-space-lg text-basalt-destructive">
									<AlertCircle className="h-6 w-6" />
								</div>
								<div>
									<p className="text-basalt-base font-medium text-basalt-foreground">
										Telemetry Unavailable
									</p>
									<p className="text-basalt-sm text-basalt-muted-foreground">
										Unable to connect to ingestion cluster.
									</p>
								</div>
								<Button
									size="sm"
									variant="outline"
									className="gap-basalt-space-lg"
									onClick={() => simulateFetch("success")}
								>
									<RefreshCw className="h-3.5 w-3.5" />
									Retry Query
								</Button>
							</div>
						)}

						{state === "empty" && (
							<LayerCard.Empty
								title="No Telemetry Data"
								description="No ingestion records logged for this cluster during the selected window."
								icon={<Inbox className="h-6 w-6 text-basalt-muted-foreground" />}
								action={
									<Button
										size="sm"
										variant="outline"
										className="gap-basalt-space-lg"
										onClick={() => simulateFetch("success")}
									>
										<RefreshCw className="h-3.5 w-3.5" />
										Refresh Telemetry
									</Button>
								}
							/>
						)}

						{(state === "idle" || state === "success") && (
							<div className="w-full">
								<BarChart
									data={CHART_DATA}
									showAxes
									ariaLabel="Hourly ingestion telemetry"
									className="h-44 w-full"
									summary="Peak ingestion reached 950 req/min at 12:00. Exploration available via keyboard."
									dataAlternative={
										<p className="text-basalt-sm text-basalt-muted-foreground">
											Telemetry active: average 618 req/min over the last 24 hours.
										</p>
									}
								/>
							</div>
						)}
					</div>
				</LayerCard.Body>
			</LayerCard>
		</div>
	);
}
