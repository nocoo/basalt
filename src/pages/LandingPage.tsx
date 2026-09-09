import { Button } from "@nocoo/basalt/components/button";
import { Link } from "@nocoo/basalt/components/link";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Check, Copy, Moon, Sun } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { InteractiveBrandArtwork } from "@/components/landing/InteractiveBrandArtwork";
import { LandingContent } from "@/components/landing/LandingContent";
import { useSiteTitle } from "@/hooks/use-site-title";
import { LANDING_INSTALL } from "@/lib/landing";

function subscribeToColorScheme(onChange: () => void) {
	const media = window.matchMedia("(prefers-color-scheme: dark)");
	media.addEventListener("change", onChange);
	return () => media.removeEventListener("change", onChange);
}

function CopyInstallCommand() {
	const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
	return (
		<>
			<Button
				variant="ghost"
				size="icon"
				aria-label={status === "copied" ? "Install command copied" : "Copy install command"}
				onClick={async () => {
					try {
						await navigator.clipboard.writeText(LANDING_INSTALL);
						setStatus("copied");
					} catch {
						setStatus("failed");
					}
				}}
			>
				{status === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
			</Button>
			<span role="status" className={status === "failed" ? "landing-copy-error" : "sr-only"}>
				{status === "copied"
					? "Copied to clipboard."
					: status === "failed"
						? "Select the command to copy it. Clipboard access is unavailable."
						: ""}
			</span>
		</>
	);
}

export default function LandingPage() {
	useSiteTitle();
	const { theme, setTheme } = useTheme();
	const systemDark = useSyncExternalStore(
		subscribeToColorScheme,
		() => window.matchMedia("(prefers-color-scheme: dark)").matches,
		() => false,
	);
	const resolvedTheme = theme === "system" ? (systemDark ? "dark" : "light") : theme;
	const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
	return (
		<LandingContent
			linkComponent={Link}
			imageMode={resolvedTheme}
			themeToggle={
				<Button
					type="button"
					variant="ghost"
					size="icon"
					aria-label={`Toggle theme (current: ${resolvedTheme})`}
					title={`Switch to ${nextTheme} mode`}
					onClick={() => setTheme(nextTheme)}
				>
					{resolvedTheme === "dark" ? (
						<Moon aria-hidden="true" size={16} strokeWidth={1.5} />
					) : (
						<Sun aria-hidden="true" size={16} strokeWidth={1.5} />
					)}
				</Button>
			}
			installAction={<CopyInstallCommand />}
			brandArtwork={<InteractiveBrandArtwork />}
		/>
	);
}
