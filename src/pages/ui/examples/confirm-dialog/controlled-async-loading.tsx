import { Button } from "@nocoo/basalt/components/button";
import { ConfirmDialog } from "@nocoo/basalt/components/confirm-dialog";
import { useState } from "react";

export default function ControlledAsyncLoadingExample() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	return (
		<>
			<Button variant="destructive" onClick={() => setOpen(true)}>
				Delete project
			</Button>
			<ConfirmDialog
				open={open}
				loading={loading}
				variant="destructive"
				title="Delete project?"
				description="This cannot be undone."
				confirmLabel="Delete"
				onOpenChange={(next) => {
					if (loading && !next) {
						return;
					}
					setOpen(next);
					if (!next) {
						setLoading(false);
					}
				}}
				onConfirm={() => {
					setLoading(true);
				}}
			/>
		</>
	);
}
