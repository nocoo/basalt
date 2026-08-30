import { describe, expect, it } from "vitest";
import { rewriteDeclarationText, rewriteRelativeSpecifier } from "../scripts/rewrite-declarations";

describe("declaration specifier rewrite", () => {
	it("rewrites multiline export-from specifiers", () => {
		const source = `export {
  Button,
  LinkButton,
} from "./button";
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(1);
		expect(once.text).toContain('from "./button.js"');
		expect(once.text).not.toContain('from "./button";');
	});

	it("rewrites import type and import from", () => {
		const source = `import type { Theme } from "../providers/theme";
import { cn } from "../utils/cn";
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(2);
		expect(once.text).toContain('from "../providers/theme.js"');
		expect(once.text).toContain('from "../utils/cn.js"');
	});

	it("rewrites import() type queries", () => {
		const source = `type ButtonModule = import("./button").Button;
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(1);
		expect(once.text).toContain('import("./button.js")');
	});

	it("leaves external specifiers unchanged", () => {
		const source = `import * as React from "react";
export { Slot } from "@radix-ui/react-slot";
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(0);
		expect(once.text).toBe(source);
	});

	it("leaves explicit extensions unchanged", () => {
		const source = `export { Button } from "./button.js";
import tokens from "./tokens.css";
export * from "./index.d.ts";
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(0);
		expect(once.text).toBe(source);
	});

	it("is idempotent", () => {
		const source = `export { Button } from "./button";
import type { X } from "../utils/cn";
type M = import("./popover").Popover;
`;
		const once = rewriteDeclarationText(source);
		const twice = rewriteDeclarationText(once.text);
		expect(once.rewritten).toBe(3);
		expect(twice.rewritten).toBe(0);
		expect(twice.text).toBe(once.text);
	});

	it("does not rewrite from inside comments or ordinary strings", () => {
		const source = `// from "./comment"
/* export { X } from "./block" */
declare const note: "from './value'";
export { Button } from "./button";
`;
		const once = rewriteDeclarationText(source);
		expect(once.rewritten).toBe(1);
		expect(once.text).toContain('from "./comment"');
		expect(once.text).toContain('from "./block"');
		expect(once.text).toContain("from './value'");
		expect(once.text).toContain('from "./button.js"');
	});

	it("keeps already-complete relative specifiers", () => {
		expect(rewriteRelativeSpecifier("./button.js")).toBe("./button.js");
		expect(rewriteRelativeSpecifier("react")).toBe("react");
		expect(rewriteRelativeSpecifier("./button")).toBe("./button.js");
	});
});
