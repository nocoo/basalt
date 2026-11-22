import { Button } from "@nocoo/basalt/components/button";

const STATUS_MESSAGES = {
	pending: "Saving…",
	success: "Saved locally.",
	error: "The demo request failed. Your input is preserved.",
} as const;

export function DemoFeedback({
	status,
	retry,
}: {
	status: "idle" | "pending" | "success" | "error";
	retry: () => void;
}) {
	if (status === "idle") {
		return null;
	}
	return (
		<div
			data-demo-feedback=""
			role={status === "error" ? "alert" : "status"}
			className={
				status === "error"
					? "text-basalt-sm text-basalt-danger-solid"
					: "text-basalt-sm text-basalt-muted-foreground"
			}
		>
			{STATUS_MESSAGES[status]}
			{status === "error" && (
				<Button variant="ghost" size="sm" onClick={retry}>
					Retry
				</Button>
			)}
		</div>
	);
}
