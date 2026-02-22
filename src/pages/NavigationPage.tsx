import { useState } from "react";
import {
  Navigation, ChevronRight, Home, FolderOpen, FileText,
  ChevronsLeft, ChevronLeft, ChevronRightIcon, ChevronsRight,
  CheckCircle2, Circle, MoreHorizontal,
} from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-secondary p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

/* ── Breadcrumb ── */
function Breadcrumb({ items }: { items: { label: string; icon?: React.ElementType }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
          {item.icon && <item.icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />}
          <span className={i === items.length - 1 ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground cursor-pointer"}>
            {item.label}
          </span>
        </div>
      ))}
    </nav>
  );
}

/* ── Pagination ── */
function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) {
  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => onPageChange(1)}>
        <ChevronsLeft className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>
      {getVisiblePages().map((page, i) =>
        page === "ellipsis" ? (
          <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center text-muted-foreground">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="icon"
            className="h-8 w-8 text-xs"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
        <ChevronRightIcon className="h-3.5 w-3.5" />
      </Button>
      <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => onPageChange(totalPages)}>
        <ChevronsRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

/* ── Stepper ── */
function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              i < current
                ? "bg-primary text-primary-foreground"
                : i === current
                  ? "border-2 border-primary text-primary"
                  : "border border-border text-muted-foreground"
            }`}>
              {i < current ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
            </div>
            <div className="hidden sm:block">
              <p className={`text-xs font-medium ${i <= current ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
            </div>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-3 h-px w-8 sm:w-12 ${i < current ? "bg-primary" : "bg-border"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function NavigationPage() {
  const { t } = useTranslation();
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(5);
  const [stepperIndex, setStepperIndex] = useState(1);

  const stepperSteps = [
    t("pages.navigation.account"),
    t("pages.navigation.profile"),
    t("pages.navigation.preferences"),
    t("pages.navigation.review"),
    t("pages.navigation.complete"),
  ];

  const underlineTabs = [
    { label: t("pages.navigation.all"), value: "all" },
    { label: t("pages.navigation.activeTab"), value: "active" },
    { label: t("pages.navigation.archived"), value: "archived" },
    { label: t("pages.navigation.drafts"), value: "drafts" },
  ];

  const pillTabs = [
    { label: t("pages.navigation.day"), value: "day" },
    { label: t("pages.navigation.week"), value: "week" },
    { label: t("pages.navigation.month"), value: "month" },
    { label: t("pages.navigation.year"), value: "year" },
  ];

  return (
    <div className="space-y-4">
      <PageIntro
        title={t("pages.navigation.title")}
        description={t("pages.navigation.description")}
        eyebrow={t("pages.navigation.eyebrow")}
        icon={Navigation}
      />

      {/* Breadcrumbs */}
      <Section title={t("pages.navigation.breadcrumbs")} icon={ChevronRight}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.simple")}</p>
            <Breadcrumb items={[
              { label: t("pages.navigation.home") },
              { label: t("pages.navigation.products") },
              { label: t("pages.navigation.electronics") },
              { label: t("pages.navigation.headphones") },
            ]} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.withIcons")}</p>
            <Breadcrumb items={[
              { label: t("pages.navigation.home"), icon: Home },
              { label: t("pages.navigation.documents"), icon: FolderOpen },
              { label: t("pages.navigation.reports"), icon: FolderOpen },
              { label: t("pages.navigation.q4Summary"), icon: FileText },
            ]} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.insideCard")}</p>
            <div className="rounded-widget border border-border bg-card p-4">
              <Breadcrumb items={[
                { label: t("pages.navigation.dashboard") },
                { label: t("pages.navigation.settings") },
                { label: t("pages.navigation.notifications") },
              ]} />
              <p className="text-sm text-foreground font-medium mt-3">{t("pages.navigation.notificationPrefs")}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("pages.navigation.notificationPrefsDesc")}</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Pagination */}
      <Section title={t("pages.navigation.pagination")} icon={ChevronsRight}>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.short5Pages")}</p>
            <Pagination currentPage={page1} totalPages={5} onPageChange={setPage1} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.long20Pages")}</p>
            <Pagination currentPage={page2} totalPages={20} onPageChange={setPage2} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.withContext")}</p>
            <div className="rounded-widget border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t("common.showing")} <span className="font-medium text-foreground">41-50</span> {t("common.of")} <span className="font-medium text-foreground">200</span> {t("common.results")}
                </p>
                <Pagination currentPage={page2} totalPages={20} onPageChange={setPage2} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Stepper / Wizard */}
      <Section title={t("pages.navigation.stepperWizard")} icon={Circle}>
        <div className="space-y-6">
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">{t("pages.navigation.horizontalStepper")}</p>
            <Stepper steps={stepperSteps} current={stepperIndex} />
            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={stepperIndex === 0} onClick={() => setStepperIndex((i) => i - 1)}>
                {t("common.back")}
              </Button>
              <Button size="sm" disabled={stepperIndex === stepperSteps.length - 1} onClick={() => setStepperIndex((i) => i + 1)}>
                {stepperIndex === stepperSteps.length - 2 ? t("common.finish") : t("common.next")}
              </Button>
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setStepperIndex(0)}>
                {t("common.reset")}
              </Button>
            </div>
          </div>

          {/* Vertical stepper */}
          <div>
            <p className="text-xs text-muted-foreground mb-3 font-mono">{t("pages.navigation.verticalStepper")}</p>
            <div className="max-w-sm">
              {stepperSteps.map((step, i) => (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                      i < stepperIndex
                        ? "bg-primary text-primary-foreground"
                        : i === stepperIndex
                          ? "border-2 border-primary text-primary"
                          : "border border-border text-muted-foreground"
                    }`}>
                      {i < stepperIndex ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    {i < stepperSteps.length - 1 && (
                      <div className={`w-px flex-1 min-h-[24px] ${i < stepperIndex ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${i <= stepperIndex ? "text-foreground" : "text-muted-foreground"}`}>{step}</p>
                    <p className="text-xs text-muted-foreground">
                      {i < stepperIndex ? t("pages.navigation.completed") : i === stepperIndex ? t("pages.navigation.inProgress") : t("pages.navigation.pending")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Tabs Variants */}
      <Section title={t("pages.navigation.tabPatterns")} icon={Navigation}>
        <div className="space-y-6">
          {/* Standard tabs */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.standardTabs")}</p>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">{t("pages.navigation.overview")}</TabsTrigger>
                <TabsTrigger value="analytics">{t("pages.navigation.analytics")}</TabsTrigger>
                <TabsTrigger value="reports">{t("pages.navigation.reports")}</TabsTrigger>
                <TabsTrigger value="settings">{t("pages.navigation.settings")}</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <div className="rounded-widget border border-border bg-card p-4">
                  <p className="text-sm text-foreground">{t("pages.navigation.overviewContent")}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t("pages.navigation.overviewContentDesc")}</p>
                </div>
              </TabsContent>
              <TabsContent value="analytics">
                <div className="rounded-widget border border-border bg-card p-4">
                  <p className="text-sm text-foreground">{t("pages.navigation.analyticsContent")}</p>
                </div>
              </TabsContent>
              <TabsContent value="reports">
                <div className="rounded-widget border border-border bg-card p-4">
                  <p className="text-sm text-foreground">{t("pages.navigation.reportsContent")}</p>
                </div>
              </TabsContent>
              <TabsContent value="settings">
                <div className="rounded-widget border border-border bg-card p-4">
                  <p className="text-sm text-foreground">{t("pages.navigation.settingsContent")}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Underline tabs (custom) */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.underlineStyle")}</p>
            <Tabs defaultValue="all">
              <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 gap-4">
                {underlineTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-2 pt-1 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all">
                <div className="rounded-widget border border-border bg-card p-4 mt-3">
                  <p className="text-sm text-foreground">{t("pages.navigation.showingAll")}</p>
                </div>
              </TabsContent>
              <TabsContent value="active">
                <div className="rounded-widget border border-border bg-card p-4 mt-3">
                  <p className="text-sm text-foreground">{t("pages.navigation.showingActive")}</p>
                </div>
              </TabsContent>
              <TabsContent value="archived">
                <div className="rounded-widget border border-border bg-card p-4 mt-3">
                  <p className="text-sm text-foreground">{t("pages.navigation.showingArchived")}</p>
                </div>
              </TabsContent>
              <TabsContent value="drafts">
                <div className="rounded-widget border border-border bg-card p-4 mt-3">
                  <p className="text-sm text-foreground">{t("pages.navigation.showingDrafts")}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pill tabs */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">{t("pages.navigation.pillStyle")}</p>
            <Tabs defaultValue="day">
              <TabsList className="bg-transparent gap-1 p-0">
                {pillTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="rounded-full px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </Section>
    </div>
  );
}
