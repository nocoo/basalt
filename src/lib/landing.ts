import { CATALOG, CATALOG_CATEGORIES } from "../pages/ui/catalog";
import { SITE } from "./site";

export const LANDING_HEADING_LINES = ["React components", "for data-rich apps."] as const;
export const LANDING_HEADING = LANDING_HEADING_LINES.join(" ");
export const LANDING_KICKER = "Open-source React 19 UI library";
export const LANDING_LEDE =
	"Build dashboards with components, charts, and application layouts. Use Tailwind v4 or standalone CSS, with light and dark themes.";
export const LANDING_INSTALL = "npm i @nocoo/basalt lucide-react";

export interface LandingLink {
	href: string;
	label: string;
	external?: boolean;
}

export const LANDING_PRIMARY_LINKS: readonly LandingLink[] = [
	{ href: "/ui", label: "Components" },
	{ href: "#templates", label: "Templates" },
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

export const LANDING_TEMPLATES = [
	{
		name: "Care overview",
		category: "Dashboard",
		description: "Care spending, reimbursements, and health metrics in one dashboard.",
		href: "/dashboard",
		image: "dashboard",
	},
	{
		name: "Care funding",
		category: "Finance",
		description: "Treatment funds, reserves, and reimbursements with readable financial charts.",
		href: "/banking",
		image: "banking",
	},
	{
		name: "Care platform operations",
		category: "Infrastructure",
		description: "Service availability, network latency, and incidents across a care platform.",
		href: "/network",
		image: "network",
	},
] as const;

export const LANDING_FACTS = [
	{
		title: "Consistent controls",
		body: "Buttons, inputs, menus, and dialogs share spacing, focus states, and keyboard behavior.",
		href: "/ui",
		link: "Browse components",
	},
	{
		title: "Charts for dense data",
		body: "Compose sparklines, metric cards, and analytical charts with shared colors and accessible data alternatives.",
		href: "/ui?category=chart",
		link: "Browse charts",
	},
	{
		title: "Light and dark surfaces",
		body: "Layered matte surfaces separate content from controls. Shared tokens keep both themes consistent.",
		href: "/palette",
		link: "View the palette",
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
