import { useState } from "react";

export function useAnimationShowcaseViewModel(initialPaused = false) {
	const [paused, setPaused] = useState(initialPaused);
	return {
		paused,
		togglePaused: () => setPaused((current) => !current),
	};
}
