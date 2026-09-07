import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@nocoo/basalt/components/table";
import { ACCENT_SWATCHES, AccentProvider, useAccent } from "@nocoo/basalt/providers/accent";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { useState } from "react";

const SURFACES = ["background", "card", "secondary", "bright"] as const;
const BADGE_VARIANTS = [
	"default",
	"secondary",
	"destructive",
	"outline",
	"info",
	"success",
	"warning",
	"error",
	"red",
	"orange",
	"teal",
	"blue",
	"purple",
] as const;

function ContrastControls() {
	const { theme, setTheme } = useTheme();
	const { accent, setAccent } = useAccent();

	return (
		<nav style={{ padding: 12, display: "flex", gap: 16, alignItems: "center" }}>
			<label>
				Theme:{" "}
				<select
					id="select-theme"
					aria-label="Select Theme"
					value={theme}
					onChange={(e) => setTheme(e.target.value as BasaltTheme)}
				>
					<option value="light">light</option>
					<option value="dark">dark</option>
				</select>
			</label>
			<label>
				Accent:{" "}
				<select
					id="select-accent"
					aria-label="Select Accent"
					value={accent}
					onChange={(e) => setAccent(e.target.value)}
				>
					{ACCENT_SWATCHES.map((swatch) => (
						<option key={swatch.id} value={swatch.id}>
							{swatch.id}
						</option>
					))}
					<option value="steel">legacy steel</option>
				</select>
			</label>
			<span id="contrast-status" data-ready="true">
				Ready: {theme}/{accent}
			</span>
		</nav>
	);
}

function ContrastContent() {
	return (
		<main style={{ padding: 24, fontSize: 14, color: "hsl(var(--basalt-foreground))" }}>
			{SURFACES.map((surface) => (
				<section
					key={surface}
					data-surface={surface}
					style={{
						padding: 16,
						marginBottom: 16,
						background: `hsl(var(--basalt-${surface}))`,
					}}
				>
					<div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
						<button type="button" data-focus-start={surface}>
							Focus start ({surface})
						</button>
						<Button data-sample="primary">Create resource</Button>
						<Button data-sample="link" variant="link">
							View details
						</Button>
						<Button data-sample="destructive" variant="destructive">
							Delete resource
						</Button>
					</div>

					<span
						data-sample="muted"
						style={{
							display: "block",
							color: "hsl(var(--basalt-muted-foreground))",
							marginBottom: 12,
						}}
					>
						Resource detail and metadata description
					</span>

					<div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
						{BADGE_VARIANTS.map((variant) => (
							<Badge key={variant} variant={variant} data-sample={`badge-${variant}`}>
								{variant}
							</Badge>
						))}
					</div>

					<Table>
						<TableCaption data-sample="table-caption">Monitored cluster nodes</TableCaption>
						<TableHeader>
							<TableRow>
								<TableHead data-sample="table-header">Node identifier</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							<TableRow data-hover-row>
								<TableCell>
									<span
										data-sample="table-normal"
										style={{ color: "hsl(var(--basalt-muted-foreground))" }}
									>
										Last heartbeat 10 seconds ago
									</span>
								</TableCell>
								<TableCell>Active</TableCell>
							</TableRow>
							<TableRow variant="selected">
								<TableCell>
									<span
										data-sample="table-selected"
										style={{ color: "hsl(var(--basalt-muted-foreground))" }}
									>
										Node node-east-1 selected
									</span>
								</TableCell>
								<TableCell>Selected</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</section>
			))}
		</main>
	);
}

export function ContrastApp() {
	const [theme, setTheme] = useState<BasaltTheme>("light");
	const [accent, setAccent] = useState("primary");

	return (
		<ThemeProvider theme={theme} onThemeChange={setTheme}>
			<AccentProvider accent={accent} onAccentChange={setAccent}>
				<ContrastControls />
				<ContrastContent />
			</AccentProvider>
		</ThemeProvider>
	);
}
