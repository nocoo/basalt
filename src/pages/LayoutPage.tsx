import { LayoutGrid, Grid3X3, Columns3, Rows3, AlignHorizontalDistributeCenter, Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageIntro } from "@/components/PageIntro";

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

function Block({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-widget border border-border bg-card p-4 text-sm text-muted-foreground ${className}`}>
      {children}
    </div>
  );
}

function LabeledBlock({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`rounded-widget border border-border bg-card p-4 flex items-center justify-center text-xs text-muted-foreground font-mono ${className}`}>
      {label}
    </div>
  );
}

export default function LayoutPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <PageIntro
        title={t("pages.layout.title")}
        description={t("pages.layout.description")}
        eyebrow={t("pages.layout.eyebrow")}
        icon={LayoutGrid}
      />

      {/* Equal columns */}
      <Section title={t("pages.layout.equalColumns")} icon={Grid3X3}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <LabeledBlock label="1/2" />
            <LabeledBlock label="1/2" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <LabeledBlock label="1/3" />
            <LabeledBlock label="1/3" />
            <LabeledBlock label="1/3" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <LabeledBlock label="1/4" />
            <LabeledBlock label="1/4" />
            <LabeledBlock label="1/4" />
            <LabeledBlock label="1/4" />
          </div>
        </div>
      </Section>

      {/* Asymmetric columns */}
      <Section title={t("pages.layout.asymmetricColumns")} icon={Columns3}>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <LabeledBlock label="1/3" />
            <LabeledBlock label="2/3" className="col-span-2" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <LabeledBlock label="1/4" />
            <LabeledBlock label="3/4" className="col-span-3" />
          </div>
          <div className="grid grid-cols-12 gap-4">
            <LabeledBlock label="5 cols" className="col-span-5" />
            <LabeledBlock label="7 cols" className="col-span-7" />
          </div>
        </div>
      </Section>

      {/* Responsive breakpoints */}
      <Section title={t("pages.layout.responsiveBreakpoints")} icon={Maximize2}>
        <p className="text-xs text-muted-foreground mb-3">
          {t("pages.layout.responsiveDesc")}
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <LabeledBlock label="A" className="min-h-[80px]" />
          <LabeledBlock label="B" className="min-h-[80px]" />
          <LabeledBlock label="C" className="min-h-[80px]" />
          <LabeledBlock label="D" className="min-h-[80px]" />
        </div>
      </Section>

      {/* Spanning rows and columns */}
      <Section title={t("pages.layout.spanningRowsCols")} icon={Rows3}>
        <div className="grid grid-cols-3 grid-rows-2 gap-4">
          <LabeledBlock label={t("pages.layout.span2Rows")} className="row-span-2 min-h-[160px]" />
          <LabeledBlock label="1x1" />
          <LabeledBlock label="1x1" />
          <LabeledBlock label={t("pages.layout.span2Cols")} className="col-span-2" />
        </div>
      </Section>

      {/* Dashboard-style mixed grid */}
      <Section title={t("pages.layout.dashboardComposition")} icon={LayoutGrid}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Block className="lg:col-span-2 min-h-[120px]">
            <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.wideCard")}</p>
            <p className="text-xs">{t("pages.layout.wideCardDesc")}</p>
          </Block>
          <Block className="min-h-[120px]">
            <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.metric")}</p>
            <p className="text-2xl font-semibold text-foreground">1,284</p>
          </Block>
          <Block className="min-h-[120px]">
            <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.metric")}</p>
            <p className="text-2xl font-semibold text-foreground">$42.5k</p>
          </Block>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
          <Block className="md:col-span-2 min-h-[200px]">
            <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.mainContentArea")}</p>
            <p className="text-xs">{t("pages.layout.mainContentDesc")}</p>
          </Block>
          <Block className="min-h-[200px]">
            <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.sidebar")}</p>
            <p className="text-xs">{t("pages.layout.sidebarDesc")}</p>
          </Block>
        </div>
      </Section>

      {/* Flexbox patterns */}
      <Section title={t("pages.layout.flexboxPatterns")} icon={AlignHorizontalDistributeCenter}>
        <div className="space-y-4">
          {/* Horizontal center */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">justify-center</p>
            <div className="flex justify-center gap-3">
              <LabeledBlock label="A" className="w-20" />
              <LabeledBlock label="B" className="w-20" />
              <LabeledBlock label="C" className="w-20" />
            </div>
          </div>
          {/* Space between */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">justify-between</p>
            <div className="flex justify-between gap-3">
              <LabeledBlock label={t("common.left")} className="w-24" />
              <LabeledBlock label={t("common.right")} className="w-24" />
            </div>
          </div>
          {/* Wrap */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">flex-wrap</p>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 8 }, (_, i) => (
                <LabeledBlock key={i} label={`${i + 1}`} className="w-20" />
              ))}
            </div>
          </div>
          {/* Vertical stack */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">flex-col gap-3</p>
            <div className="flex flex-col gap-3 max-w-xs">
              <LabeledBlock label={t("common.top")} />
              <LabeledBlock label={t("common.middle")} />
              <LabeledBlock label={t("common.bottom")} />
            </div>
          </div>
        </div>
      </Section>

      {/* Auto-fit / auto-fill */}
      <Section title={t("pages.layout.autoFitGrid")} icon={Grid3X3}>
        <p className="text-xs text-muted-foreground mb-3">
          {t("pages.layout.autoFitDesc")}
        </p>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <Block key={i} className="min-h-[100px]">
              <p className="text-xs font-medium text-foreground mb-1">{t("pages.layout.cardN", { n: i + 1 })}</p>
              <p className="text-xs">{t("pages.layout.cardAutoDesc")}</p>
            </Block>
          ))}
        </div>
      </Section>
    </div>
  );
}
