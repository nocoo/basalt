import assert from "node:assert/strict";
import type { Locator, Page } from "playwright";

/** Measure painted text/marks against their real surface, including alpha layers. */
export async function measureChartContrast(
	page: Page,
	selector: string,
	property: "text" | "fill" | "stroke" = "text",
) {
	return page.locator(selector).evaluateAll((nodes, property) => {
		const canvas = document.createElement("canvas");
		canvas.width = canvas.height = 1;
		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) throw new Error("Contrast measurement requires canvas");
		const rgba = (color: string) => {
			context.clearRect(0, 0, 1, 1);
			context.fillStyle = color;
			context.fillRect(0, 0, 1, 1);
			return [...context.getImageData(0, 0, 1, 1).data].map((n, i) => (i === 3 ? n / 255 : n));
		};
		const over = (top: number[], bottom: number[]) =>
			top.slice(0, 3).map((n, i) => n * top[3] + bottom[i] * (1 - top[3]));
		const luminance = (rgb: number[]) =>
			rgb.reduce((sum, n, i) => {
				const c = n / 255;
				return (
					sum +
					(c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4) * [0.2126, 0.7152, 0.0722][i]
				);
			}, 0);
		return nodes.flatMap((node) => {
			if (property === "text" && !node.textContent?.trim()) return [];
			const style = getComputedStyle(node);
			const box = node.getBoundingClientRect();
			if (!box.width || !box.height || style.visibility !== "visible" || style.display === "none")
				return [];
			const color =
				property === "text"
					? node instanceof SVGElement
						? style.fill
						: style.color
					: style[property];
			if (color === "none" || color.startsWith("url(")) return [];
			const chain: Element[] = [];
			for (let parent: Element | null = node; parent; parent = parent.parentElement)
				chain.unshift(parent);
			let background = [255, 255, 255];
			let opacity = 1;
			for (const parent of chain) {
				const paint = getComputedStyle(parent);
				background = over(rgba(paint.backgroundColor), background);
				opacity *= Number(paint.opacity);
			}
			const foreground = rgba(color);
			foreground[3] *=
				opacity *
				Number(
					property === "stroke"
						? style.strokeOpacity
						: node instanceof SVGElement
							? style.fillOpacity
							: 1,
				);
			if (foreground[3] === 0) return [];
			const a = luminance(over(foreground, background));
			const b = luminance(background);
			return [
				{
					label: (node.textContent?.trim() || node.getAttribute("class") || node.tagName).slice(
						0,
						100,
					),
					color,
					background,
					ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
				},
			];
		});
	}, property);
}

/** The remainder is a neutral full ring; the value is a proportional colored arc. */
export async function assertGaugeAppearance(container: Locator, value: number) {
	const track = container.locator(".recharts-radial-bar-background-sector");
	await track.waitFor({ state: "attached" });
	const evidence = await container.evaluate((node) => {
		const track = node.querySelector<SVGPathElement>(".recharts-radial-bar-background-sector");
		if (!track) throw new Error("Gauge track missing");
		const probe = document.createElement("span");
		probe.style.color = "hsl(var(--basalt-chart-muted))";
		node.appendChild(probe);
		const expectedFill = getComputedStyle(probe).color;
		probe.remove();
		const values = [...node.querySelectorAll<SVGPathElement>(".recharts-radial-bar-sector")];
		return {
			fill: getComputedStyle(track).fill,
			expectedFill,
			trackLength: track.getTotalLength(),
			valueLengths: values.map((path) => path.getTotalLength()),
			paths: values.map((path) => path.getAttribute("d")),
		};
	});
	assert.equal(
		evidence.fill,
		evidence.expectedFill,
		"Gauge remainder must use the active theme track",
	);
	assert.notEqual(evidence.fill, "rgb(0, 0, 0)", "Gauge remainder must not fall back to black");
	assert.ok(evidence.trackLength > 100, "Gauge track must have a full positive ring");
	if (value === 0)
		assert.equal(
			evidence.valueLengths.reduce((sum, n) => sum + n, 0),
			0,
		);
	else {
		assert.equal(evidence.valueLengths.length, 1);
		const fraction = evidence.valueLengths[0] / evidence.trackLength;
		assert.ok(
			Math.abs(fraction - value / 100) < 0.1,
			`Gauge ${value}% arc has perimeter ratio ${fraction}`,
		);
	}
	return evidence;
}
