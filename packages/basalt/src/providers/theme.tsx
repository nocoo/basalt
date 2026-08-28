import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
} from "react";

export type BasaltTheme = "light" | "dark" | "system";

const STORAGE_KEY = "theme";

type ThemeContextValue = {
	theme: BasaltTheme;
	setTheme: (theme: BasaltTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readTheme(): BasaltTheme {
	const value = window.localStorage.getItem(STORAGE_KEY);
	if (value === "light" || value === "dark" || value === "system") {
		return value;
	}
	return "system";
}

function subscribe(onStoreChange: () => void) {
	window.addEventListener("storage", onStoreChange);
	return () => window.removeEventListener("storage", onStoreChange);
}

function applyTheme(theme: BasaltTheme) {
	const root = document.documentElement;
	const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const dark = theme === "dark" || (theme === "system" && systemDark);
	root.classList.toggle("dark", dark);
	root.classList.toggle("light", !dark);
	root.dataset.mode = dark ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);
	useEffect(() => {
		applyTheme(theme);
		if (theme !== "system") {
			return;
		}
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, [theme]);
	const setTheme = useCallback((next: BasaltTheme) => {
		window.localStorage.setItem(STORAGE_KEY, next);
		applyTheme(next);
		window.dispatchEvent(new Event("storage"));
	}, []);
	const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within ThemeProvider");
	}
	return ctx;
}
