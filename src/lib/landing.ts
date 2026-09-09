import { CATALOG, CATALOG_CATEGORIES } from "../pages/ui/catalog";
import { SITE } from "./site";

export const LANDING_HEADING_LINES = ["A calmer canvas", "for complex software."] as const;
export const LANDING_HEADING = LANDING_HEADING_LINES.join(" ");
export const LANDING_KICKER = "The matte React design system";
export const LANDING_LEDE =
	"Thoughtful components and complete dashboard layouts. Build information-rich products with a little less noise, and a lot more clarity.";
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

export const LANDING_STATS = CATALOG_CATEGORIES.map((category) => ({
	label: category.label,
	value: String(CATALOG.filter((entry) => entry.category === category.id).length),
	href: `/ui?category=${category.id}`,
}));

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
		title: "Every detail belongs.",
		body: "Buttons, inputs, menus, and dialogs share the same spacing, shape, and interaction language. Less time reconciling the details.",
		href: "/ui?category=component",
		link: "Explore components",
	},
	{
		title: "Give your data a voice.",
		body: "From a quiet sparkline to a full analytics view. Charts and data patterns designed to make dense information easier to read.",
		href: "/ui?category=chart",
		link: "Explore charts",
	},
	{
		title: "Depth without distraction.",
		body: "Matte surfaces, measured contrast, and a palette that feels at home in light and dark. One system, with room to make it yours.",
		href: "/palette",
		link: "Explore the palette",
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
