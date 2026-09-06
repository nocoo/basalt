import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ACCENT_SWATCHES,
	AccentProvider,
	accentSwatchById,
	applyAccent,
	useAccent,
} from "./accent";

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
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("186 80% 27%");
		expect(document.documentElement.style.getPropertyValue("--basalt-ring")).toBe("186 80% 27%");
		expect(document.documentElement.style.getPropertyValue("--basalt-chart-1")).toBe("");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 100%",
		);
		expect(document.documentElement.dataset.accent).toBe("teal");
	});

	it("pairs light amber with white foreground for derived dark primary contrast", () => {
		applyAccent("amber", false);
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("45 93% 26%");
		expect(document.documentElement.style.getPropertyValue("--basalt-primary-foreground")).toBe(
			"0 0% 100%",
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

	it("ensures applyAccent produces >=4.5:1 contrast for all 24 swatches in both themes without mutating swatches", () => {
		function channel(c: number) {
			return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
		}
		function parseHsl(hsl: string): [number, number, number] {
			const [h, s, l] = hsl.trim().split(/\s+/);
			return [Number(h), Number(s.replace("%", "")) / 100, Number(l.replace("%", "")) / 100];
		}
		function hslToRgb(h: number, s: number, l: number): [number, number, number] {
			const k = (n: number) => (n + h / 30) % 12;
			const a = s * Math.min(l, 1 - l);
			const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
			return [255 * f(0), 255 * f(8), 255 * f(4)];
		}
		function relLum(rgb: [number, number, number]) {
			return (
				0.2126 * channel(rgb[0] / 255) +
				0.7152 * channel(rgb[1] / 255) +
				0.0722 * channel(rgb[2] / 255)
			);
		}
		function contrast(a: [number, number, number], b: [number, number, number]) {
			const la = relLum(a);
			const lb = relLum(b);
			return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
		}
		function over(
			top: [number, number, number, number],
			bottom: [number, number, number],
		): [number, number, number] {
			return [
				top[0] * top[3] + bottom[0] * (1 - top[3]),
				top[1] * top[3] + bottom[1] * (1 - top[3]),
				top[2] * top[3] + bottom[2] * (1 - top[3]),
			];
		}

		const lightSurfaces: [number, number, number][] = [
			[238, 239, 242],
			[246, 247, 248],
			[252, 252, 253],
			[255, 255, 255],
		];
		const darkSurfaces: [number, number, number][] = [
			[23, 23, 23],
			[27, 27, 27],
			[31, 31, 31],
			[36, 36, 36],
		];

		for (const swatch of ACCENT_SWATCHES) {
			for (const dark of [false, true]) {
				applyAccent(swatch.id, dark);
				const primaryHsl = document.documentElement.style.getPropertyValue("--basalt-primary");
				const fgHsl = document.documentElement.style.getPropertyValue(
					"--basalt-primary-foreground",
				);

				const [ph, ps, pl] = parseHsl(primaryHsl);
				const pRgb = hslToRgb(ph, ps, pl);
				const [fh, fs, fl] = parseHsl(fgHsl);
				const fgRgb = hslToRgb(fh, fs, fl);

				const surfaces = dark ? darkSurfaces : lightSurfaces;

				// 1. Text contrast (e.g. link/text using primary color) against L0-L3 surfaces
				for (const bg of surfaces) {
					expect(contrast(pRgb, bg)).toBeGreaterThanOrEqual(4.5);
				}

				// 2. Default button contrast: foreground on primary background
				expect(contrast(fgRgb, pRgb)).toBeGreaterThanOrEqual(4.5);

				// 3. Hover button contrast: foreground on 90% opacity primary composite over L0-L3 surfaces
				for (const bg of surfaces) {
					const hoverBg = over([...pRgb, 0.9], bg);
					expect(contrast(fgRgb, hoverBg)).toBeGreaterThanOrEqual(4.5);
				}
			}
		}

		// Ensure chart swatch raw definitions were not mutated
		expect(ACCENT_SWATCHES[0].light).toBe("217 91% 60%");
		expect(ACCENT_SWATCHES[0].dark).toBe("217 91% 65%");
		expect(ACCENT_SWATCHES[1].light).toBe("200 90% 55%");
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
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("340 82% 45%");
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
		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe("142 71% 27%");

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

	it("falls back to in-memory mode when window.localStorage is undefined and isolates from foreign sessionStorage events", () => {
		const originalDesc = Object.getOwnPropertyDescriptor(window, "localStorage");
		const onAccentChange = vi.fn();
		let unmountInstance: (() => void) | null = null;

		try {
			Object.defineProperty(window, "localStorage", {
				configurable: true,
				enumerable: true,
				value: undefined,
			});

			const { unmount } = render(
				<AccentProvider defaultAccent="sky" onAccentChange={onAccentChange}>
					<Probe />
				</AccentProvider>,
			);
			unmountInstance = unmount;

			// Starts at configured defaultAccent
			expect(screen.getByTestId("accent")).toHaveTextContent("sky");
			expect(document.documentElement.dataset.accent).toBe("sky");

			// User selection changes visible context and document attributes
			act(() => {
				screen.getByRole("button", { name: "pick-rose" }).click();
			});
			expect(onAccentChange).toHaveBeenCalledTimes(1);
			expect(onAccentChange).toHaveBeenCalledWith("rose");
			expect(screen.getByTestId("accent")).toHaveTextContent("rose");
			expect(document.documentElement.dataset.accent).toBe("rose");

			// StorageEvent with real sessionStorage must not revert in-memory selection
			act(() => {
				const event = new Event("storage") as StorageEvent;
				Object.defineProperties(event, {
					key: { value: "basalt-accent" },
					newValue: { value: "sky" },
					storageArea: { value: window.sessionStorage },
				});
				window.dispatchEvent(event);
			});
			expect(screen.getByTestId("accent")).toHaveTextContent("rose");
			expect(document.documentElement.dataset.accent).toBe("rose");
			expect(onAccentChange).toHaveBeenCalledTimes(1);

			// Bare storage event must not revert in-memory selection when storage is missing
			act(() => {
				window.dispatchEvent(new Event("storage"));
			});
			expect(screen.getByTestId("accent")).toHaveTextContent("rose");
			expect(document.documentElement.dataset.accent).toBe("rose");
			expect(onAccentChange).toHaveBeenCalledTimes(1);
		} finally {
			try {
				unmountInstance?.();
			} finally {
				if (originalDesc) {
					Object.defineProperty(window, "localStorage", originalDesc);
				}
			}
		}
	});

	it("ignores same-page basalt:accent-change events with empty detail or non-matching storageKey", () => {
		window.localStorage.setItem("scoped-accent", "sky");
		window.localStorage.setItem("other-accent", "primary");
		const onAccentChange = vi.fn();
		render(
			<AccentProvider
				storageKey="scoped-accent"
				defaultAccent="sky"
				onAccentChange={onAccentChange}
			>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
		expect(document.documentElement.dataset.accent).toBe("sky");

		// Event without detail
		act(() => {
			window.dispatchEvent(new Event("basalt:accent-change"));
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
		expect(onAccentChange).not.toHaveBeenCalled();
		expect(window.localStorage.getItem("scoped-accent")).toBe("sky");
		expect(window.localStorage.getItem("other-accent")).toBe("primary");

		// CustomEvent with non-matching key
		act(() => {
			window.dispatchEvent(
				new CustomEvent("basalt:accent-change", {
					detail: { key: "other-accent", value: "rose", writeSucceeded: true },
				}),
			);
		});
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");
		expect(onAccentChange).not.toHaveBeenCalled();
		expect(document.documentElement.dataset.accent).toBe("sky");
		expect(window.localStorage.getItem("scoped-accent")).toBe("sky");
		expect(window.localStorage.getItem("other-accent")).toBe("primary");
	});

	it("normalizes unknown, null, or undefined accent ids to default primary in provider and utility", () => {
		// 1. Verify accentSwatchById fallback contract
		expect(accentSwatchById(null).id).toBe("primary");
		expect(accentSwatchById(undefined).id).toBe("primary");
		expect(accentSwatchById("non-existent-swatch-id").id).toBe("primary");

		// 2. defaultAccent prop with unknown id normalizes to primary
		const { rerender } = render(
			<AccentProvider defaultAccent="unknown-accent">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");
		expect(document.documentElement.dataset.accent).toBe("primary");

		// 3. controlled accent prop transition: rerender to valid teal first, then invalid unknown id
		rerender(
			<AccentProvider accent="teal">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("teal");
		expect(document.documentElement.dataset.accent).toBe("teal");

		rerender(
			<AccentProvider accent="invalid-swatch-stop">
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("primary");
		expect(document.documentElement.dataset.accent).toBe("primary");
	});

	it("throws outside the provider", () => {
		expect(() => render(<Probe />)).toThrow(/AccentProvider/);
	});
});
