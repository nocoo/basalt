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
	token: string;
	light: string;
	dark: string;
};

export const ACCENT_SWATCHES: readonly AccentSwatch[] = [
	{
		id: "primary",
		label: "Primary",
		token: "--basalt-chart-1",
		light: "217 91% 60%",
		dark: "217 91% 65%",
	},
	{ id: "sky", label: "Sky", token: "--basalt-chart-2", light: "200 90% 55%", dark: "200 90% 60%" },
	{
		id: "teal",
		label: "Teal",
		token: "--basalt-chart-3",
		light: "186 80% 45%",
		dark: "186 80% 50%",
	},
	{
		id: "jade",
		label: "Jade",
		token: "--basalt-chart-4",
		light: "166 72% 44%",
		dark: "166 72% 50%",
	},
	{
		id: "green",
		label: "Green",
		token: "--basalt-chart-5",
		light: "142 71% 45%",
		dark: "142 71% 50%",
	},
	{ id: "lime", label: "Lime", token: "--basalt-chart-6", light: "84 65% 46%", dark: "84 65% 52%" },
	{
		id: "amber",
		label: "Amber",
		token: "--basalt-chart-7",
		light: "45 93% 47%",
		dark: "45 93% 52%",
	},
	{
		id: "orange",
		label: "Orange",
		token: "--basalt-chart-8",
		light: "30 90% 55%",
		dark: "30 90% 60%",
	},
	{
		id: "vermilion",
		label: "Vermilion",
		token: "--basalt-chart-9",
		light: "15 85% 52%",
		dark: "15 85% 57%",
	},
	{ id: "red", label: "Red", token: "--basalt-chart-10", light: "0 72% 51%", dark: "0 72% 56%" },
	{
		id: "rose",
		label: "Rose",
		token: "--basalt-chart-11",
		light: "340 82% 55%",
		dark: "340 82% 60%",
	},
	{
		id: "magenta",
		label: "Magenta",
		token: "--basalt-chart-12",
		light: "320 70% 55%",
		dark: "320 70% 60%",
	},
	{
		id: "orchid",
		label: "Orchid",
		token: "--basalt-chart-13",
		light: "290 65% 55%",
		dark: "290 65% 60%",
	},
	{
		id: "purple",
		label: "Purple",
		token: "--basalt-chart-14",
		light: "270 70% 60%",
		dark: "270 70% 65%",
	},
	{
		id: "indigo",
		label: "Indigo",
		token: "--basalt-chart-15",
		light: "250 65% 58%",
		dark: "250 65% 63%",
	},
	{
		id: "cobalt",
		label: "Cobalt",
		token: "--basalt-chart-16",
		light: "230 70% 56%",
		dark: "230 70% 61%",
	},
	{
		id: "steel",
		label: "Steel",
		token: "--basalt-chart-17",
		light: "210 55% 50%",
		dark: "210 55% 56%",
	},
	{
		id: "cadet",
		label: "Cadet",
		token: "--basalt-chart-18",
		light: "195 45% 55%",
		dark: "195 45% 60%",
	},
	{
		id: "seafoam",
		label: "Seafoam",
		token: "--basalt-chart-19",
		light: "160 50% 50%",
		dark: "160 50% 55%",
	},
	{
		id: "olive",
		label: "Olive",
		token: "--basalt-chart-20",
		light: "100 50% 48%",
		dark: "100 50% 53%",
	},
	{
		id: "gold",
		label: "Gold",
		token: "--basalt-chart-21",
		light: "60 65% 45%",
		dark: "60 65% 50%",
	},
	{
		id: "tangerine",
		label: "Tangerine",
		token: "--basalt-chart-22",
		light: "22 80% 50%",
		dark: "22 80% 55%",
	},
	{
		id: "crimson",
		label: "Crimson",
		token: "--basalt-chart-23",
		light: "350 65% 50%",
		dark: "350 65% 55%",
	},
	{ id: "gray", label: "Gray", token: "--basalt-chart-24", light: "0 0% 25%", dark: "0 0% 65%" },
] as const;

export const DEFAULT_ACCENT_ID = "primary";
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

function channel(c: number) {
	return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function accentForeground(hsl: string) {
	const [hue, sat, light] = hsl.trim().split(/\s+/);
	const h = Number(hue);
	const s = Number(sat.replace("%", "")) / 100;
	const l = Number(light.replace("%", "")) / 100;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	};
	const luminance = 0.2126 * channel(f(0)) + 0.7152 * channel(f(8)) + 0.0722 * channel(f(4));
	return luminance > 0.35 ? "0 0% 10%" : "0 0% 100%";
}

export function applyAccent(id: string, dark = false) {
	const swatch = accentSwatchById(id);
	const value = dark ? swatch.dark : swatch.light;
	const root = document.documentElement;
	root.style.setProperty("--basalt-primary", value);
	root.style.setProperty("--basalt-primary-foreground", accentForeground(value));
	root.style.setProperty("--basalt-ring", value);
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
