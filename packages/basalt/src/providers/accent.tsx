import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
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

function parseHslChannels(hsl: string): [number, number, number] {
	const [hue, sat, light] = hsl.trim().split(/\s+/);
	const h = Number(hue);
	const s = Number(sat.replace("%", "")) / 100;
	const l = Number(light.replace("%", "")) / 100;
	return [h, s, l];
}

function hslToRgbChannels(h: number, s: number, l: number): [number, number, number] {
	const k = (n: number) => (n + h / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return [255 * f(0), 255 * f(8), 255 * f(4)];
}

function relativeLuminance(rgb: [number, number, number]): number {
	return (
		0.2126 * channel(rgb[0] / 255) + 0.7152 * channel(rgb[1] / 255) + 0.0722 * channel(rgb[2] / 255)
	);
}

function wcagContrast(rgbA: [number, number, number], rgbB: [number, number, number]): number {
	const lA = relativeLuminance(rgbA);
	const lB = relativeLuminance(rgbB);
	return (Math.max(lA, lB) + 0.05) / (Math.min(lA, lB) + 0.05);
}

const DARK_TEXT_RGB: [number, number, number] = [26, 26, 26]; // 0 0% 10%
const WHITE_TEXT_RGB: [number, number, number] = [255, 255, 255]; // 0 0% 100%

const LIGHT_SURFACES_RGB: [number, number, number][] = [
	[238, 239, 242], // background
	[246, 247, 248], // card
	[252, 252, 253], // secondary
	[255, 255, 255], // bright
];

const DARK_SURFACES_RGB: [number, number, number][] = [
	[23, 23, 23], // background
	[27, 27, 27], // card
	[31, 31, 31], // secondary
	[36, 36, 36], // bright
];

function compositeRgb(
	top: [number, number, number, number],
	bottom: [number, number, number],
): [number, number, number] {
	return [
		top[0] * top[3] + bottom[0] * (1 - top[3]),
		top[1] * top[3] + bottom[1] * (1 - top[3]),
		top[2] * top[3] + bottom[2] * (1 - top[3]),
	];
}

function deriveSemanticPrimary(swatch: AccentSwatch, dark: boolean): string {
	const [h, s, origL] = parseHslChannels(dark ? swatch.dark : swatch.light);
	const targetSurfaces = dark ? DARK_SURFACES_RGB : LIGHT_SURFACES_RGB;

	if (!dark) {
		for (let l = Math.min(Math.round(origL * 100), 60); l >= 15; l--) {
			const rgb = hslToRgbChannels(h, s, l / 100);
			const minTextR = Math.min(...targetSurfaces.map((bg) => wcagContrast(rgb, bg)));
			if (minTextR < 4.55) {
				continue;
			}
			const cWhite = wcagContrast(rgb, WHITE_TEXT_RGB);
			if (cWhite < 4.55) {
				continue;
			}
			let hoverOk = true;
			for (const bg of targetSurfaces) {
				const hoverBg = compositeRgb([...rgb, 0.9], bg);
				if (wcagContrast(hoverBg, WHITE_TEXT_RGB) < 4.55) {
					hoverOk = false;
					break;
				}
			}
			if (hoverOk) {
				return `${h} ${Math.round(s * 100)}% ${l}%`;
			}
		}
	} else {
		for (let l = Math.max(Math.round(origL * 100), 45); l <= 85; l++) {
			const rgb = hslToRgbChannels(h, s, l / 100);
			const minTextR = Math.min(...targetSurfaces.map((bg) => wcagContrast(rgb, bg)));
			if (minTextR < 4.55) {
				continue;
			}
			const cDark = wcagContrast(rgb, DARK_TEXT_RGB);
			if (cDark < 4.55) {
				continue;
			}
			let hoverOk = true;
			for (const bg of targetSurfaces) {
				const hoverBg = compositeRgb([...rgb, 0.9], bg);
				if (wcagContrast(hoverBg, DARK_TEXT_RGB) < 4.55) {
					hoverOk = false;
					break;
				}
			}
			if (hoverOk) {
				return `${h} ${Math.round(s * 100)}% ${l}%`;
			}
		}
	}
	return dark ? swatch.dark : swatch.light;
}

export function accentForeground(hsl: string) {
	const [h, s, l] = parseHslChannels(hsl);
	const rgb = hslToRgbChannels(h, s, l);
	const contrastWhite = wcagContrast(rgb, WHITE_TEXT_RGB);
	const contrastDark = wcagContrast(rgb, DARK_TEXT_RGB);
	return contrastDark >= contrastWhite ? ("0 0% 10%" as const) : ("0 0% 100%" as const);
}

export function applyAccent(id: string, dark = false) {
	if (typeof document === "undefined") {
		return;
	}
	const swatch = accentSwatchById(id);
	const semanticPrimary = deriveSemanticPrimary(swatch, dark);
	const root = document.documentElement;
	root.style.setProperty("--basalt-primary", semanticPrimary);
	root.style.setProperty("--basalt-primary-foreground", accentForeground(semanticPrimary));
	root.style.setProperty("--basalt-ring", semanticPrimary);
	root.dataset.accent = swatch.id;
}

export interface AccentProviderProps {
	/**
	 * Application components wrapped by the accent context.
	 */
	children: ReactNode;
	/**
	 * Storage key used for accent persistence.
	 * @default "basalt-accent"
	 */
	storageKey?: string;
	/**
	 * Initial accent identifier used when no stored preference exists or during SSR.
	 * @default "primary"
	 */
	defaultAccent?: string;
	/**
	 * Whether to persist accent changes to localStorage.
	 * If false, localStorage is never read or written.
	 * @default true
	 */
	persist?: boolean;
	/**
	 * Controlled accent identifier. When provided, the provider acts as a controlled component
	 * and internal state is driven by this prop.
	 */
	accent?: string;
	/**
	 * Callback fired when accent change is requested.
	 * In controlled mode, callers are responsible for updating `accent`.
	 */
	onAccentChange?: (accent: string) => void;
	/**
	 * Whether to apply accent CSS variables and data-accent attribute to document.documentElement.
	 * Set to false when a host theme system manages CSS variables directly.
	 * @default true
	 */
	applyToDocument?: boolean;
}

interface AccentStore {
	getSnapshot: () => string;
	subscribe: (listener: () => void) => () => void;
	setAccent: (next: string) => void;
	updateConfig: (config: { storageKey: string; defaultAccent: string; persist: boolean }) => void;
}

function isValidAccentId(value: unknown): value is string {
	return typeof value === "string" && ACCENT_SWATCHES.some((s) => s.id === value);
}

type StorageReadResult = { status: "success"; value: string | null } | { status: "error" };

function safeGetStorageItem(key: string): StorageReadResult {
	try {
		if (typeof window === "undefined" || !window.localStorage) {
			return { status: "error" };
		}
		const value = window.localStorage.getItem(key);
		return { status: "success", value };
	} catch {
		return { status: "error" };
	}
}

function safeSetStorageItem(key: string, value: string): boolean {
	try {
		if (typeof window === "undefined" || !window.localStorage) {
			return false;
		}
		window.localStorage.setItem(key, value);
		return true;
	} catch {
		return false;
	}
}

function isLocalStorageArea(area: Storage | null | undefined): boolean {
	if (!area) {
		return true;
	}
	try {
		if (typeof window !== "undefined" && window.localStorage) {
			return area === window.localStorage;
		}
	} catch {
		return false;
	}
	return false;
}

const ACCENT_CHANGE_EVENT = "basalt:accent-change";

interface AccentChangeEventDetail {
	key: string;
	value: string;
	writeSucceeded: boolean;
}

function createAccentStore(
	initialStorageKey: string,
	initialDefaultAccent: string,
	initialPersist: boolean,
): AccentStore {
	let storageKey = initialStorageKey;
	let defaultAccent = accentSwatchById(initialDefaultAccent).id;
	let persist = initialPersist;

	let memoryAccent: string = defaultAccent;
	let hasExplicitSelection = false;
	let lastSetFailed = false;

	if (persist) {
		const res = safeGetStorageItem(storageKey);
		if (res.status === "success" && isValidAccentId(res.value)) {
			memoryAccent = res.value;
			hasExplicitSelection = true;
		}
	}

	const listeners = new Set<() => void>();

	const notify = () => {
		for (const listener of listeners) {
			listener();
		}
	};

	const onInternalChange = (event: Event) => {
		if (!persist) {
			return;
		}
		const customEv = event as CustomEvent<AccentChangeEventDetail>;
		if (!customEv.detail || customEv.detail.key !== storageKey) {
			return;
		}
		const { value, writeSucceeded } = customEv.detail;
		if (writeSucceeded) {
			lastSetFailed = false;
		} else {
			lastSetFailed = true;
		}
		memoryAccent = value;
		hasExplicitSelection = true;
		notify();
	};

	const onStorage = (event: StorageEvent | Event) => {
		if (!persist) {
			return;
		}
		const storageEv = event as Partial<StorageEvent>;
		if ("key" in storageEv && storageEv.key !== undefined) {
			if (!isLocalStorageArea(storageEv.storageArea)) {
				return;
			}
			if (storageEv.key !== null && storageEv.key !== storageKey) {
				return;
			}
			lastSetFailed = false;
			const rawVal = storageEv.newValue;
			if (rawVal === null || rawVal === undefined || !isValidAccentId(rawVal)) {
				memoryAccent = defaultAccent;
				hasExplicitSelection = false;
				notify();
				return;
			}
			memoryAccent = rawVal;
			hasExplicitSelection = true;
			notify();
			return;
		}
		if (lastSetFailed) {
			return;
		}
		const res = safeGetStorageItem(storageKey);
		if (res.status === "error") {
			// Read failed: preserve current cached memory accent, do not revert to default
			return;
		}
		if (isValidAccentId(res.value)) {
			memoryAccent = res.value;
			hasExplicitSelection = true;
			notify();
		} else {
			// Key removed or invalid value stored: revert to default
			memoryAccent = defaultAccent;
			hasExplicitSelection = false;
			notify();
		}
	};

	let cleanupStorageListener: (() => void) | null = null;
	const attachStorageListener = () => {
		if (typeof window === "undefined") {
			return;
		}
		if (listeners.size === 1 && !cleanupStorageListener) {
			window.addEventListener("storage", onStorage);
			window.addEventListener(ACCENT_CHANGE_EVENT, onInternalChange);
			cleanupStorageListener = () => {
				window.removeEventListener("storage", onStorage);
				window.removeEventListener(ACCENT_CHANGE_EVENT, onInternalChange);
				cleanupStorageListener = null;
			};
		}
	};

	const detachStorageListener = () => {
		if (listeners.size === 0 && cleanupStorageListener) {
			cleanupStorageListener();
		}
	};

	return {
		getSnapshot: () => memoryAccent,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			attachStorageListener();
			return () => {
				listeners.delete(listener);
				detachStorageListener();
			};
		},
		setAccent: (next: string) => {
			const validId = accentSwatchById(next).id;
			memoryAccent = validId;
			hasExplicitSelection = true;
			let writeSucceeded = true;
			if (persist) {
				const success = safeSetStorageItem(storageKey, validId);
				lastSetFailed = !success;
				writeSucceeded = success;
				if (typeof window !== "undefined") {
					try {
						window.dispatchEvent(
							new CustomEvent<AccentChangeEventDetail>(ACCENT_CHANGE_EVENT, {
								detail: { key: storageKey, value: validId, writeSucceeded },
							}),
						);
					} catch {
						// ignore
					}
				}
			}
			notify();
		},
		updateConfig: (config) => {
			const keyChanged = storageKey !== config.storageKey;
			const persistChanged = persist !== config.persist;
			const normalizedDefault = accentSwatchById(config.defaultAccent).id;
			const defaultChanged = defaultAccent !== normalizedDefault;

			const oldPersist = persist;
			storageKey = config.storageKey;
			defaultAccent = normalizedDefault;
			persist = config.persist;

			if (keyChanged) {
				if (persist) {
					const res = safeGetStorageItem(storageKey);
					if (res.status === "success") {
						lastSetFailed = false;
						if (isValidAccentId(res.value)) {
							memoryAccent = res.value;
							hasExplicitSelection = true;
						} else {
							memoryAccent = defaultAccent;
							hasExplicitSelection = false;
						}
					}
					notify();
				}
			} else if (persistChanged) {
				if (!oldPersist && persist) {
					const res = safeGetStorageItem(storageKey);
					if (res.status === "success") {
						lastSetFailed = false;
						if (isValidAccentId(res.value)) {
							memoryAccent = res.value;
							hasExplicitSelection = true;
							notify();
						}
					}
				}
			} else if (defaultChanged) {
				if (!hasExplicitSelection) {
					if (persist) {
						const res = safeGetStorageItem(storageKey);
						if (res.status === "success" && !isValidAccentId(res.value)) {
							memoryAccent = defaultAccent;
							notify();
						}
					} else {
						memoryAccent = defaultAccent;
						notify();
					}
				}
			}
		},
	};
}

