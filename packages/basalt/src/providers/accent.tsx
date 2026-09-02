import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";

export type AccentSwatch = {
	id: string;
	label: string;
	light: string;
	dark: string;
	foreground: string;
};

export const ACCENT_SWATCHES: readonly AccentSwatch[] = [
	{ id: "blue", label: "Blue", light: "217 91% 42%", dark: "217 91% 62%", foreground: "0 0% 100%" },
	{ id: "teal", label: "Teal", light: "186 80% 32%", dark: "186 80% 48%", foreground: "0 0% 100%" },
	{
		id: "green",
		label: "Green",
		light: "142 71% 32%",
		dark: "142 71% 48%",
		foreground: "0 0% 100%",
	},
	{ id: "amber", label: "Amber", light: "38 90% 38%", dark: "38 90% 52%", foreground: "0 0% 10%" },
	{
		id: "orange",
		label: "Orange",
		light: "24 90% 40%",
		dark: "24 90% 52%",
		foreground: "0 0% 100%",
	},
	{ id: "rose", label: "Rose", light: "340 82% 40%", dark: "340 82% 58%", foreground: "0 0% 100%" },
	{
		id: "purple",
		label: "Purple",
		light: "270 60% 42%",
		dark: "270 65% 62%",
		foreground: "0 0% 100%",
	},
	{
		id: "indigo",
		label: "Indigo",
		light: "250 55% 42%",
		dark: "250 60% 62%",
		foreground: "0 0% 100%",
	},
] as const;

export const DEFAULT_ACCENT_ID = "blue";
const STORAGE_KEY = "basalt-accent";

type AccentContextValue = {
	accent: string;
	setAccent: (id: string) => void;
	swatches: readonly AccentSwatch[];
};

const AccentContext = createContext<AccentContextValue | null>(null);

export function accentSwatchById(id: string | null | undefined): AccentSwatch {
	return ACCENT_SWATCHES.find((swatch) => swatch.id === id) ?? ACCENT_SWATCHES[0];
}

export function applyAccent(id: string, dark = false) {
	const swatch = accentSwatchById(id);
	const value = dark ? swatch.dark : swatch.light;
	const root = document.documentElement;
	root.style.setProperty("--basalt-primary", value);
	root.style.setProperty("--basalt-primary-foreground", swatch.foreground);
	root.style.setProperty("--basalt-ring", value);
	root.style.setProperty("--basalt-chart-1", value);
	root.dataset.accent = swatch.id;
}

function readAccent(): string {
	return accentSwatchById(window.localStorage.getItem(STORAGE_KEY)).id;
}

function subscribe(onStoreChange: () => void) {
	window.addEventListener("storage", onStoreChange);
	return () => window.removeEventListener("storage", onStoreChange);
}

function isDarkMode(): boolean {
	return document.documentElement.classList.contains("dark");
}

export function AccentProvider({ children }: { children: ReactNode }) {
	const accent = useSyncExternalStore(subscribe, readAccent, () => DEFAULT_ACCENT_ID);
	useEffect(() => {
		applyAccent(accent, isDarkMode());
		const observer = new MutationObserver(() => applyAccent(accent, isDarkMode()));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, [accent]);
	const setAccent = useCallback((id: string) => {
		const next = accentSwatchById(id).id;
		window.localStorage.setItem(STORAGE_KEY, next);
		applyAccent(next, isDarkMode());
		window.dispatchEvent(new Event("storage"));
	}, []);
	const value = useMemo(
		() => ({ accent, setAccent, swatches: ACCENT_SWATCHES }),
		[accent, setAccent],
	);
	return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
	const ctx = useContext(AccentContext);
	if (!ctx) {
		throw new Error("useAccent must be used within AccentProvider");
	}
	return ctx;
}
