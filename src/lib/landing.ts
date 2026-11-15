import { CATALOG, CATALOG_CATEGORIES } from "../pages/ui/catalog";
import { SITE } from "./site";

export const LANDING_HEADING_LINES = ["React components", "for complex interfaces"] as const;
export const LANDING_HEADING = LANDING_HEADING_LINES.join(" ");
export const LANDING_KICKER = "The matte React design system";
export const LANDING_LEDE =
	"Build dashboards and information-rich applications with matte components, charts, and ready-to-use example layouts.";
export const LANDING_INSTALL = "npm i @nocoo/basalt lucide-react";

export interface LandingLink {
	href: string;
	label: string;
	external?: boolean;
}

export const LANDING_PRIMARY_LINKS: readonly LandingLink[] = [
	{ href: "/ui", label: "Components" },
	{ href: "#templates", label: "Templates" },
	{ href: "/palette", label: "Palette" },
	{ href: "#get-started", label: "Get started" },
];

export const LANDING_PACKAGE_LINKS: readonly LandingLink[] = [
	{ href: SITE.npm, label: "npm", external: true },
	{ href: SITE.github, label: "GitHub", external: true },
];

export const LANDING_RELATED_LINKS: readonly LandingLink[] = [
	{ href: SITE.portfolio, label: "Portfolio", external: true },
	{ href: "https://lizheng.me/", label: "Play", external: true },
	{ href: "https://lizheng.blog/", label: "Journal", external: true },
	{ href: "https://lizheng.dev/", label: "Résumé", external: true },
];

export const LANDING_STATS = [
	{
		label: "Components",
		value: String(
			CATALOG.filter((entry) => entry.category !== "chart" && entry.category !== "block").length,
		),
		href: "/ui",
	},
	...CATALOG_CATEGORIES.filter(
		(category) => category.id === "chart" || category.id === "block",
	).map((category) => ({
		label: category.label,
		value: String(CATALOG.filter((entry) => entry.category === category.id).length),
		href: `/ui?category=${category.id}`,
	})),
];

export const LANDING_STORY = [
	"Dashboards collect everything: metrics, tables, alerts, forms and charts. Most UI kits make each piece look fine alone and loud together.",
	"Basalt is built for the screens that carry the most information. Every component shares one spacing scale, one type ramp and one set of matte surfaces, so a dense page still reads calmly.",
] as const;
export const LANDING_STORY_CLOSE = {
	lead: "Dense software should feel",
	fade: "as considered as the work people do inside it: quiet, legible, and built to last.",
} as const;

export const LANDING_STACK = [
	"React 19",
	"TypeScript",
	"Tailwind CSS v4",
	"Standalone CSS",
	"Next.js",
	"Vite",
] as const;

export const LANDING_TEMPLATES = [
	{
		name: "Analytics overview",
		category: "Dashboard",
		description: "Metrics, trends, and the bigger picture. All in one place.",
		href: "/dashboard",
		image: "dashboard",
	},
	{
		name: "Banking & wealth",
		category: "Finance",
		description: "A considered home for balances, portfolios, and transactions.",
		href: "/banking",
		image: "banking",
	},
	{
		name: "Network operations",
		category: "Infrastructure",
		description: "Bring traffic, service health, and system activity into focus.",
		href: "/network",
		image: "network",
	},
] as const;

export const LANDING_FACTS = [
	{
		title: "Components that work together",
		body: "Buttons, inputs, menus, and dialogs share the same spacing, shape, and interaction language.",
		href: "/ui",
		link: "Explore components",
	},
	{
		title: "Charts for clear data",
		body: "From a quiet sparkline to a full analytics view, designed to make dense information easier to read.",
		href: "/ui?category=chart",
		link: "Explore charts",
	},
	{
		title: "Flows and agent surfaces",
		body: "Flow diagrams, approval cards, tool chips, and chat threads ship as components, so multi-step screens start composed.",
		href: "/ui/flow",
		link: "Explore flow",
	},
	{
		title: "Matte surfaces, measured contrast",
		body: "Layered islands, quiet borders, and a palette tuned so long sessions stay comfortable.",
		href: "/palette",
		link: "Explore the palette",
	},
] as const;

export const LANDING_STEPS = [
	{
		title: "Install the package",
		body: "One package with React 19 components and optional chart peers.",
		code: LANDING_INSTALL,
	},
	{
		title: "Bring in the styles",
		body: "Use the Tailwind v4 entry, or the standalone stylesheet without Tailwind.",
		code: 'import "@nocoo/basalt/styles/standalone";',
	},
	{
		title: "Compose your screen",
		body: "Import only what you need from a separate path per component.",
		code: 'import { Button } from "@nocoo/basalt/components/button";',
	},
] as const;

export const LANDING_FAQS = [
	{
		question: "What is Basalt?",
		answer:
			"Basalt is an open-source React 19 UI library for dashboards and information-rich software. It includes components, charts, reusable blocks, and working example layouts, with TypeScript APIs and a live catalog.",
	},
	{
		question: "Can I use it in a commercial project?",
		answer:
			"Yes. The component library and example source are available under the MIT license. You can use and adapt them for personal and commercial projects, keeping the license notice with the source.",
	},
	{
		question: "Do I need Tailwind CSS?",
		answer:
			"No. Basalt supports Tailwind CSS v4 and also ships standalone CSS. Use the setup that fits your application; both share the same design tokens and components.",
	},
	{
		question: "Are the templates complete applications?",
		answer:
			"The examples are working frontend layouts with sample data. Use them as a starting point, then connect your own authentication, data sources, and business logic. The repository includes integration guides and reusable application recipes.",
	},
] as const;
