import "@testing-library/jest-dom";
import "../i18n";

// Node 26 ships an experimental global Web Storage API that shadows the
// `localStorage` jsdom would otherwise expose via `window`; without a
// `--localstorage-file` (or `--no-experimental-webstorage`) the resulting
// binding is unusable, and components that read `localStorage` at render
// time (e.g. ThemeToggle) throw under Vitest. Install a minimal in-memory
// Storage shim as a Node 26 compatibility layer.
//
// This is NOT a jsdom opaque-origin issue — Vitest's default jsdom URL is
// already `http://localhost:3000/`, and setting `environmentOptions.jsdom.url`
// does not fix it. Do not replace this shim with a URL config.
{
	const store = new Map<string, string>();
	const shim: Storage = {
		get length() {
			return store.size;
		},
		clear: () => store.clear(),
		getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
		key: (i) => Array.from(store.keys())[i] ?? null,
		removeItem: (k) => {
			store.delete(k);
		},
		setItem: (k, v) => {
			store.set(k, String(v));
		},
	};
	Object.defineProperty(globalThis, "localStorage", { value: shim, writable: true });
	Object.defineProperty(window, "localStorage", { value: shim, writable: true });
}

Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => {},
	}),
});
