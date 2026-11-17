import { useAccent } from "@nocoo/basalt/providers/accent";
import { useEffect, useRef, useState } from "react";
import {
	computeStudioScopedVars,
	DEFAULT_STUDIO_STATE,
	decodeStudioPreset,
	encodeStudioPreset,
	generateThemeCssDiff,
	matchingPresetId,
	STUDIO_PRESETS,
	type StudioAccent,
	type StudioMode,
	type StudioPresetId,
	type StudioPresetState,
	type ThemeStudioOptions,
} from "@/models/theme-studio";

type StageTab = "preview" | "code";
type CopyStatus = "idle" | "css" | "link" | "error";
type CopyResult = { target: "css" | "link"; value: string; failed: boolean } | null;

function currentMode(): StudioMode {
	return typeof document !== "undefined" && document.documentElement.classList.contains("dark")
		? "dark"
		: "light";
}

function presetUrl(options: StudioPresetState, includeDefault: boolean): string {
	if (typeof window === "undefined") return "";
	const url = new URL(window.location.href);
	const preset = encodeStudioPreset(options);
	if (!includeDefault && preset === encodeStudioPreset(DEFAULT_STUDIO_STATE))
		url.searchParams.delete("preset");
	else url.searchParams.set("preset", preset);
	return url.toString();
}

export function useThemeStudioViewModel() {
	const { accent, setAccent, swatches } = useAccent();
	const [initial] = useState(() => {
		const preset =
			typeof window === "undefined"
				? null
				: new URLSearchParams(window.location.search).get("preset");
		return {
			hasPreset: preset !== null,
			options:
				preset === null
					? {
							...DEFAULT_STUDIO_STATE,
							accent: accent as StudioAccent,
						}
					: decodeStudioPreset(preset),
		};
	});
	const [options, setOptions] = useState(initial.options);
	const [preserveDefaultPreset, setPreserveDefaultPreset] = useState(initial.hasPreset);
	const pendingAccent = useRef<StudioAccent | null>(
		initial.hasPreset ? initial.options.accent : null,
	);
	const [mode, setMode] = useState(currentMode);
	const [stageTab, setStageTab] = useState<StageTab>("preview");
	const [copyResult, setCopyResult] = useState<CopyResult>(null);

	useEffect(() => {
		if (pendingAccent.current) {
			if (accent !== pendingAccent.current) {
				setAccent(pendingAccent.current);
				return;
			}
			pendingAccent.current = null;
		}
		setOptions((current) =>
			current.accent === accent ? current : { ...current, accent: accent as StudioAccent },
		);
	}, [accent, setAccent]);
	useEffect(() => {
		const root = document.documentElement;
		const observer = new MutationObserver(() => setMode(currentMode()));
		observer.observe(root, { attributes: true, attributeFilter: ["class", "data-mode"] });
		return () => observer.disconnect();
	}, []);
	const shareUrl = presetUrl(options, true);
	const historyUrl = presetUrl(options, preserveDefaultPreset);
	useEffect(() => {
		if (historyUrl && historyUrl !== window.location.href) {
			try {
				window.history.replaceState(window.history.state, "", historyUrl);
			} catch {
				return;
			}
		}
	}, [historyUrl]);

	function applyPreset(id: StudioPresetId) {
		const preset = STUDIO_PRESETS.find((item) => item.id === id);
		if (!preset) return;
		setOptions({ ...preset.options });
		setAccent(preset.options.accent);
		setCopyResult(null);
	}
	function updateOption<Key extends keyof ThemeStudioOptions>(
		key: Key,
		value: ThemeStudioOptions[Key],
	) {
		setOptions((current) => ({ ...current, [key]: value }));
		setCopyResult(null);
	}
	async function copy(
		text: string,
		success: "css" | "link",
		write = (value: string) => navigator.clipboard.writeText(value),
	) {
		try {
			await write(text);
			setCopyResult({ target: success, value: text, failed: false });
		} catch {
			setCopyResult({ target: success, value: text, failed: true });
		}
	}
	const cssDiff = generateThemeCssDiff(options, swatches);
	const copyStatus: CopyStatus =
		!copyResult || copyResult.value !== (copyResult.target === "css" ? cssDiff : shareUrl)
			? "idle"
			: copyResult.failed
				? "error"
				: copyResult.target;
	return {
		options,
		mode,
		stageTab,
		setStageTab,
		copyStatus,
		shareUrl,
		cssDiff,
		scopedVars: computeStudioScopedVars(options, mode, swatches),
		presetId: matchingPresetId(options),
		applyPreset,
		updateOption,
		reset: () => {
			setPreserveDefaultPreset(false);
			applyPreset("default");
		},
		copyCssDiff: (write?: (text: string) => Promise<void>) => copy(cssDiff, "css", write),
		copyShareLink: (write?: (text: string) => Promise<void>) => copy(shareUrl, "link", write),
	};
}
