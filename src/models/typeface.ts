export type TypefaceFamilyId = "display" | "sans" | "mono";

export type TypeTierId = "3xl" | "xl" | "lg" | "base" | "md" | "sm" | "xs";

export type SpecimenMode = "roles" | "bilingual" | "custom";

export interface TypefaceWeightSample {
	readonly weight: string;
	readonly label: string;
	readonly className: string;
}

export interface TypefaceFamilySpec {
	readonly id: TypefaceFamilyId;
	readonly name: string;
	readonly token: string;
	readonly utility: string;
	readonly sampleClass: string;
	readonly bodyClass: string;
	readonly heroSample: string;
	readonly pangram: string;
	readonly features: string;
	readonly stack: string;
	readonly weights: readonly TypefaceWeightSample[];
}

export interface TypeScaleTier {
	readonly id: TypeTierId;
	readonly px: string;
	readonly rem: string;
	readonly token: string;
	readonly utility: string;
	readonly lineBox: string;
	readonly tracking: string;
	readonly weight: string;
	readonly specimenClass: string;
	readonly roleSpecimen: string;
	readonly bilingualSpecimen: string;
}

export interface TypeScaleRow extends TypeScaleTier {
	readonly specimen: string;
}

export interface LineBoxSpec {
	readonly id:
		| "controlSm"
		| "controlDefault"
		| "segmentedTrack"
		| "sidebarRow"
		| "controlLg"
		| "tableRow"
		| "banner";
	readonly typography: string;
	readonly inset: string;
	readonly targetHeight: string;
}

export interface OpenTypeVariantSpec {
	readonly id: "cv02" | "cv03" | "cv04" | "cv11";
	readonly tag: string;
	readonly glyph: string;
}

export const DEFAULT_CUSTOM_SPECIMEN = "Clear hierarchy across dense interfaces · 0123456789";

export const TYPEFACE_FAMILIES: readonly TypefaceFamilySpec[] = [
	{
		id: "display",
		name: "DM Sans",
		token: "--basalt-font-display",
		utility: "font-basalt-display",
		sampleClass:
			"font-basalt-display text-basalt-3xl font-semibold leading-basalt-tight tracking-tight tabular-nums text-basalt-foreground",
		bodyClass:
			"font-basalt-display text-basalt-base leading-basalt-body text-basalt-muted-foreground",
		heroSample: "Aa Bb Cc · $128,490",
		pangram: "Geometric display proportions for page titles and primary KPI numerals.",
		features: "Variable 500–700 · optical size axis",
		stack: '"DM Sans", "Inter", system-ui, sans-serif',
		weights: [
			{
				weight: "500",
				label: "Medium",
				className: "font-basalt-display text-basalt-base font-medium",
			},
			{
				weight: "600",
				label: "Semibold",
				className: "font-basalt-display text-basalt-base font-semibold",
			},
			{ weight: "700", label: "Bold", className: "font-basalt-display text-basalt-base font-bold" },
		],
	},
	{
		id: "sans",
		name: "Inter",
		token: "--basalt-font-sans",
		utility: "font-basalt-sans",
		sampleClass:
			"text-basalt-3xl font-semibold leading-basalt-tight tracking-tight text-basalt-foreground",
		bodyClass: "text-basalt-base leading-basalt-body text-basalt-muted-foreground",
		heroSample: "Aa Bb Cc · Il1 O0",
		pangram: "Default interface workhorse tuned with disambiguated character variants.",
		features: '"cv02", "cv03", "cv04", "cv11"',
		stack: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
		weights: [
			{ weight: "400", label: "Regular", className: "text-basalt-base font-normal" },
			{ weight: "500", label: "Medium", className: "text-basalt-base font-medium" },
			{ weight: "600", label: "Semibold", className: "text-basalt-base font-semibold" },
		],
	},
	{
		id: "mono",
		name: "JetBrains Mono",
		token: "--basalt-font-mono",
		utility: "font-basalt-mono",
		sampleClass:
			"font-basalt-mono text-basalt-xl font-medium leading-basalt-body tracking-tight text-basalt-foreground",
		bodyClass: "font-basalt-mono text-basalt-md leading-basalt-body text-basalt-muted-foreground",
		heroSample: "0123456789 => {}",
		pangram: "const key = 'basalt_live_01IlO9'; // fixed-width box",
		features: "normal (zero ligature surprises)",
		stack: '"JetBrains Mono", "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace',
		weights: [
			{
				weight: "400",
				label: "Regular",
				className: "font-basalt-mono text-basalt-base font-normal",
			},
			{
				weight: "500",
				label: "Medium",
				className: "font-basalt-mono text-basalt-base font-medium",
			},
		],
	},
];

