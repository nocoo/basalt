import {
  Bell, AlertTriangle, CheckCircle2, Info, XCircle,
  Loader2, Inbox, Search, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

/* ── Inline Alert ── */
const ALERT_STYLES = {
  info: { icon: Info, border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
  success: { icon: CheckCircle2, border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  error: { icon: XCircle, border: "border-red-500/30", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400" },
} as const;

function InlineAlert({ variant, title, message }: { variant: keyof typeof ALERT_STYLES; title: string; message: string }) {
  const s = ALERT_STYLES[variant];
  return (
    <div className={`flex items-start gap-3 rounded-lg border ${s.border} ${s.bg} p-4`}>
      <s.icon className={`h-5 w-5 shrink-0 mt-0.5 ${s.text}`} strokeWidth={1.5} />
      <div className="space-y-1">
        <p className={`text-sm font-medium ${s.text}`}>{title}</p>
        <p className="text-xs text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

/* ── Skeleton ── */
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

function SkeletonCard() {
  return (
    <div className="rounded-widget border border-border bg-card p-4 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-md" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Feedback and status communication"
        description="Toast notifications, inline alerts, skeleton loaders, empty states, and progress indicators for every dashboard scenario."
        eyebrow="Feedback"
        icon={Bell}
      />

      {/* Toast Notifications */}
      <Section title="Toast Notifications" icon={Bell}>
        <p className="text-xs text-muted-foreground mb-3">Click each button to trigger a live toast.</p>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={() => toast.success("Changes saved successfully.")}>
            <CheckCircle2 className="mr-2 h-3.5 w-3.5" /> Success
          </Button>
          <Button size="sm" variant="destructive" onClick={() => toast.error("Failed to save changes.")}>
            <XCircle className="mr-2 h-3.5 w-3.5" /> Error
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.warning("Your session expires in 5 minutes.")}>
            <AlertTriangle className="mr-2 h-3.5 w-3.5" /> Warning
          </Button>
          <Button size="sm" variant="secondary" onClick={() => toast.info("A new version is available.")}>
            <Info className="mr-2 h-3.5 w-3.5" /> Info
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast("Deploying...", { duration: 5000, action: { label: "Undo", onClick: () => toast.info("Undone.") } })}>
            Action Toast
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.promise(new Promise((r) => setTimeout(r, 2000)), { loading: "Uploading file...", success: "Upload complete!", error: "Upload failed." })}>
            <Loader2 className="mr-2 h-3.5 w-3.5" /> Promise Toast
          </Button>
        </div>
      </Section>

      {/* Inline Alerts */}
      <Section title="Inline Alerts" icon={AlertTriangle}>
        <div className="space-y-3">
          <InlineAlert variant="info" title="New update available" message="Version 2.4.0 includes performance improvements and bug fixes." />
          <InlineAlert variant="success" title="Payment confirmed" message="Your invoice #1042 has been paid successfully." />
          <InlineAlert variant="warning" title="Storage almost full" message="You've used 92% of your storage quota. Consider upgrading your plan." />
          <InlineAlert variant="error" title="Connection lost" message="Unable to reach the server. Check your network and try again." />
        </div>
      </Section>

      {/* Inline Banners */}
      <Section title="Banners" icon={Info}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3">
            <p className="text-sm font-medium text-primary-foreground">Upgrade to Pro for unlimited exports.</p>
            <Button size="sm" variant="secondary">Upgrade</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" strokeWidth={1.5} />
              <p className="text-sm text-amber-600 dark:text-amber-400">Scheduled maintenance on Feb 20, 2:00 AM UTC.</p>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground">Dismiss</button>
          </div>
        </div>
      </Section>

      {/* Skeleton Loaders */}
      <Section title="Skeleton Loaders" icon={Loader2}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">card skeleton</p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">list skeleton</p>
            <div className="rounded-widget border border-border bg-card px-4 divide-y divide-border">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">text skeleton</p>
            <div className="space-y-2 max-w-md">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </Section>

      {/* Empty States */}
      <Section title="Empty States" icon={Inbox}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* No data */}
          <div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/50 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-foreground mb-1">No data yet</p>
            <p className="text-xs text-muted-foreground mb-4">Start by creating your first record.</p>
            <Button size="sm">Create record</Button>
          </div>
          {/* No results */}
          <div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
            <Search className="h-10 w-10 text-muted-foreground/50 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-foreground mb-1">No results found</p>
            <p className="text-xs text-muted-foreground mb-4">Try adjusting your search or filter criteria.</p>
            <Button size="sm" variant="outline">Clear filters</Button>
          </div>
          {/* Error boundary */}
          <div className="rounded-widget border border-border bg-card p-8 flex flex-col items-center text-center">
            <XCircle className="h-10 w-10 text-red-500/50 mb-3" strokeWidth={1} />
            <p className="text-sm font-medium text-foreground mb-1">Something went wrong</p>
            <p className="text-xs text-muted-foreground mb-4">We couldn't load this content. Please try again.</p>
            <Button size="sm" variant="outline">
              <RefreshCw className="mr-2 h-3.5 w-3.5" /> Retry
            </Button>
          </div>
        </div>
      </Section>

      {/* Progress Indicators */}
      <Section title="Progress Indicators" icon={Loader2}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">determinate</p>
            <div className="space-y-3 max-w-md">
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading files...</span><span>25%</span>
                </div>
                <Progress value={25} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span><span>60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Complete</span><span>100%</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">spinners</p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Loading...</span>
              </div>
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-foreground">Processing</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Page loading</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">multi-step</p>
            <div className="flex items-center gap-2 max-w-md">
              {["Upload", "Process", "Review", "Complete"].map((step, i) => (
                <div key={step} className="flex items-center gap-2 flex-1">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium ${i < 2 ? "bg-primary text-primary-foreground" : i === 2 ? "border-2 border-primary text-primary" : "border border-border text-muted-foreground"}`}>
                    {i < 2 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-xs ${i <= 2 ? "text-foreground" : "text-muted-foreground"}`}>{step}</span>
                  {i < 3 && <div className={`flex-1 h-px ${i < 2 ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
