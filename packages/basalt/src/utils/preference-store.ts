type PreferenceConfig<T> = {
	storageKey: string;
	defaultValue: T;
	persist: boolean;
};

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

interface PreferenceChangeEventDetail<T> {
	key: string;
	value: T;
	writeSucceeded: boolean;
}

export function createPreferenceStore<T extends string>({
	storageKey,
	defaultValue: initialDefaultValue,
	persist,
	isValid,
	normalize,
	eventName,
}: PreferenceConfig<T> & {
	isValid: (value: unknown) => value is T;
	normalize: (value: T) => T;
	eventName: string;
}) {
	let defaultValue = normalize(initialDefaultValue);
	let memoryValue = defaultValue;
	let hasExplicitSelection = false;
	let lastSetFailed = false;

	if (persist) {
		const res = safeGetStorageItem(storageKey);
		if (res.status === "success" && isValid(res.value)) {
			memoryValue = normalize(res.value);
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
		const customEv = event as CustomEvent<PreferenceChangeEventDetail<T>>;
		if (!customEv.detail || customEv.detail.key !== storageKey) {
			return;
		}
		const { value, writeSucceeded } = customEv.detail;
		lastSetFailed = !writeSucceeded;
		memoryValue = value;
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
			const rawValue = storageEv.newValue;
			if (rawValue === null || rawValue === undefined || !isValid(rawValue)) {
				memoryValue = defaultValue;
				hasExplicitSelection = false;
			} else {
				memoryValue = normalize(rawValue);
				hasExplicitSelection = true;
			}
			notify();
			return;
		}
		// A bare storage event must not replace a selection whose write failed.
		if (lastSetFailed) {
			return;
		}
		const res = safeGetStorageItem(storageKey);
		if (res.status === "error") {
			return;
		}
		if (isValid(res.value)) {
			memoryValue = normalize(res.value);
			hasExplicitSelection = true;
		} else {
			memoryValue = defaultValue;
			hasExplicitSelection = false;
		}
		notify();
	};

	let cleanupStorageListener: (() => void) | null = null;
	const attachStorageListener = () => {
		if (typeof window === "undefined") {
			return;
		}
		if (listeners.size === 1 && !cleanupStorageListener) {
			window.addEventListener("storage", onStorage);
			window.addEventListener(eventName, onInternalChange);
			cleanupStorageListener = () => {
				window.removeEventListener("storage", onStorage);
				window.removeEventListener(eventName, onInternalChange);
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
		getSnapshot: () => memoryValue,
		subscribe: (listener: () => void) => {
			listeners.add(listener);
			attachStorageListener();
			return () => {
				listeners.delete(listener);
				detachStorageListener();
			};
		},
		setValue: (next: T) => {
			const value = normalize(next);
			memoryValue = value;
			hasExplicitSelection = true;
			if (persist) {
				const writeSucceeded = safeSetStorageItem(storageKey, value);
				lastSetFailed = !writeSucceeded;
				if (typeof window !== "undefined") {
					try {
						window.dispatchEvent(
							new CustomEvent<PreferenceChangeEventDetail<T>>(eventName, {
								detail: { key: storageKey, value, writeSucceeded },
							}),
						);
					} catch {
						// The local selection still applies when dispatch is unavailable.
					}
				}
			}
			notify();
		},
		updateConfig: (config: PreferenceConfig<T>) => {
			const keyChanged = storageKey !== config.storageKey;
			const persistChanged = persist !== config.persist;
			const normalizedDefault = normalize(config.defaultValue);
			const defaultChanged = defaultValue !== normalizedDefault;

			const oldPersist = persist;
			storageKey = config.storageKey;
			defaultValue = normalizedDefault;
			persist = config.persist;

			if (keyChanged) {
				if (persist) {
					const res = safeGetStorageItem(storageKey);
					if (res.status === "success") {
						lastSetFailed = false;
						if (isValid(res.value)) {
							memoryValue = normalize(res.value);
							hasExplicitSelection = true;
						} else {
							memoryValue = defaultValue;
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
						if (isValid(res.value)) {
							memoryValue = normalize(res.value);
							hasExplicitSelection = true;
							notify();
						}
					}
				}
			} else if (defaultChanged) {
				if (!hasExplicitSelection) {
					if (persist) {
						const res = safeGetStorageItem(storageKey);
						if (res.status === "success" && !isValid(res.value)) {
							memoryValue = defaultValue;
							notify();
						}
					} else {
						memoryValue = defaultValue;
						notify();
					}
				}
			}
		},
	};
}
