import { StatCard } from "@nocoo/basalt/charts/stat-card";
import { Badge } from "@nocoo/basalt/components/badge";
import { Button } from "@nocoo/basalt/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import { ArrowUpRight, HelpCircle, TrendingUp, Users } from "lucide-react";

export default function StatCardMetricInfo() {
	return (
		<TooltipProvider>
			<div className="grid w-full grid-cols-1 gap-basalt-layout sm:grid-cols-2">
				{/* 1. StatCard with action tooltip trigger and Lucide icon */}
				<StatCard
					title="Monthly Recurring Revenue"
					value="$48,250"
					subtitle="vs. $42,100 last month"
					icon={TrendingUp}
					iconColor="text-basalt-primary"
					trend={{ value: 14.6, label: "MoM" }}
					action={
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" aria-label="Revenue calculation methodology">
									<HelpCircle className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs text-basalt-sm">
									Normalized monthly recurring subscription revenue across active enterprise and
									team tiers.
								</p>
							</TooltipContent>
						</Tooltip>
					}
				/>

				{/* 2. StatCard with custom trend content badge and action */}
				<StatCard
					title="Active Subscriptions"
					value="1,420"
					subtitle="Total accounts with active licenses"
					icon={Users}
					iconColor="text-basalt-tag-teal-foreground"
					trendContent={
						<Badge variant="teal">
							<ArrowUpRight className="h-3 w-3" />
							+8.2% this quarter
						</Badge>
					}
					action={
						<Tooltip>
							<TooltipTrigger asChild>
								<Button variant="ghost" size="icon" aria-label="Subscription count details">
									<HelpCircle className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs text-basalt-sm">
									Accounts with at least one active paid seat renewed in the last 30 days.
								</p>
							</TooltipContent>
						</Tooltip>
					}
				/>
			</div>
		</TooltipProvider>
	);
}
