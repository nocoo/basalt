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
import { createPreferenceStore } from "../utils/preference-store";

export type BasaltTheme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
	theme: BasaltTheme;
	setTheme: (theme: BasaltTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: BasaltTheme) {
	if (typeof document === "undefined") {
		return;
	}
	const root = document.documentElement;
	let systemDark = false;
	try {
		if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
			systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		}
	} catch {
		systemDark = false;
	}
	const dark = theme === "dark" || (theme === "system" && systemDark);
	root.classList.toggle("dark", dark);
	root.classList.toggle("light", !dark);
	root.dataset.mode = dark ? "dark" : "light";
}

export interface ThemeProviderProps {
	/**
	 * Application components wrapped by the theme context.
	 */
	children: ReactNode;
	/**
	 * Storage key used for theme persistence.
	 * @default "theme"
	 */
	storageKey?: string;
	/**
	 * Initial theme used when no stored preference exists or during SSR.
	 * @default "system"
	 */
	defaultTheme?: BasaltTheme;
	/**
	 * Whether to persist theme changes to localStorage.
	 * If false, localStorage is never read or written.
	 * @default true
	 */
	persist?: boolean;
	/**
	 * Controlled theme value. When provided, the provider acts as a controlled component
	 * and internal state is driven by this prop.
	 */
	theme?: BasaltTheme;
	/**
	 * Callback fired when theme change is requested.
	 * In controlled mode, callers are responsible for updating `theme`.
	 */
	onThemeChange?: (theme: BasaltTheme) => void;
	/**
	 * Whether to apply mode classes and data-mode attribute to document.documentElement.
	 * Set to false when a host theme system manages the document root.
	 * @default true
	 */
	applyToDocument?: boolean;
}

function isValidTheme(value: unknown): value is BasaltTheme {
	return value === "light" || value === "dark" || value === "system";
}

export function ThemeProvider({
	children,
	storageKey = STORAGE_KEY,
	defaultTheme = "system",
	persist = true,
	theme: controlledTheme,
	onThemeChange,
	applyToDocument = true,
}: ThemeProviderProps) {
	const isControlled = controlledTheme !== undefined;

	const [store] = useState(() =>
		createPreferenceStore({
			storageKey,
			defaultValue: defaultTheme,
			persist,
			isValid: isValidTheme,
			normalize: (value) => value,
			eventName: "basalt:theme-change",
		}),
	);

	useEffect(() => {
		store.updateConfig({ storageKey, defaultValue: defaultTheme, persist });
	}, [store, storageKey, defaultTheme, persist]);

	const getServerSnapshot = useCallback(() => defaultTheme, [defaultTheme]);

	const storeTheme = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerSnapshot);

	const currentTheme = isControlled ? controlledTheme : storeTheme;

	useEffect(() => {
		if (!applyToDocument || typeof window === "undefined") {
			return;
		}
		applyTheme(currentTheme);
		if (currentTheme !== "system") {
			return;
		}
		try {
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			const onChange = () => applyTheme("system");
			mq.addEventListener("change", onChange);
			return () => mq.removeEventListener("change", onChange);
		} catch {
			// matchMedia not supported or restricted
			return;
		}
	}, [currentTheme, applyToDocument]);

	const setTheme = useCallback(
		(next: BasaltTheme) => {
			if (isControlled) {
				onThemeChange?.(next);
				return;
			}
			store.setValue(next);
			onThemeChange?.(next);
		},
		[isControlled, onThemeChange, store],
	);

	const value = useMemo(() => ({ theme: currentTheme, setTheme }), [currentTheme, setTheme]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return ctx;
}
