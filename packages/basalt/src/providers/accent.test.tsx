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
		expect(onAccentChange).toHaveBeenCalledWith("rose");
		expect(screen.getByTestId("accent")).toHaveTextContent("sky");

		rerender(
			<AccentProvider accent="rose" onAccentChange={onAccentChange}>
				<Probe />
			</AccentProvider>,
		);
		expect(screen.getByTestId("accent")).toHaveTextContent("rose");
	});

	it("does not mutate document styles or dataset when applyToDocument is false", () => {
		document.documentElement.style.setProperty("--basalt-primary", "custom-color");
		delete document.documentElement.dataset.accent;

		render(
			<AccentProvider applyToDocument={false} defaultAccent="rose">
				<Probe />
			</AccentProvider>,
		);

		expect(document.documentElement.style.getPropertyValue("--basalt-primary")).toBe(
			"custom-color",
		);
		expect(document.documentElement.dataset.accent).toBeUndefined();
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

	it("throws outside the provider", () => {
		expect(() => render(<Probe />)).toThrow(/AccentProvider/);
	});
});
