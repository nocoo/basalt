import { Button } from "@nocoo/basalt/components/button";
import { Empty } from "@nocoo/basalt/components/empty";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

declare global {
	interface Window {
		emptyAudit?: {
			mounted: boolean;
		};
	}
}

export function EmptyApp() {
	const [emptyActionCount, setEmptyActionCount] = useState(0);
	const [emptyChildCount, setEmptyChildCount] = useState(0);

	const [cardActionCount, setCardActionCount] = useState(0);
	const [cardChildCount, setCardChildCount] = useState(0);

	useEffect(() => {
		window.emptyAudit = { mounted: true };
	}, []);

	return (
		<div style={{ padding: 40, display: "flex", flexDirection: "column", gap: 32 }}>
			<div id="standalone-empty-section">
				<Empty
					id="custom-empty-id"
					data-testid="standalone-empty"
					aria-label="Empty Workspace"
					title="No documents"
					description="There are currently zero files."
					action={
						<Button
							type="button"
							id="empty-action-btn"
							onClick={() => setEmptyActionCount((c) => c + 1)}
						>
							Create document
						</Button>
					}
				>
					<div id="empty-children-container">
						<span id="empty-numeric-zero">0</span>
						<Button
							type="button"
							id="empty-child-btn"
							variant="outline"
							size="sm"
							onClick={() => setEmptyChildCount((c) => c + 1)}
						>
							Inspect status
						</Button>
					</div>
				</Empty>
				<div id="empty-feedback-action">action-clicks:{emptyActionCount}</div>
				<div id="empty-feedback-child">child-clicks:{emptyChildCount}</div>
			</div>

			<div id="card-empty-section" style={{ maxWidth: 400 }}>
				<LayerCard id="custom-card-id" data-testid="layer-card-root">
					<LayerCard.Empty
						id="custom-card-empty-id"
						data-testid="card-empty"
						aria-label="Empty Card Activity"
						title="No activity recorded"
						description="Incoming events will be listed here."
						action={
							<Button
								type="button"
								id="card-action-btn"
								onClick={() => setCardActionCount((c) => c + 1)}
							>
								Refresh stream
							</Button>
						}
					>
						<div id="card-children-container">
							<span id="card-numeric-zero">0</span>
							<Button
								type="button"
								id="card-child-btn"
								variant="outline"
								size="sm"
								onClick={() => setCardChildCount((c) => c + 1)}
							>
								View diagnostics
							</Button>
						</div>
					</LayerCard.Empty>
				</LayerCard>
				<div id="card-feedback-action">card-action-clicks:{cardActionCount}</div>
				<div id="card-feedback-child">card-child-clicks:{cardChildCount}</div>
			</div>

			{/* Bare numeric zero children and action regression tests */}
			<div id="bare-zero-section">
				<Empty id="bare-empty-zero" title="Empty with zero" action={0}>
					{0}
				</Empty>
				<LayerCard>
					<LayerCard.Empty id="bare-card-zero" title="Card with zero" action={0}>
						{0}
					</LayerCard.Empty>
				</LayerCard>
			</div>
		</div>
	);
}

const root = document.getElementById("empty-root");
if (!root) {
	throw new Error("empty-root element missing");
}

createRoot(root).render(<EmptyApp />);
