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
		expect(onThemeChange).toHaveBeenCalledWith("dark");
		// Unchanged until parent updates prop
		expect(screen.getByTestId("theme-val")).toHaveTextContent("light");

		rerender(
			<ThemeProvider theme="dark" onThemeChange={onThemeChange}>
				<Probe />
			</ThemeProvider>,
		);
		expect(screen.getByTestId("theme-val")).toHaveTextContent("dark");
	});

	it("does not mutate document.documentElement when applyToDocument is false", () => {
		document.documentElement.className = "host-class";
		delete document.documentElement.dataset.mode;

		render(
			<ThemeProvider applyToDocument={false} defaultTheme="dark">
				<Probe />
			</ThemeProvider>,
		);

		expect(document.documentElement.className).toBe("host-class");
		expect(document.documentElement.dataset.mode).toBeUndefined();
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
});
