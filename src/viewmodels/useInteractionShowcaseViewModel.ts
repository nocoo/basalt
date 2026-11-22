// ViewModel for the Interaction Showcase page.
// Composes model logic with data source — View consumes this hook only.

import { useCallback, useMemo, useState } from "react";
import { showcaseDialogs, showcaseToasts } from "@/data/mock";
import { ALL_TOAST_TONES, toastToneLabel } from "@/models/interaction-showcase";
import type { ShowcaseDialog, ShowcaseToast } from "@/models/types";

export interface ToastDemo extends ShowcaseToast {
	toneLabel: string;
}

export type DialogDemo = ShowcaseDialog;

export function useInteractionShowcaseViewModel() {
	const [activeDialog, setActiveDialog] = useState<string | null>(null);

	const toasts: ToastDemo[] = useMemo(
		() =>
			showcaseToasts.map((t) => ({
				...t,
				toneLabel: toastToneLabel(t.tone),
			})),
		[],
	);

	const dialogs: DialogDemo[] = useMemo(() => showcaseDialogs, []);

	const toastTones = useMemo(() => ALL_TOAST_TONES, []);

	const toneLabels = useMemo(
		() => ALL_TOAST_TONES.map((v) => ({ tone: v, label: toastToneLabel(v) })),
		[],
	);

	const openDialog = useCallback((id: string) => setActiveDialog(id), []);
	const closeDialog = useCallback(() => setActiveDialog(null), []);

	const getDialogById = useCallback(
		(id: string): DialogDemo | undefined => dialogs.find((d) => d.id === id),
		[dialogs],
	);

	return {
		toasts,
		dialogs,
		toastTones,
		toneLabels,
		activeDialog,
		openDialog,
		closeDialog,
		getDialogById,
	};
}
