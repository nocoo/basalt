import { Button } from "@nocoo/basalt/components/button";
import { ConfirmDialog, useConfirm } from "@nocoo/basalt/components/confirm-dialog";
import { useState } from "react";

export default function PromiseResultExample() {
	const { confirm, dialogProps } = useConfirm();
	const [result, setResult] = useState("");

	return (
		<>
			<Button
				onClick={async () => {
					const accepted = await confirm({
						title: "Archive report?",
						description: "The report remains available in history.",
					});
					setResult(accepted ? "Confirmed" : "Cancelled");
				}}
			>
				Archive report
			</Button>
			{result ? <p>{result}</p> : null}
			<ConfirmDialog {...dialogProps} />
		</>
	);
}
