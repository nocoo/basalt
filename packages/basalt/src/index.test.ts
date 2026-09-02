import { describe, expect, it } from "vitest";
import * as root from "./index";
import { Badge, Button, Meter, Toast, Toaster, toast } from "./index";

const unapprovedRootNames = [
	"AppHeader",
	"AppMain",
	"AppShell",
	"AppSkipLink",
	"LoadingScreen",
	"PageHeader",
	"LineChart",
	"BarChart",
	"AreaChart",
	"DonutChart",
	"Sparkline",
	"Gauge",
	"StatCard",
	"ChartPalette",
	"DataTable",
] as const;

describe("root barrel", () => {
	it("exports stable controls including Toast", () => {
		expect(Button).toBeTruthy();
		expect(Badge).toBeTruthy();
		expect(Meter).toBeTruthy();
		expect(toast).toBeTypeOf("function");
		expect(Toast).toBe(Toaster);
		expect(root.ThemeProvider).toBeTruthy();
		expect(root.ThemeToggle).toBeTruthy();
		expect(root.LinkProvider).toBeTruthy();
		expect(root.ScrollArea).toBeTruthy();
		expect(root.SegmentControl).toBeTruthy();
		expect(root.StatStrip).toBeTruthy();
		expect(root.ConfirmDialog).toBeTruthy();
		expect(root.useConfirm).toBeTypeOf("function");
		expect(root.TablePager).toBeTruthy();
		expect(root.Text).toBeTruthy();
		expect(root.Field).toBeTruthy();
	});

	it("omits unapproved layout names from the frozen root surface", () => {
		for (const name of unapprovedRootNames) {
			expect(root).not.toHaveProperty(name);
		}
	});
});
