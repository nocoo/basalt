import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Github } from "lucide-react";
import { cn } from "@/lib/utils";

// Map route paths to i18n keys
const PAGE_TITLE_KEYS: Record<string, string> = {
  "/components": "nav.components",
  "/forms": "nav.forms",
  "/tables": "nav.tables",
  "/controls": "nav.controls",
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
  "/settings": "nav.settings",
  "/palette": "nav.colorPalette",
  "/interactions": "nav.interactions",
  "/interactive": "nav.interactive",
  "/data": "nav.data",
};

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  const titleKey = PAGE_TITLE_KEYS[location.pathname] ?? "nav.dashboard";
  const title = t(titleKey);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile sidebar is open
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
    <div className="flex min-h-screen w-full bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        {t("common.skipToMain")}
      </a>
      {/* Desktop sidebar */}
      {!isMobile && (
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      )}

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-[260px]">
            <AppSidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <main id="main-content" className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="flex h-14 items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                onClick={() => setMobileOpen(true)}
                aria-label={t("common.openNav")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Menu className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
              </button>
            )}
            <h1 className="text-lg md:text-xl font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/nocoo/basalt"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("common.github")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Github className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.5} />
            </a>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </header>
        <div className={cn("flex-1 px-2 pb-2 md:px-3 md:pb-3")}>
          <div className="h-full rounded-[16px] md:rounded-[20px] bg-card p-3 md:p-5 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
