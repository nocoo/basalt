import { Button } from "@nocoo/basalt/components/button";
import { Link } from "@nocoo/basalt/components/link";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { InteractiveBrandArtwork } from "@/components/landing/InteractiveBrandArtwork";
import { LandingContent } from "@/components/landing/LandingContent";
import { useSiteTitle } from "@/hooks/use-site-title";
import { LANDING_INSTALL } from "@/lib/landing";

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
	return (
		<LandingContent
			linkComponent={Link}
			installAction={<CopyInstallCommand />}
			brandArtwork={<InteractiveBrandArtwork />}
		/>
	);
}
