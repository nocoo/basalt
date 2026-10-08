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
					title="Monthly care reimbursements"
					value="$48,250"
					subtitle="vs. $42,100 last month"
					icon={TrendingUp}
					iconColor="text-basalt-primary"
					trend={{ value: 14.6, label: "MoM" }}
					action={
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Care reimbursement calculation methodology"
								>
									<HelpCircle className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs text-basalt-sm">
									Total approved care reimbursements across active clinic programs this month.
								</p>
							</TooltipContent>
						</Tooltip>
					}
				/>

				{/* 2. StatCard with custom trend content badge and action */}
				<StatCard
					title="Active care plans"
					value="1,420"
					subtitle="Total plans with active follow-up"
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
								<Button variant="ghost" size="icon" aria-label="Care plan count details">
									<HelpCircle className="h-4 w-4" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p className="max-w-xs text-basalt-sm">
									Care plans with at least one active follow-up recorded in the last 30 days.
								</p>
							</TooltipContent>
						</Tooltip>
					}
				/>
			</div>
		</TooltipProvider>
	);
}
