"use client";

import { Button, LinkProvider, ThemeProvider, ThemeToggle, Toast, toast } from "@nocoo/basalt";
import { useEffect, useState } from "react";

export function BasaltApp() {
	const [hydrated, setHydrated] = useState(false);
	const [saves, setSaves] = useState(0);
	useEffect(() => {
		setHydrated(true);
	}, []);
	return (
		<ThemeProvider>
			<LinkProvider>
				<div data-basalt-root="" data-hydrated={hydrated ? "true" : "false"}>
					<ThemeToggle aria-label="Toggle theme" />
					<Button data-basalt-save="" onClick={() => setSaves((count) => count + 1)}>
						Save {saves}
					</Button>
					<Button data-basalt-toast="" onClick={() => toast("basalt-toast-ok")}>
						Show toast
					</Button>
					<Toast />
				</div>
			</LinkProvider>
		</ThemeProvider>
	);
}
