import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { Sheet, SheetContent, SheetTitle } from "@nocoo/basalt/components/sheet";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { useTheme } from "@nocoo/basalt/providers/theme";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router";
import { AccentPicker } from "@/components/AccentPicker";
import { AppSidebar } from "@/components/AppSidebar";
import { Github } from "@/components/icons/github";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteTitle } from "@/hooks/use-site-title";
import { SHOWCASE_TITLE_KEYS } from "@/lib/site";
import { CATALOG_BY_SLUG, catalogNavName } from "@/pages/ui/catalog";
import { catalogCategory, catalogCategoryPath } from "@/pages/ui/catalog-categories";
import { HeaderTooltip, HexlyLink } from "./header-links";
import { ThemeToggle } from "./theme-toggle";

function isTriggerVisible(el: HTMLElement | null): el is HTMLElement {
	if (!el?.isConnected) return false;
	const style = window.getComputedStyle(el);
	if (style.display === "none" || style.visibility === "hidden") return false;
	if (typeof el.checkVisibility === "function") {
		return el.checkVisibility();
	}
	// In browser environments with layout, getClientRects() > 0 when rendered.
	// In jsdom without layout engine, getClientRects().length is always 0.
	return true;
}

export function DashboardLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);
	const location = useLocation();
	const { t } = useTranslation();
	const { theme } = useTheme();

	const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
	const catalogSlug = location.pathname.startsWith("/ui/")
		? location.pathname.slice("/ui/".length).split("/")[0]
		: undefined;
	const catalogEntry = catalogSlug ? CATALOG_BY_SLUG.get(catalogSlug) : undefined;
	const overviewCategory =
		catalogSlug === "overview" ? catalogCategory(location.pathname.split("/")[3]) : undefined;
	const catalogTitle = catalogEntry ? catalogNavName(catalogEntry) : undefined;
	const titleKey = SHOWCASE_TITLE_KEYS[location.pathname] ?? "nav.dashboard";
	const title = overviewCategory
		? `${overviewCategory.label} overview`
		: catalogTitle
			? `${catalogTitle}${location.pathname.endsWith("/source") ? " source" : ""}`
			: t(titleKey);
	useSiteTitle(title);
	const crumbs = location.pathname.startsWith("/ui")
		? [{ href: "/ui", label: t("nav.kit") }]
		: [{ href: "/dashboard", label: t("nav.examples") }];
	const entryCategory = catalogCategory(catalogEntry?.category);
	if (entryCategory) {
		crumbs.push({ href: catalogCategoryPath(entryCategory.id), label: entryCategory.label });
	}

	// Close mobile sidebar on route change: pathname is the intentional trigger.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value used inside
	useEffect(() => {
		setMobileOpen(false);
	}, [location.pathname]);

	// Close mobile sidebar and clean up if viewport resizes to desktop.
	useEffect(() => {
		if (!isMobile) {
			setMobileOpen(false);
		}
	}, [isMobile]);

	useEffect(() => {
		if (mobileOpen && isMobile) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen, isMobile]);

	return (
		<AppShell className="relative h-dvh" data-dashboard-shell>
			<AppSkipLink>{t("common.skipToMain")}</AppSkipLink>
			{!isMobile ? (
				<AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
			) : (
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent
						side="left"
						className="w-[16.25rem] max-w-[16.25rem] border-0 bg-basalt-background p-0"
						onCloseAutoFocus={(event) => {
							const trigger = mobileTriggerRef.current;
							if (isTriggerVisible(trigger)) {
								event.preventDefault();
								trigger.focus();
							}
						}}
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
							<HeaderTooltip label={t("common.openNav")}>
								<Button
									ref={mobileTriggerRef}
									variant="ghost"
									size="icon"
									className="w-8"
									onClick={() => setMobileOpen(true)}
									aria-label={t("common.openNav")}
								>
									<Menu aria-hidden="true" />
								</Button>
							</HeaderTooltip>
						) : null
					}
					breadcrumbs={isMobile ? undefined : crumbs}
					title={title}
					actions={
						<>
							<LanguageToggle />
							<AccentPicker />
							<HeaderTooltip label={t("common.github")}>
								<LinkButton
									variant="ghost"
									size="icon"
									href="https://github.com/nocoo/basalt"
									target="_blank"
									rel="noopener noreferrer"
									aria-label={t("common.github")}
									className="w-8 rounded-basalt-md text-basalt-muted-foreground hover:text-basalt-foreground [&_svg]:size-[1.125rem]"
								>
									<Github
										className="h-[1.125rem] w-[1.125rem]"
										aria-hidden="true"
										strokeWidth={1.5}
									/>
								</LinkButton>
							</HeaderTooltip>
							<HexlyLink />
							<ThemeToggle aria-label={t("common.toggleTheme", { theme })} />
						</>
					}
				/>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col px-basalt-space-lg pb-basalt-space-lg md:px-basalt-layout-sm md:pb-basalt-layout-sm">
					<ContentIsland className="relative min-w-0" data-doc-scroll>
						<Outlet />
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