function isDarkMode(): boolean {
	if (typeof document === "undefined") {
		return false;
	}
	return document.documentElement.classList.contains("dark");
}

export function AccentProvider({
	children,
	storageKey = STORAGE_KEY,
	defaultAccent = DEFAULT_ACCENT_ID,
	persist = true,
	accent: controlledAccent,
	onAccentChange,
	applyToDocument = true,
}: AccentProviderProps) {
	const isControlled = controlledAccent !== undefined;

	const [store] = useState(() => createAccentStore(storageKey, defaultAccent, persist));

	useEffect(() => {
		store.updateConfig({ storageKey, defaultAccent, persist });
	}, [store, storageKey, defaultAccent, persist]);

	const getServerSnapshot = useCallback(() => accentSwatchById(defaultAccent).id, [defaultAccent]);

	const storeAccent = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);

	const currentAccent = isControlled ? accentSwatchById(controlledAccent).id : storeAccent;

	useEffect(() => {
		if (!applyToDocument || typeof document === "undefined") {
			return;
		}
		applyAccent(currentAccent, isDarkMode());
		const observer = new MutationObserver(() => applyAccent(currentAccent, isDarkMode()));
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
		return () => observer.disconnect();
	}, [currentAccent, applyToDocument]);

	const setAccent = useCallback(
		(next: string) => {
			const validId = accentSwatchById(next).id;
			if (isControlled) {
				onAccentChange?.(validId);
				return;
			}
			store.setAccent(validId);
			onAccentChange?.(validId);
		},
		[isControlled, onAccentChange, store],
	);

	const value = useMemo(
		() => ({ accent: currentAccent, setAccent, swatches: ACCENT_SWATCHES }),
		[currentAccent, setAccent],
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
