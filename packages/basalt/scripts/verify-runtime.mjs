if (process.versions.bun) {
	throw new Error("runtime gate must run under Node, not Bun");
}
if (!process.versions.node) {
	throw new Error("runtime gate requires Node");
}

const packageRoot = new URL("..", import.meta.url);
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
const buttonUrl = import.meta.resolve("@nocoo/basalt/components/button");
const themeUrl = import.meta.resolve("@nocoo/basalt/providers/theme");
const donutUrl = import.meta.resolve("@nocoo/basalt/charts/donut");
const datePickerUrl = import.meta.resolve("@nocoo/basalt/components/date-picker");
const dataTableUrl = import.meta.resolve("@nocoo/basalt/components/data-table");

assertDist(new URL(rootUrl), "/dist/index.js");
assertDist(new URL(buttonUrl), "/dist/components/button.js");
assertDist(new URL(themeUrl), "/dist/providers/theme.js");
assertDist(new URL(donutUrl), "/dist/charts/donut.js");
assertDist(new URL(datePickerUrl), "/dist/components/date-picker.js");
assertDist(new URL(dataTableUrl), "/dist/components/data-table.js");

if (!rootUrl.startsWith(packageRoot.href) && !rootUrl.includes("/node_modules/@nocoo/basalt/")) {
	throw new Error(`@nocoo/basalt did not resolve inside the package: ${rootUrl}`);
}

const root = await import("@nocoo/basalt");
const button = await import("@nocoo/basalt/components/button");
const theme = await import("@nocoo/basalt/providers/theme");
const donut = await import("@nocoo/basalt/charts/donut");
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

if (button.Button == null) {
	throw new Error("components/button did not export Button");
}
if (theme.ThemeProvider == null) {
	throw new Error("providers/theme did not export ThemeProvider");
}
if (donut.DonutChart == null) {
	throw new Error("charts/donut did not export DonutChart");
}
if (datePicker.DatePicker == null) {
	throw new Error("components/date-picker did not export DatePicker");
}
if (dataTable.DataTable == null) {
	throw new Error("components/data-table did not export DataTable");
}

console.log(`runtime ok node=${process.versions.node} root=${rootUrl}`);
