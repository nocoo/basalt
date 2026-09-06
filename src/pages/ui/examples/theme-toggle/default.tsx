import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";

export default function ThemeToggleDefault() {
	return (
		<ThemeProvider persist={false} applyToDocument={false}>
			<ThemeToggle aria-label="Toggle theme" />
		</ThemeProvider>
	);
}
