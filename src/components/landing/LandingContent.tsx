import { Kbd } from "@nocoo/basalt/components/kbd";
import {
	ArrowRight,
	ArrowUp,
	ArrowUpRight,
	Atom,
	Braces,
	Check,
	CheckCheck,
	FileCode2,
	Layers,
	Plus,
	Search,
	Triangle,
	Wind,
	Zap,
} from "lucide-react";
import {
	type AnchorHTMLAttributes,
	type ElementType,
	type ReactNode,
	type SyntheticEvent,
	useState,
} from "react";
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
	LANDING_STACK,
	LANDING_STATS,
	LANDING_STEPS,
	LANDING_STORY,
	LANDING_STORY_CLOSE,
	LANDING_TEMPLATES,
} from "@/lib/landing";
import {
	type LandingScene,
	SCENES,
	sceneImageUrl,
	sceneSrcSet,
	TEMPLATE_IMAGE_SIZES,
	templateImageUrl,
	templateSrcSet,
} from "@/lib/landing-images";
import { SITE } from "@/lib/site";
import { APP_VERSION } from "@/lib/version";

type LandingLinkComponent = ElementType<
	AnchorHTMLAttributes<HTMLAnchorElement> & Record<string, unknown> & { href: string }
>;

interface LandingContentProps {
	linkComponent?: LandingLinkComponent;
	installAction?: ReactNode;
	brandArtwork?: ReactNode;
}

function ScenePicture({ scene, priority = false }: { scene: LandingScene; priority?: boolean }) {
	const { width, height, sizes, widths } = SCENES[scene];
	return (
		<picture className="landing-scene">
			<source type="image/avif" srcSet={sceneSrcSet(scene, "avif")} sizes={sizes} />
			<img
				src={sceneImageUrl(scene, widths[1], "webp")}
				srcSet={sceneSrcSet(scene, "webp")}
				sizes={sizes}
				alt=""
				width={width}
				height={height}
				loading={priority ? "eager" : "lazy"}
				fetchPriority={priority ? "high" : undefined}
				decoding={priority ? undefined : "async"}
			/>
		</picture>
	);
}

function TemplatePicture({ name, alt }: { name: string; alt: string }) {
	return (
		<picture>
			<source
				type="image/avif"
				srcSet={templateSrcSet(name, "avif")}
				sizes={TEMPLATE_IMAGE_SIZES}
			/>
			<img
				src={templateImageUrl(name, 1200, "webp")}
				srcSet={templateSrcSet(name, "webp")}
				sizes={TEMPLATE_IMAGE_SIZES}
				alt={alt}
				width={3200}
				height={2000}
				loading="lazy"
				decoding="async"
			/>
		</picture>
	);
}

function Pill({ children }: { children: ReactNode }) {
	return <p className="landing-pill">{children}</p>;
}

const CONSOLE_KPIS = [
	{ label: "Monthly revenue", value: "$48.2k", delta: "+4.1%", up: true },
	{ label: "Active seats", value: "1,284", delta: "+2.3%", up: true },
	{ label: "Churn", value: "1.8%", delta: "−0.4%", up: true },
	{ label: "Open incidents", value: "3", delta: "+1", up: false },
];
const CONSOLE_BARS = [38, 52, 44, 61, 49, 70, 64, 58, 77, 69, 86, 80];
const CONSOLE_ACCOUNTS = [
	{ name: "Northwind", plan: "Enterprise", amount: "$12,400", share: 92 },
	{ name: "Lumora", plan: "Growth", amount: "$8,950", share: 74 },
	{ name: "Arcline", plan: "Growth", amount: "$6,210", share: 58 },
	{ name: "Halcyon", plan: "Starter", amount: "$2,780", share: 31 },
];

