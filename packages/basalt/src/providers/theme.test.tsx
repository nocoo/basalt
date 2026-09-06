import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./theme";

function Probe() {
	const { theme, setTheme } = useTheme();
	return (
		<div>
			<span data-testid="theme-val">{theme}</span>
			<button type="button" onClick={() => setTheme("dark")}>
				set-dark
			</button>
			<button type="button" onClick={() => setTheme("light")}>
				set-light
			</button>
			<button type="button" onClick={() => setTheme("system")}>
				set-system
			</button>
		</div>
	);
}

describe("ThemeProvider", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		window.localStorage.clear();
		document.documentElement.className = "";
		delete document.documentElement.dataset.mode;
	});

	it("provides a default system theme without reading storage at module load", () => {
		render(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");
	});

	it("throws outside the provider", () => {
		expect(() => render(<Probe />)).toThrow(/ThemeProvider/);
	});

	it("switches theme in memory when localStorage.setItem throws (write-rejection)", () => {
		window.localStorage.setItem("theme", "light");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		render(
			<ThemeProvider>
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});

		expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
		setItemSpy.mockRestore();
		expect(window.localStorage.getItem("theme")).toBe("light");

		// Memory switched to dark even though setItem threw
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		// Bare storage event dispatch does not overwrite in-memory state with stale storage
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("syncs dark across multiple providers on same page even when setItem rejects, and survives bare storage", () => {
		window.localStorage.setItem("theme", "light");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		function MultiProbe() {
			return (
				<div>
					<ThemeProvider>
						<div data-testid="p1">
							<Probe />
						</div>
					</ThemeProvider>
					<ThemeProvider>
						<div data-testid="p2">
							<Probe />
						</div>
					</ThemeProvider>
				</div>
			);
		}

		render(<MultiProbe />);

		const p1 = screen.getByTestId("p1");
		const p2 = screen.getByTestId("p2");

		expect(p1.querySelector("[data-testid='theme-val']")).toHaveTextContent("light");
		expect(p2.querySelector("[data-testid='theme-val']")).toHaveTextContent("light");

		// Provider 1 triggers set-dark, setItem rejects
		act(() => {
			p1.querySelector("button")?.click(); // "set-dark" is first button in Probe
		});

		expect(setItemSpy).toHaveBeenCalled();
		setItemSpy.mockRestore();
		expect(window.localStorage.getItem("theme")).toBe("light");

		// Both providers must be dark in memory
		expect(p1.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
		expect(p2.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");

		// Bare storage event does not roll either back to stale localStorage ("light")
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(p1.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
		expect(p2.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
	});

	it("survives complete storage denial (getItem and setItem throw)", () => {
		vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});

		render(
			<ThemeProvider defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("does not touch localStorage when persist is false", () => {
		const getItemSpy = vi.spyOn(window.localStorage, "getItem");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");

		render(
			<ThemeProvider persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(getItemSpy).not.toHaveBeenCalled();
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(setItemSpy).not.toHaveBeenCalled();
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("isolates persist=true and persist=false providers with same key on same page", () => {
		window.localStorage.setItem("theme", "light");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");

		function MixedProbe() {
			return (
				<div>
					<ThemeProvider persist={true} defaultTheme="light">
						<div data-testid="persistent">
							<Probe />
						</div>
					</ThemeProvider>
					<ThemeProvider persist={false} defaultTheme="system">
						<div data-testid="ephemeral">
							<Probe />
						</div>
					</ThemeProvider>
				</div>
			);
		}

		render(<MixedProbe />);

		const persistent = screen.getByTestId("persistent");
		const ephemeral = screen.getByTestId("ephemeral");

		expect(persistent.querySelector("[data-testid='theme-val']")).toHaveTextContent("light");
		expect(ephemeral.querySelector("[data-testid='theme-val']")).toHaveTextContent("system");

		// Switching ephemeral does not touch localStorage and does not affect persistent provider
		act(() => {
			ephemeral.querySelector("button")?.click(); // set-dark
		});
		expect(ephemeral.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
		expect(persistent.querySelector("[data-testid='theme-val']")).toHaveTextContent("light");
		expect(setItemSpy).not.toHaveBeenCalled();
		expect(window.localStorage.getItem("theme")).toBe("light");

		// Switching persistent writes storage and does not affect ephemeral provider
		act(() => {
			persistent.querySelector("button")?.click(); // set-dark
		});
		expect(persistent.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
		expect(ephemeral.querySelector("[data-testid='theme-val']")).toHaveTextContent("dark");
		expect(setItemSpy).toHaveBeenCalledWith("theme", "dark");
		expect(window.localStorage.getItem("theme")).toBe("dark");
	});

	it("preserves selection on bare storage event when only getItem rejects but setItem succeeded", () => {
		window.localStorage.setItem("theme", "light");

		render(
			<ThemeProvider defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Switch to dark (setItem succeeds)
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
		expect(window.localStorage.getItem("theme")).toBe("dark");

		// Now only getItem throws (e.g. read permission revoked or error)
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});

		// Bare storage event dispatch
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});

		expect(getItemSpy).toHaveBeenCalledWith("theme");
		// Must preserve current cached theme ("dark") rather than reverting to defaultTheme ("system")
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("reverts to default on bare storage event when storage contains invalid non-null value", () => {
		window.localStorage.setItem("theme", "light");

		render(
			<ThemeProvider defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Switch to dark
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Simulate external write of corrupt / invalid value into storage
		window.localStorage.setItem("theme", "not-a-valid-theme");

		// Dispatch bare storage event
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});

		// Must revert to defaultTheme ("system")
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");
	});

	it("supports controlled theme where setTheme notifies onThemeChange without internal switch", () => {
		const onThemeChange = vi.fn();
		const { rerender } = render(
			<ThemeProvider theme="light" onThemeChange={onThemeChange}>
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(onThemeChange).toHaveBeenCalledTimes(1);
		expect(onThemeChange).toHaveBeenCalledWith("dark");
		// Unchanged until parent updates prop
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Parent re-renders with next controlled value; must not trigger onChange callback
		rerender(
			<ThemeProvider theme="dark" onThemeChange={onThemeChange}>
				<Probe />
			</ThemeProvider>,
		);
		expect(onThemeChange).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("does not mutate document.documentElement when applyToDocument is false and applies when toggled true", () => {
		document.documentElement.className = "host-class";
		delete document.documentElement.dataset.mode;

		const { rerender } = render(
			<ThemeProvider applyToDocument={false} defaultTheme="dark">
				<Probe />
			</ThemeProvider>,
		);

		expect(document.documentElement.className).toBe("host-class");
		expect(document.documentElement.dataset.mode).toBeUndefined();

		// Toggling applyToDocument false -> true immediately reflects current theme to documentElement
		rerender(
			<ThemeProvider applyToDocument={true} defaultTheme="dark">
				<Probe />
			</ThemeProvider>,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(true);
		expect(document.documentElement.dataset.mode).toBe("dark");
	});

	it("supports custom storageKey and isolates values", () => {
		window.localStorage.setItem("custom-theme", "dark");
		render(
			<ThemeProvider storageKey="custom-theme">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("reacts to cross-tab storage events and ignores foreign storage areas", () => {
		render(
			<ThemeProvider storageKey="theme" defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);

		// Event from another storage area should be ignored
		act(() => {
			const foreignArea = Object.create(Storage.prototype);
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "theme" },
				newValue: { value: "dark" },
				storageArea: { value: foreignArea },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Event from localStorage should update
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "theme" },
				newValue: { value: "dark" },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Storage removal reverts to defaultTheme
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "theme" },
				newValue: { value: null },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");
	});

	it("handles storageKey prop update: reads new valid key, reverts on missing/invalid, ignores read error", () => {
		window.localStorage.setItem("key-a", "light");
		window.localStorage.setItem("key-b", "dark");
		window.localStorage.setItem("key-c", "invalid-theme");

		const { rerender } = render(
			<ThemeProvider storageKey="key-a" defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Switch to key-b which has "dark"
		rerender(
			<ThemeProvider storageKey="key-b" defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Switch to key-c which has invalid value -> reverts to defaultTheme "system"
		rerender(
			<ThemeProvider storageKey="key-c" defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Switch to key-d which is missing -> reverts to defaultTheme "system"
		rerender(
			<ThemeProvider storageKey="key-d" defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Switch in memory to dark
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Changing storageKey while persist=false does not reset current memoryTheme
		rerender(
			<ThemeProvider storageKey="key-e" persist={false} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Changing storageKey when getItem throws preserves memoryTheme
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerender(
			<ThemeProvider storageKey="key-f" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("key-f");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("handles persist prop toggle: false->true reads valid storage or keeps current, true->false keeps current", () => {
		window.localStorage.setItem("theme-persist", "dark");

		// Mount with persist=false
		const { rerender, unmount } = render(
			<ThemeProvider storageKey="theme-persist" persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Flipped false -> true: reads valid stored value "dark"
		rerender(
			<ThemeProvider storageKey="theme-persist" persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Flipped true -> false: only disables persistence, keeps current memory theme
		rerender(
			<ThemeProvider storageKey="theme-persist" persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Mount fresh with persist=false where storage has no valid value
		unmount();
		window.localStorage.removeItem("empty-persist");
		const { rerender: rerenderEmpty } = render(
			<ThemeProvider storageKey="empty-persist" persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Flipped false -> true when storage is empty: keeps current memoryTheme
		rerenderEmpty(
			<ThemeProvider storageKey="empty-persist" persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Flipped false -> true when getItem throws: keeps current memoryTheme
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerenderEmpty(
			<ThemeProvider storageKey="empty-persist" persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		rerenderEmpty(
			<ThemeProvider storageKey="empty-persist" persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("empty-persist");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("handles defaultTheme prop update: updates only if no explicit selection made", () => {
		// 1. Without explicit selection: follows defaultTheme update
		const { rerender, unmount } = render(
			<ThemeProvider persist={false} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		rerender(
			<ThemeProvider persist={false} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");
		unmount();

		// 2. With persist=true and empty storage: follows defaultTheme update
		window.localStorage.removeItem("dyn-theme");
		const { rerender: rerenderPersist } = render(
			<ThemeProvider storageKey="dyn-theme" persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		rerenderPersist(
			<ThemeProvider storageKey="dyn-theme" persist={true} defaultTheme="dark">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// With persist=true and storage read error: defaultTheme update does NOT overwrite memory value
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerenderPersist(
			<ThemeProvider storageKey="dyn-theme" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("dyn-theme");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// 3. Once explicit selection is made, changing defaultTheme does not overwrite selection
		act(() => {
			screen.getByRole("button", { name: "set-light" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		rerenderPersist(
			<ThemeProvider storageKey="dyn-theme" persist={true} defaultTheme="dark">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");
	});

	it("keeps current memoryTheme when storage has new value but no storage event was dispatched during defaultTheme change", () => {
		// Initial mount with empty storage: uses defaultTheme="light"
		window.localStorage.removeItem("unnotified-theme");
		const { rerender } = render(
			<ThemeProvider storageKey="unnotified-theme" persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// External write to storage without event notification
		window.localStorage.setItem("unnotified-theme", "dark");

		// Change default prop to "system"
		const getItemSpy = vi.spyOn(window.localStorage, "getItem");
		rerender(
			<ThemeProvider storageKey="unnotified-theme" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("unnotified-theme");
		getItemSpy.mockRestore();

		// Provider reads stored "dark" (isValidTheme) so does NOT adopt new default "system", retains memory "light"
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");
	});

	it("resets failure state after successful read of new key or re-enabled persistence allowing bare storage updates", () => {
		window.localStorage.setItem("key-fail", "light");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		const { rerender } = render(
			<ThemeProvider storageKey="key-fail" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Attempt setItem -> fails, lastSetFailed is true
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
		setItemSpy.mockRestore();

		// Bare storage event does not roll back because lastSetFailed is true
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Switch to a new key successfully read from storage -> clears lastSetFailed
		window.localStorage.setItem("key-new", "light");
		rerender(
			<ThemeProvider storageKey="key-new" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Now update storage externally and dispatch bare storage event -> should accept update!
		window.localStorage.setItem("key-new", "dark");
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("resets failure state after re-enabling persistence on the same key allowing bare storage updates", () => {
		window.localStorage.setItem("same-key-fail", "light");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		const { rerender } = render(
			<ThemeProvider storageKey="same-key-fail" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Attempt setItem -> fails, lastSetFailed is true
		act(() => {
			screen.getByRole("button", { name: "set-dark" }).click();
		});
		expect(setItemSpy).toHaveBeenCalledWith("same-key-fail", "dark");
		expect(window.localStorage.getItem("same-key-fail")).toBe("light");
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
		setItemSpy.mockRestore();

		// Bare storage event does not roll back because lastSetFailed is true
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Disable persistence
		rerender(
			<ThemeProvider storageKey="same-key-fail" persist={false} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Set valid storage value externally while persist=false
		window.localStorage.setItem("same-key-fail", "light");

		// Re-enable persistence -> reads valid storage "light", clears lastSetFailed
		rerender(
			<ThemeProvider storageKey="same-key-fail" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		// Update storage externally to dark and dispatch bare storage event -> accepts update!
		window.localStorage.setItem("same-key-fail", "dark");
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("ignores storage events for other keys, foreign areas, sessionStorage, or when persist=false, and ignores old key after key change", () => {
		const { rerender } = render(
			<ThemeProvider storageKey="current-key" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Storage event for a different key is ignored
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "other-key" },
				newValue: { value: "dark" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Storage event from sessionStorage is ignored
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-key" },
				newValue: { value: "dark" },
				storageArea: { value: window.sessionStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// Valid storage event updates theme
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-key" },
				newValue: { value: "dark" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Changing storageKey to next-key: events for current-key are now ignored
		rerender(
			<ThemeProvider storageKey="next-key" persist={true} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-key" },
				newValue: { value: "dark" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");

		// When persist is false, all storage events are ignored
		rerender(
			<ThemeProvider storageKey="next-key" persist={false} defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "next-key" },
				newValue: { value: "dark" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("theme-val")).toHaveTextContent("system");
	});

	it.each([
		{
			title: "current key deleted (newValue=null)",
			setup: (key: string) => window.localStorage.setItem(key, "dark"),
			createEvent: (key: string) => {
				const ev = new Event("storage") as StorageEvent;
				Object.defineProperties(ev, {
					key: { value: key },
					newValue: { value: null },
					storageArea: { value: window.localStorage },
				});
				return ev;
			},
		},
		{
			title: "storage cleared (key=null, newValue=null)",
			setup: (key: string) => window.localStorage.setItem(key, "dark"),
			createEvent: () => {
				const ev = new Event("storage") as StorageEvent;
				Object.defineProperties(ev, {
					key: { value: null },
					newValue: { value: null },
					storageArea: { value: window.localStorage },
				});
				return ev;
			},
		},
		{
			title: "current key receives invalid value",
			setup: (key: string) => window.localStorage.setItem(key, "dark"),
			createEvent: (key: string) => {
				const ev = new Event("storage") as StorageEvent;
				Object.defineProperties(ev, {
					key: { value: key },
					newValue: { value: "corrupt-theme-value" },
					storageArea: { value: window.localStorage },
				});
				return ev;
			},
		},
	])("resets to configured default on storage reset: $title", ({ setup, createEvent }) => {
		const testKey = "theme-reset-test";
		setup(testKey);

		render(
			<ThemeProvider storageKey={testKey} persist={true} defaultTheme="light">
				<Probe />
			</ThemeProvider>,
		);
		// Initially loaded "dark" from storage (not default "light")
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");

		// Dispatch reset event
		act(() => {
			window.dispatchEvent(createEvent(testKey));
		});

		// Must revert to configured defaultTheme ("light")
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");
	});

	it("cleans up storage listeners on unmount and responds to matchMedia changes in system mode", () => {
		const matchMediaCallbacks = new Set<() => void>();
		let systemMatches = false;

		vi.spyOn(window, "matchMedia").mockImplementation(
			(query: string) =>
				({
					get matches() {
						return systemMatches;
					},
					media: query,
					onchange: null,
					addListener: vi.fn(),
					removeListener: vi.fn(),
					addEventListener: (_type: string, cb: unknown) => {
						if (typeof cb === "function") {
							matchMediaCallbacks.add(cb as () => void);
						}
					},
					removeEventListener: (_type: string, cb: unknown) => {
						if (typeof cb === "function") {
							matchMediaCallbacks.delete(cb as () => void);
						}
					},
					dispatchEvent: vi.fn(),
				}) as unknown as MediaQueryList,
		);

		let capturedStorageListener: EventListener | null = null;
		const originalAddEventListener = window.addEventListener.bind(window);
		vi.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
			if (type === "storage" && typeof listener === "function") {
				capturedStorageListener = listener as EventListener;
			}
			return originalAddEventListener(
				type,
				listener as EventListenerOrEventListenerObject,
				options,
			);
		});
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

		const { unmount } = render(
			<ThemeProvider defaultTheme="system">
				<Probe />
			</ThemeProvider>,
		);

		expect(capturedStorageListener).not.toBeNull();
		expect(document.documentElement.classList.contains("light")).toBe(true);

		// Trigger system color scheme change
		systemMatches = true;
		act(() => {
			for (const cb of matchMediaCallbacks) cb();
		});
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		systemMatches = false;
		act(() => {
			for (const cb of matchMediaCallbacks) cb();
		});
		expect(document.documentElement.classList.contains("light")).toBe(true);

		// Unmount
		unmount();

		// Storage listener removed with the exact captured callback
		expect(removeEventListenerSpy).toHaveBeenCalledWith("storage", capturedStorageListener);
		// matchMedia callback Set cleaned up
		expect(matchMediaCallbacks.size).toBe(0);

		// matchMedia callback invoking after unmount no longer mutates root
		systemMatches = true;
		act(() => {
			for (const cb of matchMediaCallbacks) cb();
		});
		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});
