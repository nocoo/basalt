import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { useId } from "react";

const STATUS_MESSAGES = {
	pending: "Saving…",
	success: "Saved locally.",
	error: "The demo request failed. Your input is preserved.",
} as const;

export function DemoFeedback({
	status,
	failNext,
	setFailNext,
	retry,
}: {
	status: "idle" | "pending" | "success" | "error";
	failNext: boolean;
	setFailNext: (value: boolean) => void;
	retry: () => void;
}) {
	const id = useId();
	return (
		<div className="space-y-basalt-space-lg text-basalt-sm" data-demo-feedback>
			<div className="flex items-center gap-basalt-space-lg">
				<Checkbox
					id={id}
					checked={failNext}
					disabled={status === "pending"}
					onCheckedChange={(value) => setFailNext(value === true)}
				/>
				<label htmlFor={id}>Simulate a failed submission</label>
			</div>
			{status !== "idle" && (
				<div
					role={status === "error" ? "alert" : "status"}
					className={
						status === "error" ? "text-basalt-danger-solid" : "text-basalt-muted-foreground"
					}
				>
					{STATUS_MESSAGES[status]}
					{status === "error" && (
						<Button variant="ghost" size="sm" onClick={retry}>
							Retry
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
