import { AppHeader, AppHeaderMenuButton, ProjectLinks } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Sheet, SheetContent, SheetTitle } from "@nocoo/basalt/components/sheet";
import { ContentIsland } from "@nocoo/basalt/components/sidebar";
import { ThemeToggle } from "@nocoo/basalt/components/theme-toggle";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router";
import { AccentPicker } from "@/components/AccentPicker";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSiteTitle } from "@/hooks/use-site-title";
import { useShellNavigationViewModel } from "@/viewmodels/useShellNavigationViewModel";

function isTriggerVisible(el: HTMLElement | null): el is HTMLElement {
	if (!el?.isConnected) return false;
	const style = window.getComputedStyle(el);
	if (style.display === "none" || style.visibility === "hidden") return false;
	if (typeof el.checkVisibility === "function") {
		return el.checkVisibility();
	}
	return true;
}

export function DashboardLayout() {
	const [collapsed, setCollapsed] = useState(false);
	const isMobile = useIsMobile();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { pathname, title, breadcrumbs } = useShellNavigationViewModel();

	const mobileTriggerRef = useRef<HTMLButtonElement | null>(null);
	const mobileSheetRef = useRef<HTMLDivElement | null>(null);
	useSiteTitle(title);

	// Close mobile sidebar on route change: pathname is the intentional trigger.
	// biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a value used inside
	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

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
			<AppSkipLink>Skip to main content</AppSkipLink>
			{!isMobile ? (
				<AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
			) : (
				<Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
					<SheetContent
						ref={mobileSheetRef}
						side="left"
						showCloseButton={false}
						tabIndex={-1}
						className="w-[var(--basalt-size-sidebar-width)] max-w-[var(--basalt-size-sidebar-width)] border-0 bg-basalt-background p-0"
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
						<SheetTitle className="sr-only">Open navigation menu</SheetTitle>
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
					leading={
						isMobile ? (
							<AppHeaderMenuButton
								ref={mobileTriggerRef}
								label="Open navigation menu"
								onClick={() => setMobileOpen(true)}
							/>
						) : null
					}
					breadcrumbs={breadcrumbs.map((segment) => ({ ...segment }))}
					breadcrumbsLabel="Breadcrumb"
					title={undefined}
					actions={
						<>
							<AccentPicker />
							<ProjectLinks
								github="nocoo/basalt"
								hexly="basalt"
								name="Basalt"
								githubLabel="GitHub repository"
							/>
							<ThemeToggle
								labels={{
									light: "Switch to light theme",
									dark: "Switch to dark theme",
									system: "Use system theme",
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
