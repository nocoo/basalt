import { useState } from "react";

export function useLoadingShowcaseViewModel(initialBusy = true) {
	const [busy, setBusy] = useState(initialBusy);
	return {
		busy,
		toggleBusy: () => setBusy((current) => !current),
	};
}
