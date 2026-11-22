// Pure business logic for the Interaction Showcase page.
// No React dependency — fully testable with plain unit tests.

import type { ToastTone } from "@/models/types";

export function toastToneLabel(tone: ToastTone): string {
	const labels: Record<ToastTone, string> = {
		neutral: "Neutral",
		success: "Success",
		danger: "Danger",
		warning: "Warning",
		info: "Info",
	};
	return labels[tone];
}

export const ALL_TOAST_TONES: ToastTone[] = ["neutral", "success", "danger", "warning", "info"];
