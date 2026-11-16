import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Check } from "./internal-icons";

const BUTTON_DIST = "packages/basalt/dist/components/button.js";

describe("internal icons", () => {
	it("forwards SVG and ARIA attributes while using 1.5 stroke defaults", () => {
		const ref = createRef<SVGSVGElement>();
		const { container } = render(
			<Check
				ref={ref}
				data-testid="check"
				size={20}
				width={16}
				height={18}
				fill="red"
				stroke="blue"
				strokeWidth={2}
				aria-hidden={false}
				aria-labelledby="check-label"
				className="custom"
			/>,
		);
		const svg = container.querySelector("[data-testid='check']");
		expect(svg).toBe(ref.current);
		expect(svg).toHaveAttribute("width", "16");
		expect(svg).toHaveAttribute("height", "18");
		expect(svg).toHaveAttribute("fill", "red");
		expect(svg).toHaveAttribute("stroke", "blue");
		expect(svg).toHaveAttribute("stroke-width", "2");
		expect(svg).toHaveAttribute("aria-hidden", "false");
		expect(svg).toHaveAttribute("aria-labelledby", "check-label");
		expect(svg).toHaveClass("custom");
	});

	it("defaults to 1.5 stroke and hides unnamed icons only", () => {
		const { container, rerender } = render(<Check data-testid="check" />);
		let svg = container.querySelector("[data-testid='check']");
		expect(svg).toHaveAttribute("stroke-width", "1.5");
		expect(svg).toHaveAttribute("aria-hidden", "true");
		rerender(<Check data-testid="check" aria-label="Complete" />);
		svg = container.querySelector("[data-testid='check']");
		expect(svg).not.toHaveAttribute("aria-hidden");
		rerender(<Check data-testid="check" aria-labelledby="complete-label" />);
		expect(container.querySelector("[data-testid='check']")).not.toHaveAttribute("aria-hidden");
	});

	it.skipIf(!existsSync(BUTTON_DIST))("tree-shakes unrelated internal glyphs", () => {
		const script = `
const result = await Bun.build({
  entrypoints: [${JSON.stringify(BUTTON_DIST)}],
  minify: true,
  external: ["react", "react-dom", /^@radix-ui\\//, "class-variance-authority", "clsx", "tailwind-merge"]
});
if (!result.success) process.exit(1);
process.stdout.write(await result.outputs[0].text());
`;
		const result = spawnSync("bun", ["-e", script], { encoding: "utf8" });
		expect(result.status, result.stderr).toBe(0);
		const output = result.stdout;
		expect(output).toContain('"Loader2"');
		expect(output).not.toContain('"Calendar"');
		expect(output).not.toContain('"ChevronRight"');
	});
});
