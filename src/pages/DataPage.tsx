import {
  Eye, Users, Tag, TrendingUp, TrendingDown,
  Clock, CheckCircle2, GitCommit, MessageSquare,
  Star, ArrowUpRight, Minus, ArrowDownLeft,
  Filter, Search, SlidersHorizontal, Table, Circle, X,
  Sparkles, BadgeCheck, AlertTriangle, Info,
} from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

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

const PEOPLE = [
  { name: "Alice Chen", email: "alice@example.com", initials: "AC", seed: "alice" },
  { name: "Bob Park", email: "bob@example.com", initials: "BP", seed: "bob" },
  { name: "Clara Diaz", email: "clara@example.com", initials: "CD", seed: "clara" },
  { name: "David Kim", email: "david@example.com", initials: "DK", seed: "david" },
  { name: "Eva Torres", email: "eva@example.com", initials: "ET", seed: "eva" },
];

const TIMELINE = [
  { icon: CheckCircle2, color: "text-emerald-500", title: "Deployment succeeded", desc: "v2.4.1 deployed to production", time: "2 min ago" },
  { icon: GitCommit, color: "text-blue-500", title: "Code merged", desc: "PR #142 merged into main", time: "15 min ago" },
  { icon: MessageSquare, color: "text-amber-500", title: "New comment", desc: "Alice left a review", time: "1 hr ago" },
  { icon: Star, color: "text-purple-500", title: "Milestone reached", desc: "Sprint 8 completed", time: "3 hr ago" },
];

const KPI_DATA = [
  { label: "Revenue", value: "$48.2k", change: "+12.5%", trend: "up" as const },
  { label: "Users", value: "2,841", change: "+8.2%", trend: "up" as const },
  { label: "Bounce Rate", value: "24.3%", change: "-3.1%", trend: "down" as const },
  { label: "Avg. Session", value: "4m 32s", change: "0%", trend: "flat" as const },
];

const TABLE_ROWS = [
  { id: "INV-2041", customer: "Nova Labs", status: "Paid", amount: "$12,400", date: "Feb 01" },
  { id: "INV-2042", customer: "Violet Corp", status: "Pending", amount: "$5,950", date: "Feb 03" },
  { id: "INV-2043", customer: "Atlas Works", status: "Paid", amount: "$8,100", date: "Feb 05" },
  { id: "INV-2044", customer: "Echo Systems", status: "Overdue", amount: "$3,250", date: "Feb 07" },
];

const SOLID_PILLS = [
  { label: "Primary", className: "bg-primary text-primary-foreground" },
  { label: "Success", className: "bg-success text-success-foreground" },
  { label: "Warning", className: "bg-amber-500 text-white" },
  { label: "Error", className: "bg-destructive text-destructive-foreground" },
];

const SOFT_PILLS = [
  { label: "Blue", className: "bg-blue-500/10 text-blue-500" },
  { label: "Teal", className: "bg-teal-500/10 text-teal-500" },
  { label: "Indigo", className: "bg-indigo-500/10 text-indigo-500" },
  { label: "Rose", className: "bg-rose-500/10 text-rose-500" },
];

const OUTLINE_PILLS = [
  { label: "Outline", className: "border border-border text-foreground" },
  { label: "Primary", className: "border border-primary text-primary" },
  { label: "Success", className: "border border-success text-success" },
];

const ICON_PILLS = [
  { label: "Verified", icon: BadgeCheck, className: "bg-success/10 text-success" },
  { label: "At risk", icon: AlertTriangle, className: "bg-amber-500/10 text-amber-500" },
  { label: "AI", icon: Sparkles, className: "bg-purple-500/10 text-purple-500" },
];

const DOT_PILLS = [
  { label: "Live", dot: "bg-green-500", className: "bg-green-500/10 text-green-600" },
  { label: "Paused", dot: "bg-amber-500", className: "bg-amber-500/10 text-amber-500" },
  { label: "Offline", dot: "bg-rose-500", className: "bg-rose-500/10 text-rose-500" },
];

