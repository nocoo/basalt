import { LinkButton } from "@nocoo/basalt/components/button";
import { ArrowRight, ArrowUp, ArrowUpRight, Check, CheckCheck, Code2, Plus } from "lucide-react";
import type { AnchorHTMLAttributes, ElementType, ReactNode } from "react";
import { BasaltLogo } from "@/components/BasaltLogo";
import { Github } from "@/components/icons/github";
import { BrandArtwork } from "@/components/landing/BrandArtwork";
import {
	LANDING_FACTS,
	LANDING_FAQS,
	LANDING_HEADING_LINES,
	LANDING_INSTALL,
	LANDING_KICKER,
	LANDING_LEDE,
	LANDING_PACKAGE_LINKS,
	LANDING_PRIMARY_LINKS,
	LANDING_RELATED_LINKS,
	LANDING_STATS,
	LANDING_TEMPLATES,
} from "@/lib/landing";
import {
	CARD_IMAGE_SIZES,
	HERO_IMAGE_SIZES,
	templateImageUrl,
	templateSrcSet,
} from "@/lib/landing-images";
import { SITE } from "@/lib/site";
import { APP_VERSION } from "@/lib/version";
import { HeaderTooltip, HexlyLink } from "../header-links";

interface LandingContentProps {
	linkComponent?: ElementType<
		AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown> & { href: string }
	>;
	themeToggle?: ReactNode;
	installAction?: ReactNode;
	brandArtwork?: ReactNode;
	imageMode?: "light" | "dark";
}

function TemplateImage({
	name,
	alt,
	mode,
	hero = false,
}: {
	name: string;
	alt: string;
	mode?: "light" | "dark";
	hero?: boolean;
}) {
	const sizes = hero ? HERO_IMAGE_SIZES : CARD_IMAGE_SIZES;
	// Without an explicit mode (the prerendered document) the system color scheme picks a variant.
	const darkMedia = mode ? (mode === "dark" ? "all" : "not all") : "(prefers-color-scheme: dark)";
	const mobileDarkMedia = mode
		? mode === "dark"
			? "(max-width: 30rem)"
			: "not all"
		: "(max-width: 30rem) and (prefers-color-scheme: dark)";
	return (
		<picture>
			{hero && (
				<>
					<source
						media={mobileDarkMedia}
						type="image/avif"
						srcSet="/landing/dashboard-dark-mobile.avif"
					/>
					<source
						media={mobileDarkMedia}
						type="image/webp"
						srcSet="/landing/dashboard-dark-mobile.webp"
					/>
					<source
						media="(max-width: 30rem)"
						type="image/avif"
						srcSet="/landing/dashboard-light-mobile.avif"
					/>
					<source
						media="(max-width: 30rem)"
						type="image/webp"
						srcSet="/landing/dashboard-light-mobile.webp"
					/>
				</>
			)}
			<source
				media={darkMedia}
				type="image/avif"
				srcSet={templateSrcSet(name, "dark", "avif")}
				sizes={sizes}
			/>
			<source
				media={darkMedia}
				type="image/webp"
				srcSet={templateSrcSet(name, "dark", "webp")}
				sizes={sizes}
			/>
			<source type="image/avif" srcSet={templateSrcSet(name, "light", "avif")} sizes={sizes} />
			<img
				src={templateImageUrl(name, "light", 1200, "webp")}
				srcSet={templateSrcSet(name, "light", "webp")}
				sizes={sizes}
				alt={alt}
				width={3200}
				height={2000}
				loading={hero ? "eager" : "lazy"}
				fetchPriority={hero ? "high" : undefined}
				decoding={hero ? undefined : "async"}
			/>
		</picture>
	);
}

function ComponentSample() {
	return (
		<div className="landing-component-sample" aria-hidden="true">
			<div className="landing-sample-actions">
				<span className="landing-sample-primary">
					<Plus size={15} /> Create project
				</span>
				<span className="landing-sample-icon">
					<Plus size={17} />
				</span>
			</div>
			<div className="landing-sample-controls">
				<span className="landing-sample-status">
					<Check size={12} /> Published
				</span>
				<span className="landing-sample-switch">
					<span />
				</span>
				<span className="landing-sample-checkbox">
					<Check size={13} />
				</span>
			</div>
		</div>
	);
}

