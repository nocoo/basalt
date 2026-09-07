import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { useId } from "react";
import { useTranslation } from "react-i18next";

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
	const { t } = useTranslation();
	const id = useId();
	return (
		<div className="space-y-2 text-xs" data-demo-feedback>
			<div className="flex items-center gap-2">
				<Checkbox
					id={id}
					checked={failNext}
					disabled={status === "pending"}
					onCheckedChange={(value) => setFailNext(value === true)}
				/>
				<label htmlFor={id}>{t("demo.failNext")}</label>
			</div>
			{status !== "idle" && (
				<div
					role={status === "error" ? "alert" : "status"}
					className={status === "error" ? "text-destructive" : "text-muted-foreground"}
				>
					{t(`demo.${status}`)}
					{status === "error" && (
						<Button variant="ghost" size="sm" onClick={retry}>
							{t("demo.retry")}
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
