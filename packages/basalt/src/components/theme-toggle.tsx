import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/theme";
import { HeaderAction } from "./app-header";

const ICON_PROPS = {
	"aria-hidden": true as const,
	strokeWidth: 1.5,
};

export interface ThemeToggleLabels {
	/** Names the switch to the light theme. @default "Switch to light theme" */
	light: string;
	/** Names the switch to the dark theme. @default "Switch to dark theme" */
	dark: string;
	/** Names the switch back to the system theme. @default "Use system theme" */
	system: string;
}

const DEFAULT_LABELS: ThemeToggleLabels = {
	light: "Switch to light theme",
	dark: "Switch to dark theme",
	system: "Use system theme",
};

export interface ThemeToggleProps {
	/**
	 * Fixed accessible name. Defaults to the label of the theme the next click switches to.
	 */
	"aria-label"?: string;
	/**
	 * Show a bottom tooltip naming the theme the next click switches to.
	 * @default true
	 */
	tooltip?: boolean;
	/**
	 * Labels naming each next theme (`light`, `dark`, `system`); omitted keys keep the English
	 * defaults.
	 */
	labels?: Partial<ThemeToggleLabels>;
}

/**
 * Header theme control: cycles system → light → dark → system as a `HeaderAction`, showing the
 * current theme's icon and naming the next theme in its tooltip.
 */
export function ThemeToggle({ "aria-label": ariaLabel, tooltip = true, labels }: ThemeToggleProps) {
	const { theme, setTheme } = useTheme();
	const next = theme === "system" ? "light" : theme === "light" ? "dark" : "system";
	const nextLabel = labels?.[next] ?? DEFAULT_LABELS[next];
	return (
		<HeaderAction
			label={ariaLabel ?? nextLabel}
			tooltip={tooltip ? nextLabel : false}
			data-theme={theme}
			onClick={() => setTheme(next)}
		>
			{theme === "system" ? (
				<Monitor {...ICON_PROPS} />
			) : theme === "dark" ? (
				<Moon {...ICON_PROPS} />
			) : (
				<Sun {...ICON_PROPS} />
			)}
		</HeaderAction>
	);
}
