import { Button } from "@nocoo/basalt/components/button";
import { Link } from "@nocoo/basalt/components/link";
import { Check, Copy } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { InteractiveBrandArtwork } from "@/components/landing/InteractiveBrandArtwork";
import { LandingContent } from "@/components/landing/LandingContent";
import { useSiteTitle } from "@/hooks/use-site-title";
import { LANDING_INSTALL } from "@/lib/landing";
import { SITE } from "@/lib/site";

const LANDING_THEME_COLOR = "#08090b";

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

function useLandingThemeColor() {
	useLayoutEffect(() => {
		const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
		if (metas.length === 0) {
			const meta = document.createElement("meta");
			meta.setAttribute("name", "theme-color");
			meta.setAttribute("content", LANDING_THEME_COLOR);
			document.head.appendChild(meta);
			return () => meta.remove();
		}
		for (const meta of metas) {
			meta.setAttribute("content", LANDING_THEME_COLOR);
		}
		return () => {
			for (const meta of metas) {
				const media = meta.getAttribute("media") ?? "";
				if (media.includes("light")) {
					meta.setAttribute("content", SITE.themeColorLight);
				} else if (media.includes("dark")) {
					meta.setAttribute("content", SITE.themeColorDark);
				}
			}
		};
	}, []);
}

export default function LandingPage() {
	useSiteTitle();
	useLandingThemeColor();
	return (
		<LandingContent
			linkComponent={Link}
			installAction={<CopyInstallCommand />}
			brandArtwork={<InteractiveBrandArtwork />}
		/>
	);
}
