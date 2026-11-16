import { catalogContentFamily } from "../../catalog-content";
import { DOCK_EXAMPLES } from "../../examples/dock";
import { FAB_EXAMPLES } from "../../examples/fab";
import { API as dockApi } from "../../generated/catalog-api/dock";
import { API as fabApi } from "../../generated/catalog-api/fab";

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

export default catalogContentFamily({
	fab: {
		docs: {
			description: "A corner launcher that hides while a dock is open.",
			usage: usage(
				"Fab",
				"@nocoo/basalt/components/fab",
				'<Fab aria-label="Open assistant"><Sparkles /></Fab>',
				'import { Sparkles } from "@nocoo/basalt/icons";',
			),
			variants: [],
			api: fabApi,
		},
		examples: FAB_EXAMPLES,
	},
	dock: {
		docs: {
			description:
				"A right rail. Push shrinks the main column. Overlay covers the local region with a non-modal scrim.",
			usage: usage(
				"Dock, DockBody",
				"@nocoo/basalt/components/dock",
				'<Dock open aria-label="Assistant"><DockBody>Panel</DockBody></Dock>',
			),
			variants: [],
			api: dockApi,
		},
		examples: DOCK_EXAMPLES,
	},
});
