import { Button } from "@nocoo/basalt/components/button";
import { Empty } from "@nocoo/basalt/components/empty";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { AlertCircle, FolderPlus, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function EmptyActionStates() {
	// Scenario 1: First-time empty -> Create project feedback
	const [projects, setProjects] = useState<string[]>([]);

	// Scenario 2: Search with no results -> Clear filters to restore results
	const [searchQuery, setSearchQuery] = useState("nonexistent-service");

	// Scenario 3: LayerCard.Empty load error -> Retry with pending -> Success
	const [loadStatus, setLoadStatus] = useState<"error" | "pending" | "success">("error");
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
			}
		};
	}, []);

	const handleCreateProject = () => {
		setProjects((prev) => [...prev, `Project ${prev.length + 1}`]);
	};

	const handleResetProjects = () => {
		setProjects([]);
	};

	const handleClearSearch = () => {
		setSearchQuery("");
	};

	const handleSimulateSearch = () => {
		setSearchQuery("nonexistent-service");
	};

	const handleRetryLoad = () => {
		setLoadStatus("pending");
		timerRef.current = setTimeout(() => {
			setLoadStatus("success");
		}, 300);
	};

	const handleSimulateError = () => {
		setLoadStatus("error");
	};

	return (
		<div className="flex w-full flex-col gap-6">
			{/* Section 1: First-time empty state with create action */}
			<section className="flex flex-col gap-3 rounded-basalt-md border border-basalt-border p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-sm font-semibold text-basalt-foreground">Project Workspace</h3>
					{projects.length > 0 ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleResetProjects}
							className="text-xs"
						>
							Reset demo
						</Button>
					) : null}
				</div>
				<div aria-live="polite">
					{projects.length === 0 ? (
						<Empty
							icon={<FolderPlus />}
							title="No projects yet"
							description="Create your first workspace project to start tracking deliveries."
							action={
								<Button type="button" variant="default" size="sm" onClick={handleCreateProject}>
									Create project
								</Button>
							}
						>
							Get started with zero configuration.
						</Empty>
					) : (
						<div className="flex flex-col gap-2">
							<p className="text-xs font-medium text-basalt-foreground">
								Active Projects ({projects.length}):
							</p>
							<ul className="flex flex-col gap-1">
								{projects.map((p) => (
									<li
										key={p}
										className="rounded-basalt-sm bg-basalt-muted px-2 py-1 text-xs text-basalt-foreground"
									>
										{p}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>

			{/* Section 2: Filter/Search empty state with clear action */}
			<section className="flex flex-col gap-3 rounded-basalt-md border border-basalt-border p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-sm font-semibold text-basalt-foreground">Service Catalog Search</h3>
					{!searchQuery ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleSimulateSearch}
							className="text-xs"
						>
							Filter &quot;nonexistent&quot;
						</Button>
					) : null}
				</div>
				<div aria-live="polite">
					{searchQuery ? (
						<Empty
							icon={<Search />}
							title="No matching services"
							description={`No entries matched query "${searchQuery}".`}
							action={
								<Button type="button" variant="outline" size="sm" onClick={handleClearSearch}>
									Clear filters
								</Button>
							}
						>
							Try adjusting keywords or removing search constraints.
						</Empty>
					) : (
						<div className="flex flex-col gap-2">
							<p className="text-xs font-medium text-basalt-foreground">All Services (3):</p>
							<ul className="flex flex-col gap-1">
								{["Authentication API", "Billing Webhook", "Search Indexer"].map((service) => (
									<li
										key={service}
										className="rounded-basalt-sm bg-basalt-muted px-2 py-1 text-xs text-basalt-foreground"
									>
										{service}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</section>

			{/* Section 3: LayerCard.Empty error recovery state with retry action */}
			<section className="flex flex-col gap-3">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<h3 className="text-sm font-semibold text-basalt-foreground">Activity stream</h3>
					{loadStatus === "success" ? (
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={handleSimulateError}
							className="text-xs"
						>
							Simulate error
						</Button>
					) : null}
				</div>
				<LayerCard aria-live="polite">
					{loadStatus === "error" ? (
						<LayerCard.Empty
							icon={<AlertCircle />}
							title="Failed to load activity"
							description="A network timeout occurred while fetching remote event stream."
							action={
								<Button type="button" variant="default" size="sm" onClick={handleRetryLoad}>
									Retry loading
								</Button>
							}
						>
							Check your gateway connection or click to retry.
						</LayerCard.Empty>
					) : loadStatus === "pending" ? (
						<LayerCard.Loading label="Retrying remote stream..." />
					) : (
						<LayerCard.Body className="space-y-2">
							<div className="flex items-center justify-between text-xs font-medium text-basalt-foreground">
								<span>Connected to live stream</span>
								<span className="text-basalt-muted-foreground">3 events</span>
							</div>
							<p className="text-xs text-basalt-muted-foreground">
								All remote records synchronized successfully.
							</p>
						</LayerCard.Body>
					)}
				</LayerCard>
			</section>
		</div>
	);
}
