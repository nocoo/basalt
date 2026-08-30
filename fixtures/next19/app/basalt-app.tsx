"use client";

import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast } from "@nocoo/basalt";

export function BasaltApp() {
	return (
		<ThemeProvider>
			<LinkProvider>
				<ThemeToggle aria-label="Toggle theme" />
				<Button>Save</Button>
				<Toast />
			</LinkProvider>
		</ThemeProvider>
	);
}
