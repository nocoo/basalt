import { ConfirmDialog, useConfirm } from "@nocoo/basalt/components/confirm-dialog";
import { useState } from "react";

declare global {
	interface Window {
		renderConfirm?: (kind?: "confirm") => void;
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
	const [shown, setShown] = useState(true);

	window.renderConfirm = () => {
		window.confirmProof = { results: [], attempts: 0, deleted: false };
		setShown(true);
	};

	window.unmountConfirm = () => {
		setShown(false);
	};

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
