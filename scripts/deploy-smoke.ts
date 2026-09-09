import assert from "node:assert/strict";
import { setTimeout } from "node:timers/promises";
import { APEX_HOST, SECURITY_HEADERS } from "../src/lib/edge";
import { APP_VERSION } from "../src/lib/version";

const origin = `https://${APEX_HOST}`;

async function get(url: string): Promise<Response> {
	return fetch(url, {
		redirect: "manual",
		headers: { "Cache-Control": "no-cache" },
		signal: AbortSignal.timeout(15_000),
	});
}

async function checkRedirect(path: string): Promise<void> {
	const url = `https://www.${APEX_HOST}${path}`;
	const response = await get(url);
	await response.body?.cancel();
	assert.equal(response.status, 301, `${url} must redirect before assets are served`);
	assert.equal(
		response.headers.get("Location"),
		`${origin}${path}`,
		`${url} must preserve its URL`,
	);
}

async function checkVersion(): Promise<void> {
	const response = await get(`${origin}/api/live?release=${APP_VERSION}`);
	assert.equal(response.status, 200, "/api/live must return 200");
	assert.equal(response.headers.get("Cache-Control"), "no-store", "/api/live must not be cached");
	assert.deepEqual(await response.json(), { status: "ok", version: APP_VERSION });
}

async function checkHomepage(): Promise<void> {
	const response = await get(`${origin}/`);
	assert.equal(response.status, 200, "The homepage must return 200");
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		assert.equal(response.headers.get(name), value, `The homepage must include ${name}`);
	}
	assert(
		!response.headers.get("X-Robots-Tag")?.includes("noindex"),
		"Production must be indexable",
	);
	const html = await response.text();
	assert(html.includes(`v${APP_VERSION}`), `Prerendered HTML must report v${APP_VERSION}`);
	assert(html.includes(`rel="canonical" href="${origin}/"`), "The canonical URL must use the apex");
}

/** Exercise real asset routes: a passing API check alone cannot prove Worker-first routing. */
export async function verifyDeployment(): Promise<void> {
	const checks = await Promise.allSettled([
		...["/", "/ui/button?check=release&theme=dark", "/api/live?check=release", "/favicon.ico"].map(
			checkRedirect,
		),
		checkVersion(),
		checkHomepage(),
	]);
	const failures = checks.filter((check) => check.status === "rejected");
	if (failures.length) {
		throw new AggregateError(
			failures.map((failure) => failure.reason),
			failures.map((failure) => String(failure.reason)).join("\n"),
		);
	}
}

if (import.meta.main) {
	for (let attempt = 1; attempt <= 6; attempt++) {
		try {
			await verifyDeployment();
			console.log(
				`Verified v${APP_VERSION}: www redirects, live version, and prerendered homepage.`,
			);
			break;
		} catch (error) {
			if (attempt === 6) throw error;
			console.warn(
				`Deployment check ${attempt}/6 failed; retrying in 10 seconds.\n${String(error)}`,
			);
			await setTimeout(10_000);
		}
	}
}
