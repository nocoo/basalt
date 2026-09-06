import { Button } from "@nocoo/basalt/components/button";
import { AccentProvider, useAccent } from "@nocoo/basalt/providers/accent";
import { type BasaltTheme, ThemeProvider, useTheme } from "@nocoo/basalt/providers/theme";
import { useId, useState } from "react";

function IndependentControls() {
	const { theme, setTheme } = useTheme();
	const { accent, setAccent } = useAccent();

	return (
		<div className="flex flex-col gap-3 rounded-md border border-basalt-border bg-basalt-secondary/40 p-3 text-basalt-foreground">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span className="text-xs font-semibold uppercase tracking-wider text-basalt-muted-foreground">
					Local Preferences
				</span>
				<span className="rounded bg-basalt-secondary px-2 py-0.5 text-xs font-medium">
					{theme} · {accent}
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					Toggle to {theme === "dark" ? "light" : "dark"}
				</Button>
				<Button variant="outline" size="sm" onClick={() => setTheme("system")}>
					System
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						const next = accent === "rose" ? "teal" : accent === "teal" ? "amber" : "rose";
						setAccent(next);
					}}
				>
					Cycle Accent
				</Button>
			</div>
		</div>
	);
}

export function IndependentPreferences() {
	const headingId = useId();

	return (
		<ThemeProvider persist={false} applyToDocument={false} defaultTheme="light">
			<AccentProvider persist={false} applyToDocument={false} defaultAccent="sky">
				<div className="space-y-2">
					<h4 id={headingId} className="text-sm font-semibold text-basalt-foreground">
						Isolated In-Memory Preferences
					</h4>
					<p className="text-xs text-basalt-muted-foreground">
						Operates entirely in-memory with persist=false and applyToDocument=false. Changes do not
						mutate root DOM or touch storage.
					</p>
					<IndependentControls />
				</div>
			</AccentProvider>
		</ThemeProvider>
	);
}

function HostControlledInner() {
	const { theme, setTheme } = useTheme();
	const { accent, setAccent } = useAccent();

	return (
		<div className="flex flex-col gap-3 rounded-md border border-basalt-border bg-basalt-secondary/40 p-3 text-basalt-foreground">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<span className="text-xs font-semibold uppercase tracking-wider text-basalt-muted-foreground">
					Child Request Area
				</span>
				<span className="rounded bg-basalt-secondary px-2 py-0.5 text-xs font-medium">
					Context: {theme} · {accent}
				</span>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
				>
					Request {theme === "dark" ? "light" : "dark"}
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						const next = accent === "teal" ? "rose" : "teal";
						setAccent(next);
					}}
				>
					Request {accent === "teal" ? "rose" : "teal"}
				</Button>
			</div>
		</div>
	);
}

export function HostPreferences() {
	const headingId = useId();
	const [theme, setTheme] = useState<BasaltTheme>("light");
	const [accent, setAccent] = useState<string>("sky");
	const [acceptRequests, setAcceptRequests] = useState(true);
	const [lastRequest, setLastRequest] = useState<string>("none");

	const handleThemeChange = (next: BasaltTheme) => {
		setLastRequest(`theme -> ${next}`);
		if (acceptRequests) {
			setTheme(next);
		}
	};

	const handleAccentChange = (next: string) => {
		setLastRequest(`accent -> ${next}`);
		if (acceptRequests) {
			setAccent(next);
		}
	};

	return (
		<div className="space-y-3">
			<h4 id={headingId} className="text-sm font-semibold text-basalt-foreground">
				Host Controlled Preferences
			</h4>
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-basalt-secondary/50 p-2.5 text-xs">
				<div className="flex flex-wrap items-center gap-2">
					<span className="font-medium text-basalt-foreground">
						Host State: {theme} · {accent}
					</span>
					<span className="text-basalt-muted-foreground">(Last Request: {lastRequest})</span>
				</div>
				<Button
					variant={acceptRequests ? "default" : "destructive"}
					size="sm"
					onClick={() => setAcceptRequests((v) => !v)}
				>
					{acceptRequests ? "Policy: Accepting" : "Policy: Rejecting"}
				</Button>
			</div>
			<ThemeProvider
				persist={false}
				applyToDocument={false}
				theme={theme}
				onThemeChange={handleThemeChange}
			>
				<AccentProvider
					persist={false}
					applyToDocument={false}
					accent={accent}
					onAccentChange={handleAccentChange}
				>
					<HostControlledInner />
				</AccentProvider>
			</ThemeProvider>
		</div>
	);
}
