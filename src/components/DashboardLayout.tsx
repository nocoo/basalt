import { AppHeader, ProjectLinks } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button } from "@nocoo/basalt/components/button";
import { Sheet, SheetContent, SheetTitle } from "@nocoo/basalt/components/sheet";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation } from "react-router";
import { AccentPicker } from "@/components/AccentPicker";
import { AppSidebar } from "@/components/AppSidebar";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteTitle } from "@/hooks/use-site-title";
import { SHOWCASE_TITLE_KEYS } from "@/lib/site";
import { CATALOG_BY_SLUG, catalogNavName } from "@/pages/ui/catalog";
import { catalogCategory, catalogCategoryPath } from "@/pages/ui/catalog-categories";
import { HeaderTooltip } from "./header-links";

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

	const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
	const mobileSheetRef = useRef<HTMLDivElement | null>(null);
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
	const rootPath = location.pathname.startsWith("/ui") ? "/ui" : "/dashboard";
	const crumbs = [
		location.pathname === "/dashboard"
			? { label: t("nav.dashboard") }
			: { href: "/dashboard", label: t("nav.dashboard") },
	];
	if (rootPath === "/ui") {
		crumbs.push(
			location.pathname === "/ui"
				? { label: t("nav.kitIndex") }
				: { href: "/ui", label: t("nav.kitIndex") },
		);
	}
	const entryCategory = catalogCategory(catalogEntry?.category);
	if (catalogEntry && entryCategory) {
		crumbs.push({ href: catalogCategoryPath(entryCategory.id), label: entryCategory.label });
	}
	if (overviewCategory) {
		crumbs.push({ label: overviewCategory.label });
	} else if (catalogEntry) {
		crumbs.push(
			location.pathname.endsWith("/source")
				? { href: `/ui/${catalogEntry.slug}`, label: catalogTitle ?? title }
				: { label: catalogTitle ?? title },
		);
		if (location.pathname.endsWith("/source")) {
			crumbs.push({ label: title });
		}
	} else if (location.pathname !== "/dashboard" && location.pathname !== "/ui") {
		crumbs.push({ label: title });
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
						ref={mobileSheetRef}
						side="left"
						tabIndex={-1}
						className="w-[16.25rem] max-w-[16.25rem] border-0 bg-basalt-background p-0"
						onOpenAutoFocus={(event) => {
							event.preventDefault();
							mobileSheetRef.current?.focus();
						}}
						onCloseAutoFocus={(event) => {
							const trigger = mobileTriggerRef.current;
							if (isTriggerVisible(trigger)) {
								event.preventDefault();
								trigger.focus();
							}
						}}
					>
						<SheetTitle className="sr-only">{t("common.openNav")}</SheetTitle>
						<AppSidebar
							collapsed={false}
							onToggle={() => setMobileOpen(false)}
							resizable={false}
							drawer
						/>
					</SheetContent>
				</Sheet>
			)}
			<AppMain>
				<AppHeader
					className="max-sm:[&_nav]:max-w-[42vw] max-sm:[&_nav]:overflow-x-auto max-sm:[&_nav]:whitespace-nowrap max-sm:[&_nav>span]:shrink-0"
					leading={
						isMobile ? (
							<HeaderTooltip label={t("common.openNav")}>
								<Button
									ref={mobileTriggerRef}
									variant="ghost"
									size="icon-sm"
									onClick={() => setMobileOpen(true)}
									aria-label={t("common.openNav")}
								>
									<Menu aria-hidden="true" />
								</Button>
							</HeaderTooltip>
						) : null
					}
					breadcrumbs={crumbs}
					breadcrumbsLabel={t("common.breadcrumb")}
					title={undefined}
					actions={
						<>
							<LanguageToggle />
							<AccentPicker />
							<ProjectLinks
								github="nocoo/basalt"
								hexly="basalt"
								name="Basalt"
								githubLabel={t("common.github")}
							/>
							<ThemeToggle
								labels={{
									light: t("common.themeLight"),
									dark: t("common.themeDark"),
									system: t("common.themeSystem"),
								}}
							/>
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
