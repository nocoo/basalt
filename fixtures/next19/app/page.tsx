"use client";

import { Button } from "@nocoo/basalt/components/button";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";

export default function Page() {
	return (
		<ThemeProvider>
			<Button>Save</Button>
		</ThemeProvider>
	);
}
