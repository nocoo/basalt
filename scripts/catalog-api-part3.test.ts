import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixture, fixtureProps, generateFixture, repoRoot } from "./catalog-api-test-helpers";

describe("catalog API generator contract 3/4", () => {
	it("fails on an empty component-specific result", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export interface WidgetProps extends Dom {}
`,
		});
		expect(() => generateFixture(root)).toThrow(/empty result for widget/);
	});

	it("fails when a local prop impersonates a cross-file prop", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
export interface WidgetProps extends Other {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("emits a local className after omitting it from a foreign DOM-like type", () => {
		const root = fixture({
			"dom.ts": `export interface Dom {
	className?: string;
	id?: string;
}
`,
			"widget.ts": `import type { Dom } from "./dom";
export type WidgetProps = Omit<Dom, "className"> & {
	className?: string;
};
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "className", type: "string", required: false }]);
	});

	it("still rejects a local className that impersonates a foreign DOM-like prop", () => {
		const root = fixture({
			"dom.ts": "export interface Dom { className?: string }",
			"widget.ts": `import type { Dom } from "./dom";
export type WidgetProps = Dom & {
	className?: string;
};
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: className/);
	});

	it("rejects a private WidgetProps type", () => {
		const root = fixture({
			"widget.ts": `export interface OtherStuff { x?: boolean }
interface WidgetProps { a?: boolean }
`,
		});
		expect(() => generateFixture(root)).toThrow(/not exported type WidgetProps/);
	});

	it("accepts a type exported only through an export list", () => {
		const root = fixture({
			"widget.ts": `interface WidgetProps {
	tone?: "a" | "b";
}
export type { WidgetProps };
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("preserves nested generic arguments on aliases", () => {
		const root = fixture({
			"widget.ts": `export type Box<T> = { value: T };
export interface WidgetProps {
	box?: Box<string>;
	nested?: Box<Box<string>>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "Box<string>", required: false },
			{ name: "nested", type: "Box<Box<string>>", required: false },
		]);
	});

	it("pierces local aliases when detecting cross-file impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type LocalOther = Other;
export interface WidgetProps extends LocalOther {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("pierces multilayer interface aliases when detecting impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
interface Mid extends Other {}
interface Top extends Mid {}
export interface WidgetProps extends Top {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("accepts a renamed local export", () => {
		const root = fixture({
			"widget.ts": `interface Inner {
	tone?: "a" | "b";
}
export type { Inner as WidgetProps };
`,
		});
		expect(fixtureProps(root)).toEqual([{ name: "tone", type: '"a" | "b"', required: false }]);
	});

	it("rejects an external re-export of the props type", () => {
		const root = fixture({
			"other.ts": "export interface WidgetProps { value?: string }",
			"widget.ts": `export type { WidgetProps } from "./other";
`,
		});
		expect(() => generateFixture(root)).toThrow(/not declared in/);
	});

	it("keeps explicit type arguments that match parameter defaults", () => {
		const root = fixture({
			"widget.ts": `export type Defaulted<T = string> = { value: T };
export interface WidgetProps {
	explicit?: Defaulted<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "explicit", type: "Defaulted<string>", required: false },
		]);
	});

	it("keeps nested undefined and null inside generic arguments", () => {
		const root = fixture({
			"widget.ts": `export type Box<T> = { value: T };
export interface WidgetProps {
	maybe?: Box<string | undefined>;
	nullable?: Box<string | null>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "maybe", type: "Box<string | undefined>", required: false },
			{ name: "nullable", type: "Box<string | null>", required: false },
		]);
	});

	it("keeps nested undefined inside React generics with a React prefix", () => {
		const root = fixture(
			{
				"widget.ts": `import type { ReactElement } from "react";
export interface WidgetProps {
	el?: ReactElement<string | undefined>;
}
`,
			},
			{
				compilerOptions: {
					baseUrl: ".",
					paths: {
						react: [path.join(repoRoot, "node_modules/@types/react")],
					},
				},
			},
		);
		expect(fixtureProps(root)).toEqual([
			{
				name: "el",
				type: "React.ReactElement<string | undefined>",
				required: false,
			},
		]);
	});

	it("qualifies namespace imports of same-named exported aliases", () => {
		const root = fixture({
			"a.ts": "export type Box<T> = { a: T };\n",
			"b.ts": "export type Box<T> = { b: T };\n",
			"widget.ts": `import type * as A from "./a";
import type * as B from "./b";
export interface WidgetProps {
	box?: A.Box<string> | B.Box<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "A.Box<string> | B.Box<string>", required: false },
		]);
	});

	it("qualifies same-named local namespaces in a union", () => {
		const root = fixture({
			"widget.ts": `export namespace A {
	export type Box<T> = { a: T };
}
export namespace B {
	export type Box<T> = { b: T };
}
export interface WidgetProps {
	box?: A.Box<string> | B.Box<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "A.Box<string> | B.Box<string>", required: false },
		]);
	});

	it("rejects impersonation through identity generic aliases", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Identity<T> = T;
export interface WidgetProps extends Identity<Identity<Other>> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through layered generic aliases", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Identity<T> = T;
type Layer<T> = Identity<T>;
export interface WidgetProps extends Layer<Other> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a local union alias", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Mix = Other | { localOnly?: boolean };
export type WidgetProps = Mix & { value?: string };
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a tuple-index alias", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type First<T> = [T][0];
export interface WidgetProps extends First<Other> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("rejects impersonation through a mixed type-query generic", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
const local = { localOnly: true };
type Pair<Left, Right> = Left;
export interface WidgetProps extends Pair<Other, typeof local> {
	value?: string;
}
`,
		});
		expect(() => generateFixture(root)).toThrow(/cross-file prop impersonation: value/);
	});

	it("instantiates Holder generic field types without treating value-type members as heritage", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type Holder<T> = { data?: T };
export interface WidgetProps extends Holder<Other> {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "data", type: "Other", required: false },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("instantiates List generic array elements without heritage impersonation", () => {
		const root = fixture({
			"other.ts": "export interface Other { value?: string }",
			"widget.ts": `import type { Other } from "./other";
type List<T> = { items?: T[] };
export interface WidgetProps extends List<Other> {
	value?: string;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "items", type: "Other[]", required: false },
			{ name: "value", type: "string", required: false },
		]);
	});

	it("keeps named import aliases for generic props", () => {
		const root = fixture({
			"box.ts": "export type Box<T> = { a: T };\n",
			"widget.ts": `import type { Box as RenamedBox } from "./box";
export interface WidgetProps {
	box?: RenamedBox<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "RenamedBox<string>", required: false },
		]);
	});

	it("distinguishes renamed named imports of same-named aliases in a union", () => {
		const root = fixture({
			"a.ts": "export type Box<T> = { a: T };\n",
			"b.ts": "export type Box<T> = { b: T };\n",
			"widget.ts": `import type { Box as ABox } from "./a";
import type { Box as BBox } from "./b";
export interface WidgetProps {
	box?: ABox<string> | BBox<string>;
}
`,
		});
		expect(fixtureProps(root)).toEqual([
			{ name: "box", type: "ABox<string> | BBox<string>", required: false },
		]);
	});
});
