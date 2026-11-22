import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@nocoo/basalt/components/collapsible";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Loader } from "@nocoo/basalt/components/loader";
import { Meter } from "@nocoo/basalt/components/meter";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { Component, type ComponentType, type ReactNode, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { MicroSceneWall } from "@/components/showcase/MicroSceneWall";
import { SurfaceDisciplineInspector } from "@/components/showcase/SurfaceDisciplineInspector";
import { TEMPLATE_MANIFEST } from "@/models/template-manifest";

declare global {
	interface Window {
		__basaltFailures?: Record<string, string>;
		__basaltExamplesDone?: boolean;
	}
}

type Panel = { key: string; component: ComponentType };

class PanelBoundary extends Component<
	{ name: string; failures: Record<string, string>; children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	componentDidCatch(error: unknown) {
		this.props.failures[this.props.name] = error instanceof Error ? error.message : String(error);
	}
	render() {
		return this.state.failed ? (
			<p role="alert">{this.props.name} failed to render.</p>
		) : (
			this.props.children
		);
	}
}

function Controls() {
	return (
		<LayerCard padding="none">
			<LayerCard.Header>Controls &amp; badges</LayerCard.Header>
			<LayerCard.Body className="flex flex-wrap items-center gap-basalt-space-lg">
				<Button>Primary</Button>
				<Button variant="outline">Secondary</Button>
				<Badge variant="outline">Pending</Badge>
				<Badge tone="success">Complete</Badge>
			</LayerCard.Body>
		</LayerCard>
	);
}

function Data() {
	return (
		<LayerCard padding="none">
			<LayerCard.Header>Table, meter &amp; status trace</LayerCard.Header>
			<LayerCard.Body className="space-y-basalt-card-sm">
				<Meter label="Capacity" value={68} size="sm" />
				<p className="flex items-center gap-basalt-space-lg">
					<Loader size={14} showElapsed={false} label="Running" /> Processing
				</p>
				<Table aria-label="Status trace" density="compact">
					<TableHeader>
						<TableRow>
							<TableHead>Task</TableHead>
							<TableHead>Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Publish</TableCell>
							<TableCell>
								<Badge dot tone="success">
									Complete
								</Badge>
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</LayerCard.Body>
		</LayerCard>
	);
}

function Overlay() {
	return (
		<LayerCard padding="none">
			<LayerCard.Header>Dialog &amp; disclosure</LayerCard.Header>
			<LayerCard.Body className="space-y-basalt-card-sm">
				<Dialog>
					<DialogTrigger asChild>
						<Button>Open dialog</Button>
					</DialogTrigger>
					<DialogContent showCloseButton={false}>
						<DialogTitle>Example dialog</DialogTitle>
						<DialogDescription>A standalone overlay example.</DialogDescription>
						<DialogClose asChild>
							<Button>Close</Button>
						</DialogClose>
					</DialogContent>
				</Dialog>
				<Collapsible>
					<CollapsibleTrigger>Show details</CollapsibleTrigger>
					<CollapsibleContent>Example disclosure content.</CollapsibleContent>
				</Collapsible>
			</LayerCard.Body>
		</LayerCard>
	);
}

function Templates() {
	return (
		<div className="grid grid-cols-1 gap-basalt-layout md:grid-cols-2 xl:grid-cols-3">
			{TEMPLATE_MANIFEST.map((entry) => (
				<LayerCard key={entry.slug} padding="none">
					<LayerCard.Header>{entry.title}</LayerCard.Header>
					<LayerCard.Body className="space-y-basalt-card-sm">
						<Badge variant="outline">{entry.category}</Badge>
						<p className="text-basalt-sm text-basalt-muted-foreground">{entry.description}</p>
					</LayerCard.Body>
				</LayerCard>
			))}
		</div>
	);
}

const PANELS: readonly Panel[] = [
	{ key: "controls", component: Controls },
	{ key: "data", component: Data },
	{ key: "overlay", component: Overlay },
	{ key: "micro-scenes", component: MicroSceneWall },
	{ key: "surface-inspector", component: SurfaceDisciplineInspector },
	{ key: "templates", component: Templates },
];

function hoverRules(rules: CSSRuleList): string {
	return Array.from(rules, (rule) => {
		if ("selectorText" in rule && typeof rule.selectorText === "string") {
			const style = rule as CSSStyleRule;
			const declarations = /:hover\b/.test(style.selectorText) ? style.style.cssText : "";
			const nested = "cssRules" in style ? hoverRules(style.cssRules) : "";
			return declarations || nested
				? `${style.selectorText.replace(/:hover\b/g, ".__basalt_hover")} { ${declarations} ${nested} }`
				: "";
		}
		if ("cssRules" in rule) {
			const nested = hoverRules((rule as CSSGroupingRule).cssRules);
			return nested ? `${rule.cssText.slice(0, rule.cssText.indexOf("{"))}{${nested}}` : "";
		}
		return "";
	}).join("\n");
}

function selectHoverTargets(root: HTMLElement, selector: string): Iterable<Element> {
	try {
		return root.querySelectorAll(selector);
	} catch {
		return [];
	}
}

function Examples({ extraPanels }: { extraPanels: readonly Panel[] }) {
	const [params] = useSearchParams();
	const query = params.get("q") ?? "";
	const hover = params.get("hover") ?? "";
	const filters = query
		.toLowerCase()
		.split(",")
		.map((part) => part.trim())
		.filter(Boolean);
	const panels = [...PANELS, ...extraPanels].filter(
		(panel) =>
			filters.length === 0 || filters.some((filter) => panel.key.toLowerCase().includes(filter)),
	);
	const failures = useRef<Record<string, string>>({});
	const root = useRef<HTMLElement>(null);

	useEffect(() => {
		const current = failures.current;
		window.__basaltFailures = current;
		window.__basaltExamplesDone = true;
		return () => {
			if (window.__basaltFailures === current) {
				delete window.__basaltFailures;
				delete window.__basaltExamplesDone;
			}
		};
	}, []);

	useEffect(() => {
		if (!hover || !root.current) return;
		const styles = Array.from(document.styleSheets, (sheet) => {
			try {
				return hoverRules(sheet.cssRules);
			} catch {
				return "";
			}
		});
		const style = document.createElement("style");
		style.dataset.basaltHover = "";
		style.textContent = `${styles.join("\n")}\n* { transition: none !important; }`;
		document.head.append(style);
		const marked = new Set<Element>();
		for (const selector of hover
			.split(",")
			.map((part) => part.trim())
			.filter(Boolean)) {
			for (const element of selectHoverTargets(root.current, selector)) {
				if (!element.classList.contains("__basalt_hover")) {
					element.classList.add("__basalt_hover");
					marked.add(element);
				}
			}
		}
		return () => {
			style.remove();
			for (const element of marked) element.classList.remove("__basalt_hover");
		};
	});

	return (
		<main
			ref={root}
			data-basalt-surface-root=""
			data-dev-examples=""
			className="min-h-screen bg-basalt-background p-basalt-layout text-basalt-foreground"
		>
			<div className="space-y-basalt-layout">
				{panels.map(({ key, component: PanelComponent }) => (
					<section key={key} data-dev-panel={key}>
						<PanelBoundary name={key} failures={failures.current}>
							<PanelComponent />
						</PanelBoundary>
					</section>
				))}
			</div>
		</main>
	);
}

export default function DevExamplesPage({ extraPanels = [] }: { extraPanels?: readonly Panel[] }) {
	const [params] = useSearchParams();
	const requestedTheme = params.get("theme");
	const { theme } = useTheme();
	return (
		<ThemeProvider
			persist={false}
			theme={requestedTheme === "light" || requestedTheme === "dark" ? requestedTheme : theme}
		>
			<Examples extraPanels={extraPanels} />
		</ThemeProvider>
	);
}
