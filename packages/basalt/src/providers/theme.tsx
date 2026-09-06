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

interface ThemeStore {
	getSnapshot: () => BasaltTheme;
	subscribe: (listener: () => void) => () => void;
	setTheme: (next: BasaltTheme) => void;
	updateConfig: (config: {
		storageKey: string;
		defaultTheme: BasaltTheme;
		persist: boolean;
	}) => void;
}

function isValidTheme(value: unknown): value is BasaltTheme {
	return value === "light" || value === "dark" || value === "system";
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
		// localStorage getter threw
		return false;
	}
	return false;
}

const THEME_CHANGE_EVENT = "basalt:theme-change";

interface ThemeChangeEventDetail {
	key: string;
	value: BasaltTheme;
	writeSucceeded: boolean;
}

function createThemeStore(
	initialStorageKey: string,
	initialDefaultTheme: BasaltTheme,
	initialPersist: boolean,
): ThemeStore {
	let storageKey = initialStorageKey;
	let defaultTheme = initialDefaultTheme;
	let persist = initialPersist;

	// In-memory fallback / cache value
	let memoryTheme: BasaltTheme = defaultTheme;
	let hasExplicitSelection = false;
	let lastSetFailed = false;

	if (persist) {
		const res = safeGetStorageItem(storageKey);
		if (res.status === "success" && isValidTheme(res.value)) {
			memoryTheme = res.value;
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
		const customEv = event as CustomEvent<ThemeChangeEventDetail>;
		if (!customEv.detail || customEv.detail.key !== storageKey) {
			return;
		}
		const { value, writeSucceeded } = customEv.detail;
		if (writeSucceeded) {
			lastSetFailed = false;
		} else {
			lastSetFailed = true;
		}
		memoryTheme = value;
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
			if (rawVal === null || rawVal === undefined || !isValidTheme(rawVal)) {
				// Key removed or invalid value: revert to configured default
				memoryTheme = defaultTheme;
				hasExplicitSelection = false;
				notify();
				return;
			}
			memoryTheme = rawVal;
			hasExplicitSelection = true;
			notify();
			return;
		}
		// Untyped/bare storage event: e.g. dispatchEvent(new Event("storage"))
		// If last set failed, ignore so stale storage cannot overwrite in-memory switch
		if (lastSetFailed) {
			return;
		}
		const res = safeGetStorageItem(storageKey);
		if (res.status === "error") {
			// Read failed: preserve current cached memory theme, do not revert to default
			return;
		}
		if (isValidTheme(res.value)) {
			memoryTheme = res.value;
			hasExplicitSelection = true;
			notify();
		} else {
			// Key removed or invalid value stored: revert to default
			memoryTheme = defaultTheme;
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
			window.addEventListener(THEME_CHANGE_EVENT, onInternalChange);
			cleanupStorageListener = () => {
				window.removeEventListener("storage", onStorage);
				window.removeEventListener(THEME_CHANGE_EVENT, onInternalChange);
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
		getSnapshot: () => memoryTheme,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			attachStorageListener();
			return () => {
				listeners.delete(listener);
				detachStorageListener();
			};
		},
		setTheme: (next: BasaltTheme) => {
			memoryTheme = next;
			hasExplicitSelection = true;
			let writeSucceeded = true;
			if (persist) {
				const success = safeSetStorageItem(storageKey, next);
				lastSetFailed = !success;
				writeSucceeded = success;
				if (typeof window !== "undefined") {
					try {
						window.dispatchEvent(
							new CustomEvent<ThemeChangeEventDetail>(THEME_CHANGE_EVENT, {
								detail: { key: storageKey, value: next, writeSucceeded },
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
			const defaultChanged = defaultTheme !== config.defaultTheme;

			const oldPersist = persist;
			storageKey = config.storageKey;
			defaultTheme = config.defaultTheme;
			persist = config.persist;

			if (keyChanged) {
				if (persist) {
					const res = safeGetStorageItem(storageKey);
					if (res.status === "success") {
						lastSetFailed = false;
						if (isValidTheme(res.value)) {
							memoryTheme = res.value;
							hasExplicitSelection = true;
						} else {
							memoryTheme = defaultTheme;
							hasExplicitSelection = false;
						}
					}
					notify();
				}
				// persist=false: changing storageKey does not reset current memoryTheme
			} else if (persistChanged) {
				if (!oldPersist && persist) {
					// persist flipped false -> true: read from storage or keep current
					const res = safeGetStorageItem(storageKey);
					if (res.status === "success") {
						lastSetFailed = false;
						if (isValidTheme(res.value)) {
							memoryTheme = res.value;
							hasExplicitSelection = true;
							notify();
						}
					}
				}
				// persist flipped true -> false: only disable persistence, keep current memoryTheme, no storage read/write
			} else if (defaultChanged) {
				// defaultTheme changed: only update if no explicit selection was made
				if (!hasExplicitSelection) {
					if (persist) {
						const res = safeGetStorageItem(storageKey);
						if (res.status === "success" && !isValidTheme(res.value)) {
							memoryTheme = defaultTheme;
							notify();
						}
					} else {
						memoryTheme = defaultTheme;
						notify();
					}
				}
			}
		},
	};
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

	const [store] = useState(() => createThemeStore(storageKey, defaultTheme, persist));

	useEffect(() => {
		store.updateConfig({ storageKey, defaultTheme, persist });
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
			store.setTheme(next);
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
