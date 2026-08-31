import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Tabs, TabsList, TabsTrigger } from "../components/tabs";
import { ToggleGroup, ToggleGroupItem } from "../components/toggle-group";
import {
	assignRef,
	SELECTION_INDICATOR_MOTION_CLASS,
	useSelectionIndicator,
} from "./selection-indicator";

const pkgRoot = "packages/basalt";

function sourceOf(rel: string) {
	return readFileSync(path.join(pkgRoot, rel), "utf8");
}

function mockItemBoxes(
	boxes: Record<string, { left: number; width: number; top?: number; height?: number }>,
) {
	const read = (key: "left" | "width" | "top" | "height") =>
		function (this: HTMLElement) {
			const box = boxes[this.textContent?.trim() ?? ""];
			if (!box) {
				return 0;
			}
			if (key === "left") {
				return box.left;
			}
			if (key === "width") {
				return box.width;
			}
			if (key === "top") {
				return box.top ?? 0;
			}
			return box.height ?? 28;
		};
	const spies = [
		vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(read("left")),
		vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(read("width")),
		vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(read("top")),
		vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(read("height")),
	];
	return () => {
		for (const spy of spies) {
			spy.mockRestore();
		}
	};
}

async function flushFrame() {
	await act(async () => {
		await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
	});
}

describe("selection indicator helper", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("assigns function and object refs", () => {
		const fn = vi.fn();
		assignRef(fn, "ok");
		expect(fn).toHaveBeenCalledWith("ok");
		const object = createRef<string>();
		assignRef(object, "held");
		expect(object.current).toBe("held");
	});

	it("is consumed by Tabs and ToggleGroup from utils", () => {
		expect(sourceOf("src/components/tabs.tsx")).toContain('from "../utils/selection-indicator"');
		expect(sourceOf("src/components/tabs.tsx")).toContain("useSelectionIndicator(");
		expect(sourceOf("src/components/toggle-group.tsx")).toContain(
			'from "../utils/selection-indicator"',
		);
		expect(sourceOf("src/components/toggle-group.tsx")).toContain("useSelectionIndicator(");
		expect(existsSync(path.join(pkgRoot, "src/utils/selection-indicator.ts"))).toBe(true);
		expect(existsSync(path.join(pkgRoot, "src/components/selection-indicator.ts"))).toBe(false);
		const pkg = JSON.parse(readFileSync(path.join(pkgRoot, "package.json"), "utf8")) as {
			exports: Record<string, unknown>;
		};
		expect(Object.keys(pkg.exports).some((key) => key.includes("utils"))).toBe(false);
	});

	it.skipIf(!existsSync(path.join(pkgRoot, "dist/utils/selection-indicator.js")))(
		"is not importable through package exports",
		() => {
			expect(existsSync(path.join(pkgRoot, "dist/components/selection-indicator.js"))).toBe(false);
			expect(existsSync(path.join(pkgRoot, "dist/utils/selection-indicator.js"))).toBe(true);
			const result = spawnSync(
				"node",
				[
					"--input-type=module",
					"-e",
					`const specs = [
  "@nocoo/basalt/components/selection-indicator",
  "@nocoo/basalt/utils/selection-indicator",
];
for (const spec of specs) {
  try {
    await import(spec);
    console.error("imported " + spec);
    process.exit(2);
  } catch (error) {
    console.log(spec + " " + (error.code ?? error.message));
  }
}
`,
				],
				{ cwd: pkgRoot, encoding: "utf8" },
			);
			expect(result.status, result.stderr).toBe(0);
			expect(result.stdout).toContain("ERR_MODULE_NOT_FOUND");
			expect(result.stdout).toContain("ERR_PACKAGE_PATH_NOT_EXPORTED");
		},
	);

	it("places the first geometry without a motion class", () => {
		const restore = mockItemBoxes({ Home: { left: 8, width: 40, top: 0, height: 32 } });
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.left).toBe("8px");
		expect(indicator.style.width).toBe("40px");
		expect(indicator.style.top).toBe("32px");
		expect(indicator.className).not.toContain("duration-200");
		restore();
	});

	it("enables 200ms ease-out after a later selection change", async () => {
		const restore = mockItemBoxes({
			Live: { left: 4, width: 40, height: 28 },
			Mock: { left: 50, width: 48, height: 28 },
		});
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		fireEvent.click(screen.getByText("Mock"));
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.left).toBe("50px");
		expect(indicator.style.width).toBe("48px");
		expect(indicator.className).toContain("duration-200");
		expect(indicator.className).toContain("ease-out");
		expect(
			SELECTION_INDICATOR_MOTION_CLASS.split(/\s+/).every((token) =>
				indicator.className.includes(token),
			),
		).toBe(true);
		restore();
	});

	it("cleans observers and pending frames on unmount", () => {
		const disconnectRo = vi.fn();
		const disconnectMo = vi.fn();
		vi.stubGlobal(
			"ResizeObserver",
			class {
				observe() {}
				unobserve() {}
				disconnect = disconnectRo;
			},
		);
		const OriginalMo = window.MutationObserver;
		vi.stubGlobal(
			"MutationObserver",
			class {
				observe() {}
				disconnect = disconnectMo;
				takeRecords() {
					return [];
				}
			},
		);
		const cancel = vi.spyOn(window, "cancelAnimationFrame");
		const { unmount } = render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		unmount();
		expect(disconnectRo).toHaveBeenCalled();
		expect(disconnectMo).toHaveBeenCalled();
		expect(cancel).toHaveBeenCalled();
		vi.stubGlobal("MutationObserver", OriginalMo);
	});

	it("skips geometry transition when reduced motion is preferred", async () => {
		window.matchMedia = ((query: string) => ({
			matches: query.includes("prefers-reduced-motion: reduce"),
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		})) as typeof window.matchMedia;
		const restore = mockItemBoxes({
			Live: { left: 4, width: 40, height: 28 },
			Mock: { left: 50, width: 48, height: 28 },
		});
		const { container } = render(
			<ToggleGroup type="single" defaultValue="live">
				<ToggleGroupItem value="live">Live</ToggleGroupItem>
				<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
			</ToggleGroup>,
		);
		fireEvent.click(screen.getByText("Mock"));
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.width).toBe("48px");
		expect(indicator.className).not.toContain("duration-200");
		restore();
	});
});

