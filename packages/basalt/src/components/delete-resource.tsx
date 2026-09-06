import * as React from "react";
import { Button } from "./button";
import { ConfirmDialog } from "./confirm-dialog";

export type DeleteResourceErrorFormatter = (error: unknown) => React.ReactNode;

export type DeleteResourceProps = {
	/** Name of the resource being deleted, interpolated into dialog title and trigger label. */
	name: string;
	/** Called when deletion is confirmed. When this throws or rejects, an error alert is shown and the dialog remains open for retry. */
	onDelete: () => void | Promise<void>;
	/** Custom error message or renderer when onDelete fails. Accepts a ReactNode or an (error: unknown) => ReactNode formatter. Defaults to the caught Error message or 'Failed to delete resource. Please try again.' */
	errorMessage?: React.ReactNode | DeleteResourceErrorFormatter;
};

export function DeleteResource({ name, onDelete, errorMessage }: DeleteResourceProps) {
	const [open, setOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<React.ReactNode | null>(null);

	const resolveErrorMessage = (err: unknown): React.ReactNode => {
		if (typeof errorMessage === "function") {
			return errorMessage(err);
		}
		if (errorMessage != null) {
			return errorMessage;
		}
		if (err instanceof Error && err.message) {
			return err.message;
		}
		return "Failed to delete resource. Please try again.";
	};

	return (
		<ConfirmDialog
			trigger={<Button variant="destructive">Delete {name}</Button>}
			open={open}
			loading={loading}
			variant="destructive"
			title={`Delete ${name}?`}
			description={
				<>
					<span>This cannot be undone.</span>
					{error ? (
						<span role="alert" className="mt-2 block text-xs text-basalt-destructive">
							{error}
						</span>
					) : null}
				</>
			}
			confirmLabel="Delete"
			onOpenChange={(next) => {
				if (loading && !next) {
					return;
				}
				setOpen(next);
				if (!next) {
					setLoading(false);
					setError(null);
				}
			}}
			onConfirm={async () => {
				setLoading(true);
				setError(null);
				try {
					await onDelete();
					setOpen(false);
				} catch (err) {
					setError(resolveErrorMessage(err));
					setOpen(true);
				} finally {
					setLoading(false);
				}
			}}
		/>
	);
}
