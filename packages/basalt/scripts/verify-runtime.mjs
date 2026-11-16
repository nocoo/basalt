import { existsSync, readFileSync } from "node:fs";

if (process.versions.bun) {
	throw new Error("runtime gate must run under Node, not Bun");
}
if (!process.versions.node) {
	throw new Error("runtime gate requires Node");
}

const packageRoot = new URL("..", import.meta.url);
const baselinePath = new URL("../public-api-baseline.json", import.meta.url);

if (!existsSync(baselinePath)) {
	throw new Error(`baseline missing: ${baselinePath.pathname}`);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const forbidden = ["AppHeader", "AppMain", "AppShell", "AppSkipLink", "LoadingScreen"];
const required = ["Button", "ThemeProvider", "ThemeToggle", "Toast", "LinkProvider"];

function assertDist(url, suffix) {
	const path = url.pathname;
	if (!path.endsWith(suffix)) {
		throw new Error(`expected ${suffix}, got ${path}`);
	}
	if (path.includes("/src/")) {
		throw new Error(`source path is not a package export: ${path}`);
	}
}

const rootUrl = import.meta.resolve("@nocoo/basalt");
const iconsUrl = import.meta.resolve("@nocoo/basalt/icons");
const dialogPrimitiveUrl = import.meta.resolve("@nocoo/basalt/primitives/dialog");
const buttonUrl = import.meta.resolve("@nocoo/basalt/components/button");
const themeUrl = import.meta.resolve("@nocoo/basalt/providers/theme");
const chartUrl = import.meta.resolve("@nocoo/basalt/components/chart");
const statCardUrl = import.meta.resolve("@nocoo/basalt/components/stat-card");
const datePickerUrl = import.meta.resolve("@nocoo/basalt/components/date-picker");
const dataTableUrl = import.meta.resolve("@nocoo/basalt/components/data-table");

assertDist(new URL(rootUrl), "/dist/index.js");
assertDist(new URL(iconsUrl), "/dist/icons.js");
assertDist(new URL(dialogPrimitiveUrl), "/dist/primitives/dialog.js");
assertDist(new URL(buttonUrl), "/dist/components/button.js");
assertDist(new URL(themeUrl), "/dist/providers/theme.js");
assertDist(new URL(chartUrl), "/dist/components/chart.js");
assertDist(new URL(statCardUrl), "/dist/components/stat-card.js");
assertDist(new URL(datePickerUrl), "/dist/components/date-picker.js");
assertDist(new URL(dataTableUrl), "/dist/components/data-table.js");

if (!rootUrl.startsWith(packageRoot.href) && !rootUrl.includes("/node_modules/@nocoo/basalt/")) {
	throw new Error(`@nocoo/basalt did not resolve inside the package: ${rootUrl}`);
}

const root = await import("@nocoo/basalt");
const icons = await import("@nocoo/basalt/icons");
const dialogPrimitive = await import("@nocoo/basalt/primitives/dialog");
const button = await import("@nocoo/basalt/components/button");
const theme = await import("@nocoo/basalt/providers/theme");
const chart = await import("@nocoo/basalt/components/chart");
const statCard = await import("@nocoo/basalt/components/stat-card");
const datePicker = await import("@nocoo/basalt/components/date-picker");
const dataTable = await import("@nocoo/basalt/components/data-table");

for (const name of required) {
	if (!(name in root) || root[name] == null) {
		throw new Error(`missing approved root export ${name}`);
	}
}
for (const name of forbidden) {
	if (name in root) {
		throw new Error(`unapproved root export ${name}`);
	}
}

if (icons.Search == null) {
	throw new Error("icons did not export Search");
}
if (dialogPrimitive.Root == null) {
	throw new Error("primitives/dialog did not export Root");
}
if (button.Button == null) {
	throw new Error("components/button did not export Button");
}
if (theme.ThemeProvider == null) {
	throw new Error("providers/theme did not export ThemeProvider");
}
if (chart.ChartFrame == null || chart.ChartTooltipContent == null) {
	throw new Error("components/chart did not export chart chrome");
}
if (statCard.StatCard == null || statCard.StatGrid == null) {
	throw new Error("components/stat-card did not export StatCard and StatGrid");
}
if (datePicker.DatePicker == null) {
	throw new Error("components/date-picker did not export DatePicker");
}
if (dataTable.DataTable == null) {
	throw new Error("components/data-table did not export DataTable");
}

// Systematically verify all 375 runtime value exports from baseline across all 110 paths
let totalRuntimeVerified = 0;
for (const entry of baseline.entries) {
	const moduleUrl = import.meta.resolve(entry.path);
	const mod = await import(moduleUrl);
	for (const sym of entry.symbols) {
		if (sym.value) {
			if (!(sym.name in mod)) {
				throw new Error(
					`runtime export "${sym.name}" missing from module ${entry.path} (${moduleUrl})`,
				);
			}
			totalRuntimeVerified++;
		}
	}
}

console.log(
	`runtime ok node=${process.versions.node} root=${rootUrl} (verified ${totalRuntimeVerified} runtime symbols across ${baseline.entries.length} modules)`,
);
