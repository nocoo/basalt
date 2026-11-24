export const APEX_HOST = "basaltui.com";

export const INLINE_SCRIPT_HASHES = [
	"sha256-Blj9pzXsoTiAvbuv3y+j6MDGLAo5TkR+6lmDAK6L5Yc=",
	"sha256-2kDh5TTpi4+pKniLasm5+a5FywWrC6p25mj5iCT6E78=",
] as const;

export const CONTENT_SECURITY_POLICY = [
	"default-src 'self'",
	"base-uri 'none'",
	"object-src 'none'",
	"frame-ancestors 'self'",
	"frame-src 'self'",
	"form-action 'self'",
	"img-src 'self' data: blob:",
	"font-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	`script-src 'self' ${INLINE_SCRIPT_HASHES.map((hash) => `'${hash}'`).join(" ")}`,
].join("; ");

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
	"Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "SAMEORIGIN",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Content-Security-Policy": CONTENT_SECURITY_POLICY,
	"Permissions-Policy":
		"camera=(), geolocation=(), microphone=(), focus-without-user-activation=()",
	"Cross-Origin-Opener-Policy": "same-origin-allow-popups",
	"Cross-Origin-Resource-Policy": "same-origin",
};

const CROSS_ORIGIN_PUBLIC_ASSETS = new Set([
	"/opengraph-image.png",
	"/favicon.ico",
	"/favicon.png",
	"/apple-touch-icon.png",
]);

const MACHINE_DOC_PATHS = new Set(["/llms.txt", "/llms-full.txt", "/ai.txt", "/md-catalog.json"]);

export function isCrossOriginAssetPath(pathname: string): boolean {
	return (
		CROSS_ORIGIN_PUBLIC_ASSETS.has(pathname) ||
		/^\/logo-[^/]+\.(?:png|webp)$/.test(pathname) ||
		pathname.startsWith("/landing/") ||
		pathname.startsWith("/fonts/")
	);
}

export function isMarkdownPath(pathname: string): boolean {
	return pathname.endsWith(".md");
}

export function isMachineDocPath(pathname: string): boolean {
	return isMarkdownPath(pathname) || MACHINE_DOC_PATHS.has(pathname);
}

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

export function withSecurityHeaders(
	headers: Headers,
	preview: boolean,
	pathname?: string,
): Headers {
	const next = new Headers(headers);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (name === "Strict-Transport-Security" && preview) {
			continue;
		}
		next.set(name, value);
	}
	if (pathname && isCrossOriginAssetPath(pathname)) {
		next.set("Cross-Origin-Resource-Policy", "cross-origin");
	}
	if (pathname && isMachineDocPath(pathname)) {
		next.set("Access-Control-Allow-Origin", "*");
	}
	if (pathname && isMarkdownPath(pathname)) {
		next.set("Content-Type", "text/markdown; charset=utf-8");
	}
	if (preview) {
		next.set("X-Robots-Tag", "noindex");
	}
	return next;
}
