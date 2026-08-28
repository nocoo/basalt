import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/theme";
import { Button } from "./button";

const ICON_PROPS = { className: "h-4 w-4", "aria-hidden": true as const, strokeWidth: 1.5 };

export function ThemeToggle({ "aria-label": ariaLabel }: { "aria-label": string }) {
	const { theme, setTheme } = useTheme();
	const cycle = () => {
		if (theme === "system") setTheme("light");
		else if (theme === "light") setTheme("dark");
		else setTheme("system");
	};
	return (
		<Button type="button" variant="ghost" size="icon" onClick={cycle} aria-label={ariaLabel}>
			{theme === "system" ? (
				<Monitor {...ICON_PROPS} />
			) : theme === "dark" ? (
				<Moon {...ICON_PROPS} />
			) : (
				<Sun {...ICON_PROPS} />
			)}
		</Button>
	);
}