export const TYPE_SCALE_TIERS: readonly TypeScaleTier[] = [
	{
		id: "3xl",
		px: "24px",
		rem: "1.5rem",
		token: "--basalt-text-3xl",
		utility: "text-basalt-3xl",
		lineBox: "1.2 (28.8px)",
		tracking: "-0.025em",
		weight: "600",
		specimenClass:
			"font-basalt-display text-basalt-3xl font-semibold leading-basalt-tight tracking-tight tabular-nums text-basalt-foreground",
		roleSpecimen: "Page title & $428,910",
		bilingualSpecimen: "账户净值 · Total Balance $428,910",
	},
	{
		id: "xl",
		px: "18px",
		rem: "1.125rem",
		token: "--basalt-text-xl",
		utility: "text-basalt-xl",
		lineBox: "calc(24 / 18) (24px)",
		tracking: "-0.018em",
		weight: "600",
		specimenClass:
			"font-basalt-display text-basalt-xl font-semibold tracking-tight text-basalt-foreground",
		roleSpecimen: "Section & modal heading",
		bilingualSpecimen: "结算与风险概览 · Settlement overview",
	},
	{
		id: "lg",
		px: "15px",
		rem: "0.9375rem",
		token: "--basalt-text-lg",
		utility: "text-basalt-lg",
		lineBox: "calc(20 / 15) (20px)",
		tracking: "-0.014em",
		weight: "600",
		specimenClass: "text-basalt-lg font-semibold tracking-tight text-basalt-foreground",
		roleSpecimen: "Structured LayerCard.Header",
		bilingualSpecimen: "季度持仓分布 · Portfolio allocation",
	},
	{
		id: "base",
		px: "14px",
		rem: "0.875rem",
		token: "--basalt-text-base",
		utility: "text-basalt-base",
		lineBox: "20px body / 24px action",
		tracking: "-0.006em",
		weight: "400 / 500",
		specimenClass: "text-basalt-base leading-basalt-body text-basalt-foreground",
		roleSpecimen: "Default controls, navigation rows, and body prose.",
		bilingualSpecimen: "默认控件、导航行与正文说明保持 14px / 20px 阅读节奏。",
	},
	{
		id: "md",
		px: "13px",
		rem: "0.8125rem",
		token: "--basalt-text-md",
		utility: "text-basalt-md",
		lineBox: "18.57px body / 20px code",
		tracking: "-0.003em",
		weight: "400 / 500",
		specimenClass: "text-basalt-md leading-basalt-body text-basalt-foreground",
		roleSpecimen: "Table cells, sm controls, segmented items, and code panels.",
		bilingualSpecimen: "表格单元格、紧凑控件与代码块统一使用 13px 档位。",
	},
	{
		id: "sm",
		px: "12px",
		rem: "0.75rem",
		token: "--basalt-text-sm",
		utility: "text-basalt-sm",
		lineBox: "17.14px / 16px inline",
		tracking: "0 (normal)",
		weight: "400 / 500",
		specimenClass: "text-basalt-sm text-basalt-muted-foreground",
		roleSpecimen: "Badges, TableHead, field hints, SectionRule labels & inline code",
		bilingualSpecimen: "徽章、表格列头、字段提示与分区大写标签（12px）",
	},
	{
		id: "xs",
		px: "11px",
		rem: "0.6875rem",
		token: "--basalt-text-xs",
		utility: "text-basalt-xs",
		lineBox: "calc(16 / 11) (16px)",
		tracking: "+0.02em",
		weight: "500 / 600",
		specimenClass: "text-basalt-xs font-medium text-basalt-muted-foreground",
		roleSpecimen: "24px avatar initials (SN) · 78% compact meter readout",
		bilingualSpecimen: "24px 紧凑头像缩写（SN）与紧凑进度读数 78%",
	},
];

