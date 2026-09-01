import { EXTRA_DOCS } from "./catalog-ready";
import {
	type CatalogDocs,
	type CatalogDocsDraft,
	catalogDocsWithImplementation,
	provenanceFromLegacy,
} from "./catalog-source";
import { CATALOG_API } from "./generated/catalog-api";

export type { CatalogDocs };

function usage(name: string, from: string, sample: string, extraImports = ""): string {
	const extras = extraImports ? `${extraImports}\n` : "";
	return `${extras}import { ${name} } from "${from}";\n\nexport default function Example() {\n\treturn ${sample};\n}`;
}

const BASE_DOCS: Record<string, CatalogDocsDraft> = {
	tooltip: {
		description: "Short contextual help on hover or focus.",
		usage: usage(
			"Tooltip, TooltipTrigger, TooltipContent, TooltipProvider",
			"@nocoo/basalt/components/tooltip",
			"<TooltipProvider><Tooltip><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Hint</TooltipContent></Tooltip></TooltipProvider>",
			'import { Button } from "@nocoo/basalt/components/button";',
		),
		variants: [],
		api: CATALOG_API.tooltip,
		provenance: provenanceFromLegacy({
			repo: "pew",
			sha: "97a890fabe6e",
			file: "packages/web/src/components/ui/tooltip.tsx",
		}),
	},
};

export const CATALOG_DOCS: Record<string, CatalogDocs> = catalogDocsWithImplementation({
	...EXTRA_DOCS,
	...BASE_DOCS,
});
