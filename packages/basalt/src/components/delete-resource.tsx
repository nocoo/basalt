import { useState } from "react";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";

export type DeleteResourceProps = {
	name: string;
	onDelete: () => void | Promise<void>;
};

export function DeleteResource({ name, onDelete }: DeleteResourceProps) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	return (
		<ConfirmDialog
			trigger={<Button variant="destructive">Delete {name}</Button>}
			open={open}
			loading={loading}
			variant="destructive"
			title={`Delete ${name}?`}
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
			onConfirm={async () => {
				setLoading(true);
				try {
					await onDelete();
					setOpen(false);
				} catch {
					setOpen(true);
				} finally {
					setLoading(false);
				}
			}}
		/>
	);
}