/** A static, decorative product surface drawn with the same tokens the components use. */
function HeroConsole() {
	return (
		<div className="landing-console" aria-hidden="true">
			<div className="landing-console-bar">
				<span className="landing-console-search">
					<Search size={14} />
					Search accounts, metrics, reports…
					<Kbd className="ml-auto border-0 bg-transparent text-current shadow-none">⌘K</Kbd>
				</span>
				<span className="landing-console-tabs">
					<span data-active="">Overview</span>
					<span>Accounts</span>
					<span>Reports</span>
				</span>
				<span className="landing-console-live">
					<span className="landing-dot" />
					Live
				</span>
			</div>
			<div className="landing-console-kpis">
				{CONSOLE_KPIS.map((kpi) => (
					<div key={kpi.label} className="landing-console-tile">
						<span>{kpi.label}</span>
						<strong>{kpi.value}</strong>
						<em data-trend={kpi.up ? "up" : "down"}>{kpi.delta} vs last month</em>
					</div>
				))}
			</div>
			<div className="landing-console-panels">
				<div className="landing-console-panel">
					<div className="landing-console-panel-head">
						<span>Revenue</span>
						<span className="landing-console-muted">Jan – Dec</span>
					</div>
					<div className="landing-console-chart">
						{CONSOLE_BARS.map((height, index) => (
							<span key={index} style={{ height: `${height}%` }} />
						))}
					</div>
				</div>
				<div className="landing-console-panel">
					<div className="landing-console-panel-head">
						<span>Top accounts</span>
						<span className="landing-console-muted">4 of 128</span>
					</div>
					<ul className="landing-console-rows">
						{CONSOLE_ACCOUNTS.map((account) => (
							<li key={account.name}>
								<span className="landing-console-avatar">{account.name[0]}</span>
								<span>{account.name}</span>
								<span className="landing-console-badge">{account.plan}</span>
								<span className="landing-console-amount">{account.amount}</span>
								<span className="landing-console-meter">
									<span style={{ width: `${account.share}%` }} />
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}

function ControlsSample() {
	return (
		<div className="landing-sample landing-sample-controls" aria-hidden="true">
			<div>
				<span className="landing-sample-primary">
					<Plus size={14} /> Create project
				</span>
				<span className="landing-sample-ghost">Cancel</span>
			</div>
			<div>
				<span className="landing-sample-status">
					<Check size={12} /> Published
				</span>
				<span className="landing-sample-switch">
					<span />
				</span>
				<span className="landing-sample-checkbox">
					<Check size={12} />
				</span>
			</div>
		</div>
	);
}

const SAMPLE_BARS = [36, 54, 43, 66, 52, 78, 68, 58, 85, 72, 92, 80];

function ChartSample() {
	return (
		<div className="landing-sample landing-sample-chart" aria-hidden="true">
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

function FlowSample() {
	return (
		<div className="landing-sample landing-sample-flow" aria-hidden="true">
			<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
				<path d="M26 50 H32.5 V24 H39 M32.5 50 V76 H39 M61 24 H67.5 V76 M61 76 H67.5 M67.5 50 H74" />
			</svg>
			<span className="landing-flow-node" data-active="" style={{ left: "4%", top: "38.5%" }}>
				Shell <em>frame</em>
			</span>
			<span className="landing-flow-node" style={{ left: "39%", top: "12.5%" }}>
				Navigation <em>sidebar</em>
			</span>
			<span className="landing-flow-node" style={{ left: "39%", top: "64.5%" }}>
				Content <em>island</em>
			</span>
			<span className="landing-flow-node" style={{ left: "74%", top: "38.5%" }}>
				Command <em>⌘K</em>
			</span>
		</div>
	);
}

function SurfaceSample() {
	return (
		<div className="landing-sample landing-sample-surface" aria-hidden="true">
			<div className="landing-surface-island">
				<div className="landing-surface-card">
					<span />
					<span />
					<span />
				</div>
				<div className="landing-surface-card">
					<span />
					<span />
				</div>
			</div>
		</div>
	);
}

const SAMPLES = [ControlsSample, ChartSample, FlowSample, SurfaceSample];
const STACK_ICONS = [Atom, FileCode2, Wind, Braces, Triangle, Zap];

function TemplateShowcase({ Link }: { Link: LandingLinkComponent }) {
	const [selected, setSelected] = useState(0);
	const template = LANDING_TEMPLATES[selected];
	function onToggle(index: number) {
		return (event: SyntheticEvent<HTMLDetailsElement>) => {
			if (event.currentTarget.open) setSelected(index);
		};
	}
	return (
		<div className="landing-showcase">
			<figure className="landing-showcase-frame">
				<ScenePicture scene="dusk" />
				<Link
					href={template.href}
					className="landing-showcase-window"
					aria-label={`Open the ${template.name} template`}
				>
					<TemplatePicture
						key={template.image}
						name={template.image}
						alt={`${template.name} template preview`}
					/>
				</Link>
			</figure>
			<div className="landing-showcase-list">
				{LANDING_TEMPLATES.map((item, index) => (
					<details
						key={item.href}
						name="landing-template"
						open={index === 0}
						onToggle={onToggle(index)}
					>
						<summary>
							<span>
								<span className="landing-showcase-category">{item.category}</span>
								{item.name}
							</span>
							<Plus size={18} aria-hidden="true" />
						</summary>
						<p>{item.description}</p>
						<Link href={item.href} className="landing-text-link">
							Explore template
							<ArrowRight size={14} aria-hidden="true" />
						</Link>
					</details>
				))}
				<div className="landing-showcase-more">
					<span>There’s more to build on.</span>
					<Link href="/health">
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
			</div>
		</div>
	);
}

/** Shared by the interactive route and the generated HTML document. Dark mode only. */
export function LandingContent({
	linkComponent: Link = "a",
	installAction,
	brandArtwork,
}: LandingContentProps) {
	return (
		<div id="top" className="landing dark" data-mode="dark" data-landing-page tabIndex={-1}>
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
						<a
							href={SITE.github}
							target="_blank"
							rel="noopener noreferrer"
							className="landing-icon-link"
							aria-label="GitHub repository"
						>
							<span className="sr-only">GitHub repository</span>
							<Github aria-hidden="true" size={18} strokeWidth={1.5} />
						</a>
						<a
							href="https://hexly.ai/projects/basalt"
							target="_blank"
							rel="noopener noreferrer"
							className="landing-icon-link"
							aria-label="Basalt on hexly.ai (opens in a new tab)"
						>
							<span className="sr-only">Basalt on hexly.ai</span>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={1.5}
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="m12 2 8.66 5v10L12 22l-8.66-5V7Z" />
								<path d="M12 2v20M3.34 7l17.32 10m0-10L3.34 17" />
							</svg>
						</a>
						<Link href="/ui" className="landing-button landing-button-light landing-header-cta">
							Open catalog
							<ArrowRight size={15} aria-hidden="true" />
						</Link>
					</div>
				</div>
			</header>

			<main id="main-content" className="landing-main" tabIndex={-1}>
				<section className="landing-hero" aria-labelledby="landing-title">
					<ScenePicture scene="hero" priority />
					<div className="landing-container landing-hero-copy">
						<a href="#foundation" className="landing-pill landing-pill-link">
							<span className="landing-dot" />
							{LANDING_KICKER}
							<ArrowRight size={13} aria-hidden="true" />
						</a>
						<h1 id="landing-title">
							<span>{LANDING_HEADING_LINES[0]}</span>{" "}
							<span>
								<em>for complex</em> interfaces
							</span>
						</h1>
						<p className="landing-lede">{LANDING_LEDE}</p>
						<div className="landing-hero-actions">
							<Link href="/ui" className="landing-button landing-button-light">
								Browse components
								<ArrowRight size={16} aria-hidden="true" />
							</Link>
							<a href="#templates" className="landing-button landing-button-ghost">
								Explore templates
								<ArrowUpRight size={16} aria-hidden="true" />
							</a>
						</div>
					</div>
					<figure className="landing-container landing-preview">
						<HeroConsole />
						<figcaption>
							<span>
								<span className="landing-dot" /> Drawn with Basalt tokens. The real thing is one
								click away.
							</span>
							<Link href="/dashboard">
								Open dashboard
								<ArrowUpRight size={14} aria-hidden="true" />
							</Link>
						</figcaption>
					</figure>
				</section>

				<div className="landing-container">
					<section className="landing-about" aria-labelledby="about-title">
						<div className="landing-about-copy">
							<Pill>Why Basalt</Pill>
							<h2 id="about-title" className="sr-only">
								Why Basalt
							</h2>
							{LANDING_STORY.map((paragraph) => (
								<p key={paragraph}>{paragraph}</p>
							))}
							<p>
								{LANDING_STORY_CLOSE.lead}{" "}
								<span className="landing-fade">{LANDING_STORY_CLOSE.fade}</span>
							</p>
							<a href="#foundation" className="landing-button landing-button-light">
								See how it fits together
								<ArrowRight size={15} aria-hidden="true" />
							</a>
						</div>
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
							<a
								href={`${SITE.github}/blob/main/LICENSE`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<strong>MIT</strong>
								<span>
									Yours to build with
									<ArrowUpRight size={13} aria-hidden="true" />
								</span>
							</a>
						</nav>
					</section>

					<section className="landing-stack" aria-label="Supported stack">
						<p>Works with the stack you already ship</p>
						<ul>
							{LANDING_STACK.map((name, index) => {
								const Icon = STACK_ICONS[index];
								return (
									<li key={name}>
										<Icon size={17} aria-hidden="true" />
										{name}
									</li>
								);
							})}
						</ul>
					</section>

					<section id="templates" className="landing-section" aria-labelledby="templates-title">
						<div className="landing-section-heading">
							<div>
								<Pill>Templates</Pill>
								<h2 id="templates-title">
									From a single component
									<br />
									to a finished screen
								</h2>
							</div>
							<p>
								Explore working examples and adapt their components and layouts to your application.
								Every screen is a real route in this site.
							</p>
						</div>
						<TemplateShowcase Link={Link} />
					</section>

					<section id="foundation" className="landing-section" aria-labelledby="foundation-title">
						<div className="landing-section-heading">
							<div>
								<Pill>The system</Pill>
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
										<Sample />
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

					<section id="get-started" className="landing-section" aria-labelledby="install-title">
						<div className="landing-section-heading">
							<div>
								<Pill>Get started</Pill>
								<h2 id="install-title">
									Install it. Compose it.
									<br />
									Ship it.
								</h2>
							</div>
							<p>Start with a component. Grow into a system. The source is open.</p>
						</div>
						<ol className="landing-steps">
							{LANDING_STEPS.map((step, index) => (
								<li key={step.title}>
									<h3>
										<span>{index + 1}.</span>
										{step.title}
									</h3>
									<p>{step.body}</p>
									<code>{step.code}</code>
								</li>
							))}
						</ol>
						<div className="landing-install">
							<ScenePicture scene="teal" />
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
								<div className="landing-install-actions">
									<Link href="/ui" className="landing-button landing-button-light">
										Open the catalog
										<ArrowRight size={15} aria-hidden="true" />
									</Link>
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
							</div>
						</div>
					</section>

					<section className="landing-brand-story" aria-labelledby="brand-title">
						<div className="landing-brand-intro">
							<Pill>The Basalt mark</Pill>
							<h2 id="brand-title">
								A design built
								<br />
								<em>in layers</em>
							</h2>
							<p>
								A familiar silhouette.
								<br />A character all its own.
							</p>
						</div>
						{brandArtwork ?? <BrandArtwork />}
						<div className="landing-brand-details">
							<span className="landing-brand-material">
								<Layers size={14} aria-hidden="true" /> 01 / Form & material
							</span>
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

					<section className="landing-faq landing-section" aria-labelledby="faq-title">
						<div>
							<Pill>FAQ</Pill>
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

					<section className="landing-cta" aria-labelledby="cta-title">
						<ScenePicture scene="night" />
						<div className="landing-cta-copy">
							<h2 id="cta-title">
								Build the <em>calm</em> version
								<br />
								of your busiest screen
							</h2>
							<p>Dense, dark, durable. A little less noise. A better place to build.</p>
							<Link href="/ui" className="landing-button landing-button-light">
								Start with the catalog
								<ArrowRight size={16} aria-hidden="true" />
							</Link>
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
								The matte React design system
								<br />
								for dashboards and dense software.
							</p>
						</div>
						<nav aria-label="Product">
							<h2>Explore</h2>
							<Link href="/ui">Components</Link>
							<Link href="/templates">Templates</Link>
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
								<span className="landing-dot" />
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
