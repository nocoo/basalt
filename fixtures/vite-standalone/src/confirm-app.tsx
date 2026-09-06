import { ConfirmDialog, useConfirm } from "@nocoo/basalt/components/confirm-dialog";
import { DeleteResource } from "@nocoo/basalt/components/delete-resource";
import { useState } from "react";

declare global {
	interface Window {
		renderConfirm?: (kind: "confirm" | "delete") => void;
		askOne?: () => void;
		askTwo?: () => void;
		unmountConfirm?: () => void;
		confirmProof?: {
			results: Array<{ name: string; value: boolean }>;
			attempts: number;
			deleted: boolean;
		};
	}
}

function ConfirmHost() {
	const { confirm, dialogProps } = useConfirm();
	window.askOne = () => {
		void confirm({
			title: "First request",
			description: "First description",
		}).then((v) => {
			window.confirmProof?.results.push({ name: "first", value: v });
		});
	};
	window.askTwo = () => {
		void confirm({
			title: "Second request",
			description: "Second description",
		}).then((v) => {
			window.confirmProof?.results.push({ name: "second", value: v });
		});
	};
	return <ConfirmDialog {...dialogProps} />;
}

export function ConfirmApp() {
	const [kind, setKind] = useState<"confirm" | "delete">("confirm");
	const [shown, setShown] = useState(true);

	window.renderConfirm = (k) => {
		window.confirmProof = { results: [], attempts: 0, deleted: false };
		setShown(true);
		setKind(k);
	};

	window.unmountConfirm = () => {
		setShown(false);
	};

	if (kind === "delete") {
		return (
			<div>
				<DeleteResource
					name="record"
					onDelete={async () => {
						if (!window.confirmProof) {
							window.confirmProof = { results: [], attempts: 0, deleted: false };
						}
						window.confirmProof.attempts++;
						if (window.confirmProof.attempts === 1) {
							throw new Error("Local retryable deletion failure");
						}
						window.confirmProof.deleted = true;
					}}
				/>
			</div>
		);
	}

	return (
		<div>
			<button id="opener" type="button" onClick={() => window.askOne?.()}>
				Open request
			</button>
			{shown && <ConfirmHost />}
			<button id="after" type="button">
				After request
			</button>
		</div>
	);
}
