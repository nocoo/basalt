import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const EXAMPLE_PAGES = [
	"AccountsPage.tsx",
	"BadgeLoginPage.tsx",
	"BankingDashboardPage.tsx",
	"ComponentsPage.tsx",
	"DashboardPage.tsx",
	"DataPage.tsx",
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

function pageSource(name: string) {
	return readFileSync(path.join(process.cwd(), "src/pages", name), "utf8");
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

	it("loads charts through package chart exports", () => {
		for (const name of CHART_PAGES) {
			const source = pageSource(name);
			const usesPackageChart = source.includes("@nocoo/basalt/charts/");
			const usesDashboardChart = source.includes("@/components/dashboard/");
			expect(usesPackageChart || usesDashboardChart, name).toBe(true);
		}
		const barCard = readFileSync(
			path.join(process.cwd(), "src/components/dashboard/BarChartCard.tsx"),
			"utf8",
		);
		expect(barCard).toMatch(/@nocoo\/basalt\/charts\//);
		expect(barCard).not.toMatch(/from ["']recharts["']/);
	});
});
