import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const EXAMPLE_PAGES = [
	"AccountsPage.tsx",
	"BankingDashboardPage.tsx",
	"ComponentsPage.tsx",
	"DashboardPage.tsx",
	"DataPage.tsx",
	"DialogsPage.tsx",
	"FlowComparisonPage.tsx",
	"FormsPage.tsx",
	"HealthPage.tsx",
	"InteractionShowcasePage.tsx",
	"InteractivePage.tsx",
	"LayoutPage.tsx",
	"LoadingPage.tsx",
	"LoginPage.tsx",
	"NavigationPage.tsx",
	"NetworkOpsDashboardPage.tsx",
	"NotFound.tsx",
	"PalettePage.tsx",
	"PortfolioPage.tsx",
	"ProgressTrackingPage.tsx",
	"SettingsPage.tsx",
	"StaticPage.tsx",
	"WearableDashboardPage.tsx",
] as const;

const CHART_PAGES = [
	"ComponentsPage.tsx",
	"DashboardPage.tsx",
	"FlowComparisonPage.tsx",
	"HealthPage.tsx",
	"NetworkOpsDashboardPage.tsx",
	"PalettePage.tsx",
	"PortfolioPage.tsx",
	"ProgressTrackingPage.tsx",
	"WearableDashboardPage.tsx",
	"BankingDashboardPage.tsx",
] as const;

const LOCAL_CHART_FORKS = [
	"HeatmapCalendar.tsx",
	"SlotBarChart.tsx",
	"DateNavigationWidget.tsx",
	"TimelineWidget.tsx",
	"StatCardWidget.tsx",
] as const;

const DASHBOARD_DIR = path.join(process.cwd(), "src/components/dashboard");

function pageSource(name: string) {
	return readFileSync(path.join(process.cwd(), "src/pages", name), "utf8");
}

function usesPackageCharts(source: string) {
	return source.includes("@nocoo/basalt/charts/");
}

function dashboardImportSpecs(source: string) {
	return [...source.matchAll(/from ["']@\/components\/dashboard\/([^"']+)["']/g)].map(
		(match) => match[1],
	);
}

function dashboardFile(spec: string) {
	const name = spec.endsWith(".tsx") ? spec : `${spec}.tsx`;
	return path.join(DASHBOARD_DIR, name);
}

function moduleUsesPackageCharts(source: string, seen = new Set<string>()): boolean {
	if (usesPackageCharts(source)) {
		return true;
	}
	for (const spec of dashboardImportSpecs(source)) {
		const file = dashboardFile(spec);
		if (seen.has(file) || !existsSync(file)) {
			continue;
		}
		seen.add(file);
		if (moduleUsesPackageCharts(readFileSync(file, "utf8"), seen)) {
			return true;
		}
	}
	return false;
}

describe("Examples package contract", () => {
	it("does not import local ui copies on Examples pages", () => {
		for (const name of EXAMPLE_PAGES) {
			const source = pageSource(name);
			expect(source, name).not.toMatch(/from ["']@\/components\/ui\//);
		}
	});

	it("does not import recharts on Examples pages", () => {
		for (const name of EXAMPLE_PAGES) {
			const source = pageSource(name);
			expect(source, name).not.toMatch(/from ["']recharts["']/);
		}
	});

	it("resolves chart pages through package chart exports", () => {
		for (const name of CHART_PAGES) {
			expect(moduleUsesPackageCharts(pageSource(name)), name).toBe(true);
		}
	});

	it("dashboard chart wrappers import package charts", () => {
		const nonChart = new Set(["ActionGridCard.tsx", "ItemListCard.tsx", "RecentListCard.tsx"]);
		for (const file of readdirSync(DASHBOARD_DIR).filter((name) => name.endsWith(".tsx"))) {
			if (nonChart.has(file)) {
				continue;
			}
			const source = readFileSync(path.join(DASHBOARD_DIR, file), "utf8");
			expect(moduleUsesPackageCharts(source), file).toBe(true);
		}
	});

	it("does not keep local chart forks in dashboard", () => {
		const files = new Set(readdirSync(DASHBOARD_DIR));
		for (const fork of LOCAL_CHART_FORKS) {
			expect(files.has(fork), fork).toBe(false);
		}
	});

	it("dashboard modules do not import recharts", () => {
		for (const file of readdirSync(DASHBOARD_DIR).filter((name) => name.endsWith(".tsx"))) {
			const source = readFileSync(path.join(DASHBOARD_DIR, file), "utf8");
			expect(source, file).not.toMatch(/from ["']recharts["']/);
		}
	});

	it("dashboard chart cards do not wrap plots in a second frame", () => {
		const nonChart = new Set(["ActionGridCard.tsx", "ItemListCard.tsx", "RecentListCard.tsx"]);
		for (const file of readdirSync(DASHBOARD_DIR).filter((name) => name.endsWith(".tsx"))) {
			if (nonChart.has(file)) {
				continue;
			}
			const source = readFileSync(path.join(DASHBOARD_DIR, file), "utf8");
			expect(source, file).not.toMatch(/rounded-widget border border-border/);
			expect(source, file).not.toMatch(/border-border bg-card/);
		}
	});
});