function Probe({ selector }: { selector: string }) {
	const { bindRef, state } = useSelectionIndicator({ itemSelector: selector });
	return (
		<div ref={bindRef()}>
			<button type="button" data-state="on">
				On
			</button>
			<span data-testid="box">{`${state.visible}:${state.animated}:${state.width}`}</span>
		</div>
	);
}

describe("useSelectionIndicator", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("stays hidden when no item matches", () => {
		render(<Probe selector='[data-state="missing"]' />);
		expect(screen.getByTestId("box").textContent).toBe("false:false:0");
	});

	it("follows controlled value updates", async () => {
		const restore = mockItemBoxes({
			Live: { left: 4, width: 40, height: 28 },
			Mock: { left: 50, width: 44, height: 28 },
		});
		function Controlled() {
			const [value, setValue] = useState("live");
			return (
				<>
					<button type="button" onClick={() => setValue("mock")}>
						next
					</button>
					<ToggleGroup type="single" value={value} onValueChange={setValue}>
						<ToggleGroupItem value="live">Live</ToggleGroupItem>
						<ToggleGroupItem value="mock">Mock</ToggleGroupItem>
					</ToggleGroup>
				</>
			);
		}
		const { container } = render(<Controlled />);
		fireEvent.click(screen.getByText("next"));
		await flushFrame();
		const indicator = container.querySelector('[data-slot="selection-indicator"]') as HTMLElement;
		expect(indicator.style.left).toBe("50px");
		expect(indicator.style.width).toBe("44px");
		restore();
	});
});