export const LINE_BOX_SPECS: readonly LineBoxSpec[] = [
	{
		id: "controlSm",
		typography: "13px / 18px",
		inset: "4px y · 10px x · 1px",
		targetHeight: "28px",
	},
	{
		id: "controlDefault",
		typography: "14px / 24px",
		inset: "4px y · 12px x · 1px",
		targetHeight: "34px",
	},
	{
		id: "segmentedTrack",
		typography: "13px / 20px",
		inset: "2px item · 2px track",
		targetHeight: "34px",
	},
	{
		id: "sidebarRow",
		typography: "14px / 22px",
		inset: "8px y · 8px x",
		targetHeight: "38px",
	},
	{
		id: "controlLg",
		typography: "14px / 22px",
		inset: "8px y · 16px x · 1px",
		targetHeight: "40px",
	},
	{
		id: "tableRow",
		typography: "13px / 20px",
		inset: "8px y · 12px x",
		targetHeight: "44px",
	},
	{
		id: "banner",
		typography: "14px / 22px",
		inset: "12px y · 16px x",
		targetHeight: "46px",
	},
];

export const OPENTYPE_VARIANTS: readonly OpenTypeVariantSpec[] = [
	{ id: "cv02", tag: "cv02", glyph: "4" },
	{ id: "cv03", tag: "cv03", glyph: "6" },
	{ id: "cv04", tag: "cv04", glyph: "9" },
	{ id: "cv11", tag: "cv11", glyph: "a" },
];

export const NUMERIC_LEDGER_SAMPLES: readonly string[] = [
	"$1,111,111.10",
	"$8,402,950.45",
	"$390,114.08",
	"$9,888,204.92",
];

export const TYPEFACE_CODE_SNIPPET = `:root {
  --basalt-font-sans: "Inter", system-ui, -apple-system, sans-serif;
  --basalt-font-display: "DM Sans", "Inter", system-ui, sans-serif;
  --basalt-font-mono: "JetBrains Mono", ui-monospace, monospace;
  --basalt-font-features: "cv02", "cv03", "cv04", "cv11";

  --basalt-text-xs: 0.6875rem;   /* 11px · Micro */
  --basalt-text-sm: 0.75rem;     /* 12px · Auxiliary */
  --basalt-text-md: 0.8125rem;   /* 13px · Compact data & sm controls */
  --basalt-text-base: 0.875rem;  /* 14px · Body & default controls */
  --basalt-text-lg: 0.9375rem;   /* 15px · Card title */
  --basalt-text-xl: 1.125rem;    /* 18px · Section & modal */
  --basalt-text-3xl: 1.5rem;     /* 24px · Page title & KPI metric */
}`;

export function isSpecimenMode(value: string): value is SpecimenMode {
	return value === "roles" || value === "bilingual" || value === "custom";
}

export function resolveTierSpecimen(
	tier: Pick<TypeScaleTier, "roleSpecimen" | "bilingualSpecimen">,
	mode: SpecimenMode,
	customText: string,
): string {
	if (mode === "custom") {
		return customText.trim() || DEFAULT_CUSTOM_SPECIMEN;
	}
	return mode === "bilingual" ? tier.bilingualSpecimen : tier.roleSpecimen;
}
