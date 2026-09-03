import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button } from "@nocoo/basalt/components/button";
import { Link } from "@nocoo/basalt/components/link";
import { Sheet, SheetContent, SheetTitle } from "@nocoo/basalt/components/sheet";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router";
import { AccentPicker } from "@/components/AccentPicker";
import { AppSidebar } from "@/components/AppSidebar";
import { Github } from "@/components/icons/github";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { CATALOG_BY_SLUG, catalogNavName } from "@/pages/ui/catalog";

// Map route paths to i18n keys
const PAGE_TITLE_KEYS: Record<string, string> = {
	"/components": "nav.components",
	"/forms": "nav.forms",
	"/tables": "nav.tables",
	"/buttons": "nav.buttons",
	"/feedback": "nav.feedback",
	"/overlays": "nav.overlays",
	"/data-display": "nav.dataDisplay",
	"/navigation": "nav.navigation",
	"/wearable": "nav.wearableHealth",
	"/banking": "nav.bankingWealth",
	"/network": "nav.networkOps",
	"/health": "nav.health",
	"/pills": "nav.pills",
	"/": "nav.dashboard",
	"/accounts": "nav.accounts",
	"/progress-tracking": "nav.progressTracking",
	"/flow-comparison": "nav.flowComparison",
	"/portfolio": "nav.portfolio",
	"/layout": "nav.layout",
	"/dialogs": "nav.dialogs",
	"/settings": "nav.settings",
	"/palette": "nav.colorPalette",
	"/interactions": "nav.interactions",
	"/interactive": "nav.interactive",
	"/data": "nav.data",
	"/ui": "nav.kitIndex",
};

export function DashboardLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();
	const { t } = useTranslation();
	const { theme } = useTheme();

	const catalogSlug = location.pathname.startsWith("/ui/")
		? location.pathname.slice("/ui/".length)
		: undefined;
	const catalogEntry = catalogSlug ? CATALOG_BY_SLUG.get(catalogSlug) : undefined;
	const catalogTitle = catalogEntry ? catalogNavName(catalogEntry) : undefined;
	const titleKey = PAGE_TITLE_KEYS[location.pathname] ?? "nav.dashboard";
	const title = catalogTitle ?? t(titleKey);
	const crumbs = location.pathname.startsWith("/ui")
		? [{ href: "/ui", label: t("nav.kit") }]
		: [{ href: "/", label: t("nav.examples") }];

	// Close mobile sidebar on route change: pathname is the intentional trigger.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value used inside
	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		if (mobileOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	return (
		<AppShell>
			<AppSkipLink>{t("common.skipToMain")}</AppSkipLink>
			{!isMobile ? (
				<AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
			) : (
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent
						side="left"
						className="w-[260px] max-w-[260px] border-0 bg-basalt-background p-0"
					>
						<SheetTitle className="sr-only">{t("common.openNav")}</SheetTitle>
						<AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
					</SheetContent>
				</Sheet>
			)}
			<AppMain>
				<AppHeader
					leading={
						isMobile ? (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								onClick={() => setMobileOpen(true)}
								aria-label={t("common.openNav")}
							>
								<Menu aria-hidden="true" />
							</Button>
						) : null
					}
					breadcrumbs={crumbs}
					title={title}
					actions={
						<>
							<LanguageToggle />
							<AccentPicker />
							<Link
								href="https://github.com/nocoo/basalt"
								target="_blank"
								rel="noopener noreferrer"
								aria-label={t("common.github")}
								className="flex h-8 w-8 items-center justify-center rounded-lg text-basalt-muted-foreground no-underline transition-colors hover:bg-basalt-accent hover:text-basalt-foreground"
							>
								<Github className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.5} />
							</Link>
							<ThemeToggle aria-label={t("common.toggleTheme", { theme })} />
						</>
					}
				/>
				<div className="flex min-h-0 flex-1 flex-col px-2 pb-2 md:px-3 md:pb-3">
					<ContentIsland data-doc-scroll>
						<Outlet />
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
