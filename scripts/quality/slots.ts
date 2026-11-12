export type Stage = "pre-commit" | "pre-push";

export interface GateStep {
	label: string;
	command: string;
	timeoutMs: number;
	expect?: { pattern: RegExp; label: string; min: number };
}

export interface GateContext {
	root: string;
	gitRoot: string;
	g1Range?: string;
}

export interface SlotDefinition {
	id: string;
	name: string;
	stages: Stage[];
	target: string;
	steps?: GateStep[];
	stepsFor?: (ctx: GateContext) => GateStep[];
	stagedOnly?: RegExp;
}

const MINUTE = 60_000;

export const STAGE_TIMEOUT_MS: Record<Stage, number> = {
	"pre-commit": 10 * MINUTE,
	"pre-push": 10 * MINUTE,
};

export const SLOTS: SlotDefinition[] = [
	{
		id: "S1",
		name: "S1: Types",
		stages: ["pre-commit"],
		target: "catalog/API/content/SEO checks plus tsc --noEmit for app and node lanes",
		steps: [{ label: "typecheck", command: "bun run typecheck", timeoutMs: 5 * MINUTE }],
	},
	{
		id: "S2",
		name: "S2: Lint",
		stages: ["pre-commit"],
		target: "Biome check-only with 0 errors and 0 warnings",
		steps: [{ label: "lint", command: "bun run lint", timeoutMs: 3 * MINUTE }],
	},
	{
		id: "S3",
		name: "S3: Workflow",
		stages: ["pre-commit"],
		target: ".github/workflows (actionlint plus full-SHA references)",
		stagedOnly: /^\.github\/workflows\//,
		steps: [
			{
				label: "workflow lint",
				command: "bun run scripts/quality/workflow-lint.ts",
				timeoutMs: MINUTE,
			},
		],
	},
	{
		id: "G1",
		name: "G1: Secrets",
		stages: ["pre-commit", "pre-push"],
		target: "exported Git index (pre-commit) or pushed commit range (pre-push)",
		stepsFor: (ctx) => [
			{
				label: ctx.g1Range ? `range ${ctx.g1Range}` : "index snapshot",
				command: ctx.g1Range
					? `bun run scripts/quality/secrets.ts --range=${ctx.g1Range}`
					: "bun run scripts/quality/secrets.ts --index-snapshot",
				timeoutMs: 3 * MINUTE,
			},
		],
	},
	{
		id: "L1",
		name: "L1: Unit",
		stages: ["pre-commit"],
		target: "package build for dist guards, Vitest coverage, four 95% floors",
		steps: [
			{
				label: "package build",
				command: "bun run --cwd packages/basalt build",
				timeoutMs: 3 * MINUTE,
			},
			{
				label: "coverage",
				command: "bun run test:coverage",
				timeoutMs: 6 * MINUTE,
				expect: { pattern: /Tests\s+(\d+)\s+passed/, label: "passed tests", min: 1 },
			},
			{
				label: "coverage report",
				command: "bun run scripts/verify-pre-commit-coverage.ts",
				timeoutMs: MINUTE,
			},
		],
	},
	{
		id: "G2",
		name: "G2: Dependencies",
		stages: ["pre-push"],
		target: "osv-scanner over bun.lock",
		steps: [
			{
				label: "osv-scanner",
				command: "osv-scanner scan --lockfile=bun.lock --config=osv-scanner.toml",
				timeoutMs: 4 * MINUTE,
			},
		],
	},
	{
		id: "B1",
		name: "B1: Build",
		stages: ["pre-push"],
		target: "publishable package build and catalog site build",
		steps: [
			{
				label: "package build",
				command: "bun run --cwd packages/basalt build",
				timeoutMs: 4 * MINUTE,
			},
			{
				label: "site build",
				command: "bun run build",
				timeoutMs: 6 * MINUTE,
			},
		],
	},
	{
		id: "L4",
		name: "L4: E2E",
		stages: ["pre-push"],
		target: "catalog showcase journeys in Chromium against the built site",
		steps: [
			{
				label: "design contract",
				command: "bun run design:check",
				timeoutMs: 2 * MINUTE,
			},
			{
				label: "showcase e2e",
				command: "bun run test:showcase",
				timeoutMs: 6 * MINUTE,
				expect: { pattern: /Showcase gate passed/, label: "showcase gate passes", min: 1 },
			},
		],
	},
	{
		id: "P1",
		name: "P1: Package",
		stages: ["pre-push"],
		target: "fresh package tarball installed by external standalone and heavy consumers",
		steps: [
			{
				label: "package build",
				command: "bun run --cwd packages/basalt build",
				timeoutMs: 4 * MINUTE,
			},
			{
				label: "pack and publint",
				command:
					"bun run --cwd packages/basalt pack:check && bun run --cwd packages/basalt publint",
				timeoutMs: 3 * MINUTE,
			},
			{
				label: "standalone consumer",
				command: "BASALT_SKIP_PACKAGE_BUILD=1 bun run consumer:standalone",
				timeoutMs: 5 * MINUTE,
			},
			{
				label: "heavy consumer",
				command: "BASALT_SKIP_PACKAGE_BUILD=1 bun run consumer:heavy",
				timeoutMs: 5 * MINUTE,
			},
		],
	},
];

export const NOT_APPLICABLE = [
	{
		id: "L2",
		name: "L2: Runtime",
		reason:
			"worker tests run in Node with a mocked ASSETS binding (L1 evidence); no workerd or vitest-pool-workers suite exists",
	},
	{
		id: "L3",
		name: "L3: Integration",
		reason:
			"static Vite catalog plus static-asset Worker; no service, protocol or storage boundary to integrate",
	},
];

export function slotsForStage(stage: Stage): SlotDefinition[] {
	return SLOTS.filter((slot) => slot.stages.includes(stage));
}
