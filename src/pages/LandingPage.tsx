import { Link } from "@nocoo/basalt/components/link";
import { BasaltLogo } from "@/components/BasaltLogo";
import { useSiteTitle } from "@/hooks/use-site-title";
import {
	LANDING_FACTS,
	LANDING_HEADING,
	LANDING_HERO_IMAGE,
	LANDING_INSTALL,
	LANDING_KICKER,
	LANDING_LEDE,
	LANDING_PACKAGE_LINKS,
	LANDING_PRIMARY_LINKS,
	LANDING_RELATED_LINKS,
	LANDING_SECTION_IMAGE,
} from "@/lib/landing";
import { SITE } from "@/lib/site";

export default function LandingPage() {
	useSiteTitle();

	return (
		<div className="min-h-screen bg-[#171717] text-[#ececec]">
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:bg-[#171717] focus:px-3 focus:py-2"
			>
				Skip to main content
			</a>
			<header className="relative z-10 flex items-center justify-between gap-4 px-5 py-4 md:px-10">
				<p className="flex items-center gap-2 text-sm tracking-wide">
					<BasaltLogo className="h-6 w-6 object-contain" />
					<span>{SITE.title}</span>
				</p>
				<nav
					aria-label="Site"
					className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#d7c4a3]"
				>
					{LANDING_PRIMARY_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-[#d7c4a3] no-underline hover:underline"
						>
							{link.label}
						</Link>
					))}
					{LANDING_PACKAGE_LINKS.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className="text-[#d7c4a3] no-underline hover:underline"
						>
							{link.label}
						</Link>
					))}
				</nav>
			</header>

			<main id="main-content">
				<section className="relative min-h-[70vh] overflow-hidden">
					<img
						src={LANDING_HERO_IMAGE}
						alt="Aerial view of dark volcanic ridges in mist"
						width={1536}
						height={1024}
						fetchPriority="high"
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-[#171717]/70" />
					<div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-end px-5 pb-16 pt-24 md:px-10">
						<p className="text-xs tracking-[0.2em] text-[#a8987e] lowercase">{LANDING_KICKER}</p>
						<h1 className="mt-3 font-display text-4xl font-semibold tracking-tight md:text-5xl">
							{LANDING_HEADING}
						</h1>
						<p className="mt-4 max-w-xl text-base text-[#c8c4bc] md:text-lg">{LANDING_LEDE}</p>
						<div className="mt-8 flex flex-wrap gap-3">
							<a
								href="/ui"
								className="inline-flex h-9 items-center rounded-md bg-basalt-primary px-4 text-sm font-medium text-basalt-primary-foreground no-underline"
							>
								Browse the catalog
							</a>
							<a
								href={SITE.npm}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-9 items-center rounded-md bg-basalt-control px-4 text-sm font-medium text-basalt-foreground no-underline"
							>
								Install on npm
							</a>
						</div>
					</div>
				</section>

				<section className="mx-auto grid max-w-5xl gap-8 px-5 py-16 md:grid-cols-3 md:px-10">
					{LANDING_FACTS.map((fact) => (
						<article key={fact.title}>
							<h2 className="text-sm font-semibold tracking-wide">{fact.title}</h2>
							<p className="mt-2 text-sm leading-6 text-[#b7b3ab]">{fact.body}</p>
						</article>
					))}
				</section>

				<section className="relative overflow-hidden">
					<img
						src={LANDING_SECTION_IMAGE}
						alt="Aerial view of a dark rocky shoreline"
						width={1536}
						height={1024}
						className="absolute inset-0 h-full w-full object-cover"
					/>
					<div className="absolute inset-0 bg-[#171717]/75" />
					<div className="relative mx-auto max-w-3xl px-5 py-20 md:px-10">
						<h2 className="text-xl font-semibold">A design system for dense software</h2>
						<p className="mt-4 text-sm leading-7 text-[#c8c4bc]">
							{SITE.name} is a React 19 component library and a public catalog. It is built for
							information-rich products: tables, filters, charts, app shells and long sessions. The
							identity is a Hanbaiyu marble corner tower; the interface is matte, measured and
							quiet.
						</p>
						<p className="mt-4 text-sm leading-7 text-[#c8c4bc]">
							Install <code className="text-[#d7c4a3]">{SITE.packageName}</code>. Read the catalog
							at <Link href="/ui">/ui</Link>. Application recipes live at{" "}
							<Link href="/layout">/layout</Link> and <Link href="/login">/login</Link>.
						</p>
					</div>
				</section>

				<section className="mx-auto max-w-3xl px-5 py-16 md:px-10">
					<h2 className="text-xl font-semibold">Install</h2>
					<pre className="mt-4 overflow-x-auto bg-black/40 px-4 py-3 text-sm text-[#d7c4a3]">
						<code>{LANDING_INSTALL}</code>
					</pre>
					<p className="mt-6 text-sm">
						<Link href="/ui">Catalog</Link>
						{" · "}
						<Link href="/dashboard">Examples</Link>
						{" · "}
						<Link href={SITE.github} target="_blank" rel="noopener noreferrer">
							GitHub
						</Link>
					</p>
				</section>
			</main>

			<footer className="border-t border-white/10 px-5 py-8 text-sm text-[#9a958c] md:px-10">
				<p>
					{SITE.title} · {SITE.packageName}
				</p>
				<p className="mt-2">
					Related:{" "}
					{LANDING_RELATED_LINKS.map((link, index) => (
						<span key={link.href}>
							{index > 0 ? " · " : null}
							<Link href={link.href} target="_blank" rel="noopener noreferrer">
								{link.label}
							</Link>
						</span>
					))}
				</p>
			</footer>
		</div>
	);
}