const SAMPLE_BARS = [36, 54, 43, 66, 52, 78, 68, 58, 85, 72, 92, 80];

function ChartSample() {
	return (
		<div className="landing-chart-sample" aria-hidden="true">
			<div className="landing-sample-metric">
				<span>Monthly revenue</span>
				<strong>$24,680</strong>
			</div>
			<div className="landing-sample-bars">
				{SAMPLE_BARS.map((height, index) => (
					<span key={index} style={{ height: `${height}%` }} />
				))}
			</div>
		</div>
	);
}

function SurfaceSample() {
	return (
		<div className="landing-surface-sample" aria-hidden="true">
			{(["light", "dark"] as const).map((mode) => (
				<div key={mode} className={`landing-surface-half ${mode}`}>
					<div className="landing-surface-island">
						<div className="landing-surface-card">
							<span />
							<span />
							<span />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

const SAMPLES = [ComponentSample, ChartSample, SurfaceSample];

/** Shared by the interactive route and the generated HTML document. */
export function LandingContent({
	linkComponent: Link = "a",
	themeToggle,
	installAction,
	brandArtwork,
	imageMode,
}: LandingContentProps) {
	return (
		<div id="top" className="landing" data-landing-page tabIndex={-1}>
			<a className="landing-skip-link" href="#main-content">
				Skip to main content
			</a>
			<header className="landing-header">
				<div className="landing-header-inner">
					<Link href="/" className="landing-brand" aria-label="Basalt home">
						<BasaltLogo alt="" className="landing-logo" />
						<span>{SITE.title}</span>
					</Link>
					<nav aria-label="Main navigation" className="landing-nav">
						{LANDING_PRIMARY_LINKS.map((link) =>
							link.href.startsWith("#") ? (
								<a key={link.href} href={link.href}>
									{link.label}
								</a>
							) : (
								<Link key={link.href} href={link.href}>
									{link.label}
								</Link>
							),
						)}
					</nav>
					<div className="landing-header-actions">
						<HeaderTooltip label="GitHub repository">
							<LinkButton
								variant="ghost"
								size="icon"
								href={SITE.github}
								target="_blank"
								rel="noopener noreferrer"
								className="landing-github [&_svg]:size-[1.125rem]"
								aria-label="GitHub repository"
							>
								<span className="sr-only">GitHub repository</span>
								<Github aria-hidden="true" size={18} strokeWidth={1.5} />
							</LinkButton>
						</HeaderTooltip>
						<HexlyLink className="landing-github" />
						{themeToggle}
					</div>
				</div>
			</header>

			<main id="main-content" className="landing-main" tabIndex={-1}>
				<section className="landing-hero" aria-labelledby="landing-title">
					<div className="landing-container">
						<div className="landing-hero-copy">
							<p className="landing-eyebrow">
								<span className="landing-status-dot" />
								{LANDING_KICKER}
							</p>
							<h1 id="landing-title">
								<span>{LANDING_HEADING_LINES[0]}</span> <span>{LANDING_HEADING_LINES[1]}</span>
							</h1>
							<p className="landing-lede">{LANDING_LEDE}</p>
							<div className="landing-hero-actions">
								<Link href="/ui" className="landing-button landing-button-primary">
									Browse components
									<ArrowRight size={17} aria-hidden="true" />
								</Link>
								<a href="#templates" className="landing-button landing-button-secondary">
									Explore templates
									<ArrowUpRight size={17} aria-hidden="true" />
								</a>
							</div>
							<p className="landing-hero-note">
								<span>React 19</span>
								<span>TypeScript</span>
								<span>Open source · MIT</span>
							</p>
						</div>
						<figure className="landing-preview">
							<Link
								href="/dashboard"
								className="landing-preview-link"
								aria-label="Explore the live analytics dashboard"
							>
								<TemplateImage
									name="dashboard"
									alt="Basalt health dashboard with care metrics and charts"
									mode={imageMode}
									hero
								/>
							</Link>
							<figcaption>
								<span>
									<span className="landing-status-dot" /> A working dashboard built with Basalt
								</span>
								<Link href="/dashboard">
									Open dashboard
									<ArrowUpRight size={14} aria-hidden="true" />
								</Link>
							</figcaption>
						</figure>
					</div>
				</section>

				<div className="landing-container">
					<nav className="landing-stats" aria-label="Inside the library">
						{LANDING_STATS.map((stat) => (
							<Link key={stat.label} href={stat.href}>
								<strong>{stat.value}</strong>
								<span>
									{stat.label}
									<ArrowUpRight size={13} aria-hidden="true" />
								</span>
							</Link>
						))}
						<a href={`${SITE.github}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
							<strong>MIT</strong>
							<span>
								Yours to build with
								<ArrowUpRight size={13} aria-hidden="true" />
							</span>
						</a>
					</nav>

					<section id="templates" className="landing-section" aria-labelledby="templates-title">
						<div className="landing-section-heading">
							<div>
								<p className="landing-eyebrow">The starting points</p>
								<h2 id="templates-title">Layouts to build on</h2>
							</div>
							<p>
								Explore working examples and adapt their components and layouts to your application.
							</p>
						</div>
						<div className="landing-template-grid">
							{LANDING_TEMPLATES.map((template) => (
								<article key={template.href} className="landing-template">
									<Link href={template.href} className="landing-template-link">
										<div className="landing-template-image">
											<TemplateImage
												name={template.image}
												alt={`${template.name} template preview`}
												mode={imageMode}
											/>
										</div>
										<div className="landing-template-copy">
											<p className="landing-eyebrow">{template.category}</p>
											<h3>
												{template.name}
												<ArrowUpRight size={19} aria-hidden="true" />
											</h3>
											<p>{template.description}</p>
											<span className="landing-text-link">
												Explore template
												<ArrowRight size={14} aria-hidden="true" />
											</span>
										</div>
									</Link>
								</article>
							))}
						</div>
						<div className="landing-template-more">
							<span>There’s more to build on.</span>
							<Link href="/wearable">
								Health & activity
								<ArrowUpRight size={13} aria-hidden="true" />
							</Link>
							<Link href="/layout">
								Application shell
								<ArrowUpRight size={13} aria-hidden="true" />
							</Link>
							<Link href="/login">
								Sign-in page
								<ArrowUpRight size={13} aria-hidden="true" />
							</Link>
						</div>
					</section>

					<section className="landing-brand-story" aria-labelledby="brand-title">
						<div className="landing-brand-intro">
							<p className="landing-eyebrow">The Basalt mark</p>
							<h2 id="brand-title">
								A design built
								<br />
								in layers
							</h2>
							<p>
								A familiar silhouette.
								<br />A character all its own.
							</p>
						</div>
						{brandArtwork ?? <BrandArtwork />}
						<div className="landing-brand-details">
							<span className="landing-brand-material">01 / Form & material</span>
							<p>
								White marble. Colorful roofs. A corner tower built from small, considered details.
							</p>
							<p>
								That same care for proportion, layers, and color runs through the entire design
								system.
							</p>
							<div
								className="landing-brand-colors"
								role="img"
								aria-label="Basalt colors: blue, pink, green, and gold"
							>
								<span />
								<span />
								<span />
								<span />
							</div>
							<Link href="/palette" className="landing-text-link">
								Explore our colors
								<ArrowUpRight size={14} aria-hidden="true" />
							</Link>
						</div>
					</section>

					<section
						className="landing-section landing-foundation"
						aria-labelledby="foundation-title"
					>
						<div className="landing-section-heading">
							<div>
								<p className="landing-eyebrow">The details add up</p>
								<h2 id="foundation-title">
									One system, from
									<br />
									controls to charts
								</h2>
							</div>
							<p>
								A consistent foundation from your first button to your busiest screen. Built to feel
								like one product.
							</p>
						</div>
						<div className="landing-feature-grid">
							{LANDING_FACTS.map((fact, index) => {
								const Sample = SAMPLES[index];
								return (
									<article key={fact.title} className="landing-feature">
										<div className="landing-feature-sample">
											<Sample />
										</div>
										<h3>{fact.title}</h3>
										<p>{fact.body}</p>
										<Link href={fact.href} className="landing-text-link">
											{fact.link}
											<ArrowRight size={14} aria-hidden="true" />
										</Link>
									</article>
								);
							})}
						</div>
					</section>

					<section id="get-started" className="landing-install" aria-labelledby="install-title">
						<div>
							<p className="landing-eyebrow">
								<Code2 size={15} aria-hidden="true" /> From here, it’s yours
							</p>
							<h2 id="install-title">
								Start building
								<br />
								with Basalt
							</h2>
							<p>
								Start with a component. Grow into a system.
								<br />
								The source is open, and the next move is yours.
							</p>
							<Link href="/ui" className="landing-button landing-button-primary">
								Open the catalog
								<ArrowRight size={16} aria-hidden="true" />
							</Link>
						</div>
						<div className="landing-install-panel">
							<div className="landing-install-label">
								<span>Start building</span>
								<span>npm</span>
							</div>
							<div className="landing-install-command">
								<span aria-hidden="true">$</span>
								<code>{LANDING_INSTALL}</code>
								{installAction}
							</div>
							<div className="landing-install-details">
								<span>
									<CheckCheck size={15} aria-hidden="true" /> React 19 & TypeScript
								</span>
								<span>
									<CheckCheck size={15} aria-hidden="true" /> Tailwind v4 or standalone CSS
								</span>
							</div>
							<a
								href={`${SITE.github}#readme`}
								target="_blank"
								rel="noopener noreferrer"
								className="landing-text-link"
							>
								Read the installation guide
								<ArrowUpRight size={14} aria-hidden="true" />
							</a>
						</div>
					</section>

					<section className="landing-faq landing-section" aria-labelledby="faq-title">
						<div>
							<p className="landing-eyebrow">A few useful answers</p>
							<h2 id="faq-title">Before you begin</h2>
							<a
								href={SITE.github}
								target="_blank"
								rel="noopener noreferrer"
								className="landing-text-link"
							>
								More on GitHub
								<ArrowUpRight size={14} aria-hidden="true" />
							</a>
						</div>
						<div className="landing-faq-list">
							{LANDING_FAQS.map((faq) => (
								<details key={faq.question}>
									<summary>
										{faq.question}
										<Plus size={18} aria-hidden="true" />
									</summary>
									<p>{faq.answer}</p>
								</details>
							))}
						</div>
					</section>
				</div>
			</main>

			<footer className="landing-footer">
				<div className="landing-container">
					<div className="landing-footer-top">
						<div>
							<Link href="/" className="landing-brand" aria-label="Basalt home">
								<BasaltLogo alt="" className="landing-logo" />
								<span>{SITE.title}</span>
							</Link>
							<p>
								Dense, dark, durable.
								<br />A little less noise. A better place to build.
							</p>
						</div>
						<nav aria-label="Product">
							<h2>Explore</h2>
							<Link href="/ui">Components</Link>
							<a href="#templates">Templates</a>
							<Link href="/palette">Color palette</Link>
						</nav>
						<nav aria-label="Resources">
							<h2>Resources</h2>
							{LANDING_PACKAGE_LINKS.map((link) => (
								<a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
									{link.label}
								</a>
							))}
							<a href="/llms.txt">For AI agents</a>
						</nav>
						<nav aria-label="Related projects">
							<h2>Elsewhere</h2>
							{LANDING_RELATED_LINKS.map((link) => (
								<a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
									{link.label}
								</a>
							))}
						</nav>
					</div>
					<div className="landing-footer-bottom">
						<p>
							Family of{" "}
							<a href={SITE.portfolio} target="_blank" rel="noopener noreferrer">
								hexly.ai
							</a>
							. Released under the MIT license. <span id="landing-version">v{APP_VERSION}</span>
						</p>
						<div className="landing-footer-actions">
							<span className="landing-footer-signature">
								Built with Basalt, naturally.
								<span className="landing-status-dot" />
							</span>
							<a href="#top" className="landing-back-to-top">
								Back to top
								<ArrowUp size={15} aria-hidden="true" />
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
