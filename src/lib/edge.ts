export const APEX_HOST = "basaltui.com";

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "strict-origin-when-cross-origin",
};

export function isPreviewHost(hostname: string): boolean {
	const host = hostname.toLowerCase().split(":")[0];
	return (
		host === "localhost" ||
		host === "127.0.0.1" ||
		host === "::1" ||
		host.endsWith(".hexly.ai") ||
		host.endsWith(".workers.dev")
	);
}

export function canonicalRedirect(url: URL): string | null {
	const hostname = url.hostname.toLowerCase();
	if (isPreviewHost(hostname)) {
		return null;
	}
	const next = new URL(url.toString());
	let changed = false;
	if (next.protocol === "http:") {
		next.protocol = "https:";
		changed = true;
	}
	if (hostname === `www.${APEX_HOST}`) {
		next.hostname = APEX_HOST;
		changed = true;
	}
	return changed ? next.toString() : null;
}

export function withSecurityHeaders(headers: Headers, preview: boolean): Headers {
	const next = new Headers(headers);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (name === "Strict-Transport-Security" && preview) {
			continue;
		}
		next.set(name, value);
	}
	if (preview) {
		next.set("X-Robots-Tag", "noindex");
	}
	return next;
}
