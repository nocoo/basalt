import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCENT_SWATCHES, AccentProvider, applyAccent, useAccent } from "./accent";

function Probe() {
	const { accent, setAccent, swatches } = useAccent();
	return (
		<div>
			<span data-testid="accent">{accent}</span>
			<button type="button" onClick={() => setAccent(swatches[2].id)}>
				pick
			</button>
			<button type="button" onClick={() => setAccent("rose")}>
				pick-rose
			</button>
		</div>
	);
}

describe("accent", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		window.localStorage.clear();
		document.documentElement.style.removeProperty("--basalt-primary");
		document.documentElement.style.removeProperty("--basalt-primary-foreground");
		document.documentElement.style.removeProperty("--basalt-ring");
		delete document.documentElement.dataset.accent;
	});

	it("applies primary and ring from the theme palette swatch", () => {
		applyAccent("teal", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("186 80% 45%");
		expect(document.documentElement.style.getPropertyValue("--basalt-ring")).toBe("186 80% 45%");
		expect(document.documentElement.style.getPropertyValue("--basalt-chart-1")).toBe("");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 10%",
		);
		expect(document.documentElement.dataset.accent).toBe("teal");
	});

	it("pairs light amber with dark foreground for contrast", () => {
		applyAccent("amber", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 10%",
		);
	});

	it("uses the dark stop when the page is dark", () => {
		applyAccent("green", true);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 71% 50%");
	});

	it("exposes every visualization color as a theme swatch", () => {
		expect(ACCENT_SWATCHES).toHaveLength(24);
		expect(ACCENT_SWATCHES.map((swatch) => swatch.token)).toEqual(
			Array.from({ length: 24 }, (_, index) => `--basalt-chart-${index + 1}`),
		);
	});

	it("persists the chosen swatch", () => {
		window.localStorage.removeItem("basalt-accent");
		render(
			<AccentProvider>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");
		act(() => {
			screen.getByRole("button", { name: "pick" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent(ACCENT_SWATCHES[2].id);
		expect(window.localStorage.getItem("basalt-accent")).toBe(ACCENT_SWATCHES[2].id);
	});

	it("switches accent in memory when setItem throws and survives bare storage events", () => {
		window.localStorage.setItem("basalt-accent", "primary");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		render(
			<AccentProvider>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});

		expect(setItemSpy).toHaveBeenCalledWith("basalt-accent", "rose");
		setItemSpy.mockRestore();
		expect(window.localStorage.getItem("basalt-accent")).toBe("primary");

		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
		expect(document.documentElement.dataset.accent).toBe("rose");

		// Bare storage event does not revert memory state
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("syncs rose across multiple providers on same page even when setItem rejects, and survives bare storage", () => {
		window.localStorage.setItem("basalt-accent", "primary");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		function MultiProbe() {
			return (
				<div>
					<AccentProvider>
						<div data-testid="p1">
							<Probe />
						</div>
					</AccentProvider>
					<AccentProvider>
						<div data-testid="p2">
							<Probe />
						</div>
					</AccentProvider>
				</div>
			);
		}

		render(<MultiProbe />);

		const p1 = screen.getByTestId("p1");
		const p2 = screen.getByTestId("p2");

		expect(p1.querySelector("[data-testid='accent']")).toHaveTextContent("primary");
		expect(p2.querySelector("[data-testid='accent']")).toHaveTextContent("primary");

		// Provider 1 triggers pick-rose, setItem rejects
		act(() => {
			const roseBtn = p1.querySelector("button:nth-of-type(2)") as HTMLButtonElement;
			roseBtn.click();
		});

		expect(setItemSpy).toHaveBeenCalled();
		setItemSpy.mockRestore();
		expect(window.localStorage.getItem("basalt-accent")).toBe("primary");

		// Both providers must be rose in memory
		expect(p1.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
		expect(p2.querySelector("[data-testid='accent']")).toHaveTextContent("rose");

		// Bare storage event does not roll either back to stale localStorage ("primary")
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(p1.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
		expect(p2.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
	});

	it("survives complete storage denial (getItem and setItem throw)", () => {
		vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});

		render(
			<AccentProvider defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("does not touch localStorage when persist is false", () => {
		const getItemSpy = vi.spyOn(window.localStorage, "getItem");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");

		render(
			<AccentProvider persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(getItemSpy).not.toHaveBeenCalled();
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(setItemSpy).not.toHaveBeenCalled();
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("isolates persist=true and persist=false providers with same key on same page", () => {
		window.localStorage.setItem("basalt-accent", "primary");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem");

		function MixedProbe() {
			return (
				<div>
					<AccentProvider persist={true} defaultAccent="primary">
						<div data-testid="persistent">
							<Probe />
						</div>
					</AccentProvider>
					<AccentProvider persist={false} defaultAccent="sky">
						<div data-testid="ephemeral">
							<Probe />
						</div>
					</AccentProvider>
				</div>
			);
		}

		render(<MixedProbe />);

		const persistent = screen.getByTestId("persistent");
		const ephemeral = screen.getByTestId("ephemeral");

		expect(persistent.querySelector("[data-testid='accent']")).toHaveTextContent("primary");
		expect(ephemeral.querySelector("[data-testid='accent']")).toHaveTextContent("sky");

		// Switching ephemeral does not touch localStorage and does not affect persistent provider
		act(() => {
			const roseBtn = ephemeral.querySelector("button:nth-of-type(2)") as HTMLButtonElement;
			roseBtn.click();
		});
		expect(ephemeral.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
		expect(persistent.querySelector("[data-testid='accent']")).toHaveTextContent("primary");
		expect(setItemSpy).not.toHaveBeenCalled();
		expect(window.localStorage.getItem("basalt-accent")).toBe("primary");

		// Switching persistent writes storage and does not affect ephemeral provider
		act(() => {
			const roseBtn = persistent.querySelector("button:nth-of-type(2)") as HTMLButtonElement;
			roseBtn.click();
		});
		expect(persistent.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
		expect(ephemeral.querySelector("[data-testid='accent']")).toHaveTextContent("rose");
		expect(setItemSpy).toHaveBeenCalledWith("basalt-accent", "rose");
		expect(window.localStorage.getItem("basalt-accent")).toBe("rose");
	});

	it("preserves selection on bare storage event when only getItem rejects but setItem succeeded", () => {
		window.localStorage.setItem("basalt-accent", "primary");

		render(
			<AccentProvider defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Switch to rose (setItem succeeds)
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
		expect(window.localStorage.getItem("basalt-accent")).toBe("rose");

		// Now only getItem throws (e.g. read permission revoked or error)
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});

		// Bare storage event dispatch
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});

		expect(getItemSpy).toHaveBeenCalledWith("basalt-accent");
		// Must preserve current cached accent ("rose") rather than reverting to defaultAccent ("sky")
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("reverts to default on bare storage event when storage contains invalid non-null value", () => {
		window.localStorage.setItem("basalt-accent", "primary");

		render(
			<AccentProvider defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Switch to rose
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Simulate external write of corrupt / invalid accent into storage
		window.localStorage.setItem("basalt-accent", "invalid-accent-stop");

		// Dispatch bare storage event
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});

		// Must revert to defaultAccent ("sky")
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
	});

	it("supports controlled accent where setAccent notifies onAccentChange without internal change", () => {
		const onAccentChange = vi.fn();
		const { rerender } = render(
			<AccentProvider accent="sky" onAccentChange={onAccentChange}>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(onAccentChange).toHaveBeenCalledTimes(1);
		expect(onAccentChange).toHaveBeenCalledWith("rose");
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		// Parent re-renders with next controlled value; must not trigger onChange callback
		rerender(
			<AccentProvider accent="rose" onAccentChange={onAccentChange}>
				<Probe />
			</AccentProvider>,
		);
		expect(onAccentChange).toHaveBeenCalledTimes(1);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("does not mutate document styles or dataset when applyToDocument is false and applies when toggled true", () => {
		document.documentElement.style.setProperty("--basalt-primary", "custom-color");
		delete document.documentElement.dataset.accent;

		const { rerender } = render(
			<AccentProvider applyToDocument={false} defaultAccent="rose">
				<Probe />
			</AccentProvider>,
		);

		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe(
			"custom-color",
		);
		expect(document.documentElement.dataset.accent).toBeUndefined();

		// Toggling applyToDocument false -> true applies the accent
		rerender(
			<AccentProvider applyToDocument={true} defaultAccent="rose">
				<Probe />
			</AccentProvider>,
		);
		expect(document.documentElement.dataset.accent).toBe("rose");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("340 82% 55%");
	});

	it("supports custom storageKey and cross-tab storage sync", () => {
		window.localStorage.setItem("custom-accent", "teal");
		render(
			<AccentProvider storageKey="custom-accent">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "custom-accent" },
				newValue: { value: "rose" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("handles storageKey prop update: reads new valid key, reverts on missing/invalid, ignores read error", () => {
		window.localStorage.setItem("key-a", "teal");
		window.localStorage.setItem("key-b", "amber");
		window.localStorage.setItem("key-c", "invalid-accent-id");

		const { rerender } = render(
			<AccentProvider storageKey="key-a" defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		// Switch to key-b which has "amber"
		rerender(
			<AccentProvider storageKey="key-b" defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("amber");

		// Switch to key-c which has invalid value -> reverts to defaultAccent "primary"
		rerender(
			<AccentProvider storageKey="key-c" defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Switch to key-d which is missing -> reverts to defaultAccent "primary"
		rerender(
			<AccentProvider storageKey="key-d" defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Switch in memory to rose
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Changing storageKey while persist=false does not reset current memoryAccent
		rerender(
			<AccentProvider storageKey="key-e" persist={false} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Changing storageKey when getItem throws preserves memoryAccent
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerender(
			<AccentProvider storageKey="key-f" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("key-f");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("handles persist prop toggle: false->true reads valid storage or keeps current, true->false keeps current", () => {
		window.localStorage.setItem("accent-persist", "rose");

		// Mount with persist=false
		const { rerender, unmount } = render(
			<AccentProvider storageKey="accent-persist" persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		// Flipped false -> true: reads valid stored value "rose"
		rerender(
			<AccentProvider storageKey="accent-persist" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Flipped true -> false: only disables persistence, keeps current memory accent
		rerender(
			<AccentProvider storageKey="accent-persist" persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Mount fresh with persist=false where storage has no valid value
		unmount();
		window.localStorage.removeItem("empty-accent-persist");
		const { rerender: rerenderEmpty } = render(
			<AccentProvider storageKey="empty-accent-persist" persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Flipped false -> true when storage is empty: keeps current memoryAccent
		rerenderEmpty(
			<AccentProvider storageKey="empty-accent-persist" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Flipped false -> true when getItem throws: keeps current memoryAccent
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerenderEmpty(
			<AccentProvider storageKey="empty-accent-persist" persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		rerenderEmpty(
			<AccentProvider storageKey="empty-accent-persist" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("empty-accent-persist");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("handles defaultAccent prop update: updates only if no explicit selection made", () => {
		// 1. Without explicit selection: follows defaultAccent update
		const { rerender, unmount } = render(
			<AccentProvider persist={false} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		rerender(
			<AccentProvider persist={false} defaultAccent="teal">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");
		unmount();

		// 2. With persist=true and empty storage: follows defaultAccent update
		window.localStorage.removeItem("dyn-accent");
		const { rerender: rerenderPersist } = render(
			<AccentProvider storageKey="dyn-accent" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		rerenderPersist(
			<AccentProvider storageKey="dyn-accent" persist={true} defaultAccent="rose">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// With persist=true and storage read error: defaultAccent update does NOT overwrite memory value
		const getItemSpy = vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
			throw new DOMException("SecurityError", "SecurityError");
		});
		rerenderPersist(
			<AccentProvider storageKey="dyn-accent" persist={true} defaultAccent="teal">
				<Probe />
			</AccentProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("dyn-accent");
		getItemSpy.mockRestore();
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// 3. Once explicit selection is made, changing defaultAccent does not overwrite selection
		act(() => {
			screen.getByRole("button", { name: "pick" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent(ACCENT_SWATCHES[2].id);

		rerenderPersist(
			<AccentProvider storageKey="dyn-accent" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent(ACCENT_SWATCHES[2].id);
	});

	it("keeps current memoryAccent when storage has new value but no storage event was dispatched during defaultAccent change", () => {
		// Initial mount with empty storage: uses defaultAccent="sky"
		window.localStorage.removeItem("unnotified-accent");
		const { rerender } = render(
			<AccentProvider storageKey="unnotified-accent" persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		// External write to storage without event notification
		window.localStorage.setItem("unnotified-accent", "rose");

		// Change default prop to "teal"
		const getItemSpy = vi.spyOn(window.localStorage, "getItem");
		rerender(
			<AccentProvider storageKey="unnotified-accent" persist={true} defaultAccent="teal">
				<Probe />
			</AccentProvider>,
		);
		expect(getItemSpy).toHaveBeenCalledWith("unnotified-accent");
		getItemSpy.mockRestore();

		// Provider reads stored "rose" (isValidAccentId) so does NOT adopt new default "teal", retains memory "sky"
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
	});

	it("resets failure state after successful read of new key or re-enabled persistence allowing bare storage updates", () => {
		window.localStorage.setItem("key-fail", "teal");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		const { rerender } = render(
			<AccentProvider storageKey="key-fail" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		// Attempt setItem -> fails, lastSetFailed is true
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
		setItemSpy.mockRestore();

		// Bare storage event does not roll back because lastSetFailed is true
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Switch to a new key successfully read from storage -> clears lastSetFailed
		window.localStorage.setItem("key-new", "teal");
		rerender(
			<AccentProvider storageKey="key-new" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		// Now update storage externally and dispatch bare storage event -> should accept update!
		window.localStorage.setItem("key-new", "rose");
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("resets failure state after re-enabling persistence on the same key allowing bare storage updates", () => {
		window.localStorage.setItem("same-key-fail", "teal");
		const setItemSpy = vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
			throw new DOMException("QuotaExceededError", "QuotaExceededError");
		});

		const { rerender } = render(
			<AccentProvider storageKey="same-key-fail" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		// Attempt setItem -> fails, lastSetFailed is true
		act(() => {
			screen.getByRole("button", { name: "pick-rose" }).click();
		});
		expect(setItemSpy).toHaveBeenCalledWith("same-key-fail", "rose");
		expect(window.localStorage.getItem("same-key-fail")).toBe("teal");
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
		setItemSpy.mockRestore();

		// Bare storage event does not roll back because lastSetFailed is true
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Disable persistence
		rerender(
			<AccentProvider storageKey="same-key-fail" persist={false} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Set valid storage value externally while persist=false
		window.localStorage.setItem("same-key-fail", "teal");

		// Re-enable persistence -> reads valid storage "teal", clears lastSetFailed
		rerender(
			<AccentProvider storageKey="same-key-fail" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");

		// Update storage externally to rose and dispatch bare storage event -> accepts update!
		window.localStorage.setItem("same-key-fail", "rose");
		act(() => {
			window.dispatchEvent(new Event("storage"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("ignores storage events for other keys, foreign areas, sessionStorage, or when persist=false, and ignores old key after key change", () => {
		const { rerender } = render(
			<AccentProvider storageKey="current-accent-key" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Storage event for a different key is ignored
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "other-key" },
				newValue: { value: "rose" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Storage event from sessionStorage is ignored
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-accent-key" },
				newValue: { value: "rose" },
				storageArea: { value: window.sessionStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// Valid storage event updates accent
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-accent-key" },
				newValue: { value: "rose" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Changing storageKey to next-accent-key: events for current-accent-key are now ignored
		rerender(
			<AccentProvider storageKey="next-accent-key" persist={true} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "current-accent-key" },
				newValue: { value: "rose" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");

		// When persist is false, all storage events are ignored
		rerender(
			<AccentProvider storageKey="next-accent-key" persist={false} defaultAccent="primary">
				<Probe />
			</AccentProvider>,
		);
		act(() => {
			const event = new Event("storage") as StorageEvent;
			Object.defineProperties(event, {
				key: { value: "next-accent-key" },
				newValue: { value: "rose" },
				storageArea: { value: window.localStorage },
			});
			window.dispatchEvent(event);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");
	});

	it.each([
		{
			title: "current key deleted (newValue=null)",
			setup: (key: string) => window.localStorage.setItem(key, "rose"),
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
			setup: (key: string) => window.localStorage.setItem(key, "rose"),
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
			setup: (key: string) => window.localStorage.setItem(key, "rose"),
			createEvent: (key: string) => {
				const ev = new Event("storage") as StorageEvent;
				Object.defineProperties(ev, {
					key: { value: key },
					newValue: { value: "invalid-accent-color" },
					storageArea: { value: window.localStorage },
				});
				return ev;
			},
		},
	])("resets to configured default on storage reset: $title", ({ setup, createEvent }) => {
		const testKey = "accent-reset-test";
		setup(testKey);

		render(
			<AccentProvider storageKey={testKey} persist={true} defaultAccent="sky">
				<Probe />
			</AccentProvider>,
		);
		// Initially loaded "rose" from storage (not default "sky")
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");

		// Dispatch reset event
		act(() => {
			window.dispatchEvent(createEvent(testKey));
		});

		// Must revert to configured defaultAccent ("sky")
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
	});

	it("disconnects mutation observer on unmount and responds to document dark class changes", async () => {
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
			<AccentProvider defaultAccent="green">
				<Probe />
			</AccentProvider>,
		);

		expect(capturedStorageListener).not.toBeNull();
		expect(document.documentElement.dataset.accent).toBe("green");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 71% 45%");

		// Toggle dark class on documentElement
		act(() => {
			document.documentElement.classList.add("dark");
		});

		// Allow MutationObserver callback to run
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});

		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 71% 50%");

		// Unmount provider
		unmount();

		// Storage listener removed with identical reference
		expect(removeEventListenerSpy).toHaveBeenCalledWith("storage", capturedStorageListener);

		// Mutating class after unmount: should not alter accent properties
		document.documentElement.style.setProperty("--basalt-primary", "custom-color");
		act(() => {
			document.documentElement.classList.remove("dark");
		});
		await act(async () => {
			await new Promise((resolve) => setTimeout(resolve, 0));
		});
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe(
			"custom-color",
		);

		// Cleanup root attributes
		document.documentElement.className = "";
		delete document.documentElement.dataset.accent;
		document.documentElement.style.removeProperty("--basalt-primary");
	});

	it("throws outside the provider", () => {
		expect(() => render(<Probe />)).toThrow(/AccentProvider/);
	});
});