export default function DataPage() {
  return (
    <div className="space-y-4">
      <PageIntro
        title="Data display components"
        description="Avatars, badges, tables, pills, timelines, and stat tiles for presenting data."
        eyebrow="Data"
        icon={Eye}
      />

      <Section title="Stat Tiles / KPIs" icon={TrendingUp}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KPI_DATA.map((kpi) => (
            <div key={kpi.label} className="rounded-widget border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {kpi.trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />}
                {kpi.trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-red-500" />}
                {kpi.trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-emerald-500" : kpi.trend === "down" ? "text-red-500" : "text-muted-foreground"}`}>
                  {kpi.change}
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <div className="rounded-card bg-secondary overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <p className="text-sm text-muted-foreground">Data Table</p>
          <div className="flex items-center gap-2">
            <div className="relative min-w-[180px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
              <Input placeholder="Search" className="rounded-widget border-border bg-card pl-10 text-sm h-8" />
            </div>
            <button className="flex items-center gap-2 rounded-widget bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <Filter className="h-3.5 w-3.5" strokeWidth={1.5} /> Filter
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-5 py-3 font-normal">Invoice</th>
              <th className="px-5 py-3 font-normal">Customer</th>
              <th className="px-5 py-3 font-normal">Status</th>
              <th className="px-5 py-3 font-normal">Amount</th>
              <th className="px-5 py-3 font-normal">Date</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_ROWS.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-accent/40">
                <td className="px-5 py-3 text-sm text-foreground">{row.id}</td>
                <td className="px-5 py-3 text-sm text-foreground">{row.customer}</td>
                <td className="px-5 py-3 text-xs">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    row.status === "Paid" ? "bg-success/10 text-success" : row.status === "Pending" ? "bg-amber-500/10 text-amber-500" : "bg-destructive/10 text-destructive"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-foreground">{row.amount}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Section title="Avatars" icon={Users}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">sizes</p>
            <div className="flex items-end gap-3">
              {[
                { size: "h-6 w-6", text: "text-[9px]" },
                { size: "h-8 w-8", text: "text-[10px]" },
                { size: "h-10 w-10", text: "text-xs" },
                { size: "h-12 w-12", text: "text-sm" },
              ].map(({ size, text }, i) => (
                <Avatar key={i} className={size}>
                  <AvatarImage src={`https://avatar.vercel.sh/${PEOPLE[i].seed}`} alt={PEOPLE[i].name} />
                  <AvatarFallback className={text}>{PEOPLE[i].initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">stacked group</p>
            <div className="flex -space-x-2">
              {PEOPLE.map((p) => (
                <Avatar key={p.seed} className="h-9 w-9 border-2 border-background">
                  <AvatarImage src={`https://avatar.vercel.sh/${p.seed}`} alt={p.name} />
                  <AvatarFallback className="text-[10px]">{p.initials}</AvatarFallback>
                </Avatar>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">+3</div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Badges" icon={Tag}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">variants</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">semantic</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Active</Badge>
              <Badge className="border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400">Pending</Badge>
              <Badge className="border-transparent bg-red-500/15 text-red-600 dark:text-red-400">Failed</Badge>
              <Badge className="border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400">Info</Badge>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Pills" icon={Circle}>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">solid</p>
            <div className="flex flex-wrap gap-2">
              {SOLID_PILLS.map((pill) => (
                <span key={pill.label} className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>{pill.label}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">soft</p>
            <div className="flex flex-wrap gap-2">
              {SOFT_PILLS.map((pill) => (
                <span key={pill.label} className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>{pill.label}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">outline</p>
            <div className="flex flex-wrap gap-2">
              {OUTLINE_PILLS.map((pill) => (
                <span key={pill.label} className={`rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>{pill.label}</span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">with icons</p>
            <div className="flex flex-wrap gap-2">
              {ICON_PILLS.map((pill) => (
                <span key={pill.label} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>
                  <pill.icon className="h-3.5 w-3.5" strokeWidth={1.5} />{pill.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-mono">with dot indicators</p>
            <div className="flex flex-wrap gap-2">
              {DOT_PILLS.map((pill) => (
                <span key={pill.label} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${pill.className}`}>
                  <span className={`h-2 w-2 rounded-full ${pill.dot}`} />{pill.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Timeline / Activity Feed" icon={Clock}>
        <div className="rounded-widget border border-border bg-card p-4">
          <div className="space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-card border border-border ${item.color}`}>
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  {i < TIMELINE.length - 1 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className={`pb-6 ${i === TIMELINE.length - 1 ? "pb-0" : ""}`}>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="List Items" icon={Users}>
        <div className="rounded-widget border border-border bg-card divide-y divide-border">
          {PEOPLE.slice(0, 4).map((person) => (
            <div key={person.seed} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={`https://avatar.vercel.sh/${person.seed}`} alt={person.name} />
                <AvatarFallback className="text-[10px]">{person.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{person.name}</p>
                <p className="text-xs text-muted-foreground truncate">{person.email}</p>
              </div>
              <Badge variant="outline" className="gap-1.5 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
              </Badge>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Key-Value Display" icon={Eye}>
        <div className="rounded-widget border border-border bg-card p-4">
          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2">
            {[
              { key: "Status", value: "Active" },
              { key: "Plan", value: "Enterprise" },
              { key: "Created", value: "Jan 15, 2026" },
              { key: "Last login", value: "2 hours ago" },
            ].map((item, i) => (
              <div key={item.key}>
                <div className="flex items-center justify-between py-2.5 px-1">
                  <span className="text-xs text-muted-foreground">{item.key}</span>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
                {i < 3 && <Separator />}
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
