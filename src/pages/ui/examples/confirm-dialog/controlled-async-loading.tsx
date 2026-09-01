import { Button } from "@nocoo/basalt/components/button";
import { ConfirmDialog } from "@nocoo/basalt/components/confirm-dialog";
import { useEffect, useRef, useState } from "react";

export default function ControlledAsyncLoadingExample() {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const mountedRef = useRef(true);
	const timerRef = useRef<number | null>(null);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
			if (timerRef.current !== null) {
				window.clearTimeout(timerRef.current);
			}
		};
	}, []);

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
				onConfirm={async () => {
					setLoading(true);
					try {
						await new Promise<void>((resolve) => {
							timerRef.current = window.setTimeout(resolve, 400);
						});
						if (mountedRef.current) {
							setOpen(false);
						}
					} finally {
						timerRef.current = null;
						if (mountedRef.current) {
							setLoading(false);
						}
					}
				}}
			/>
		</>
	);
}
