import { Button } from "@nocoo/basalt/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { ArrowDownLeft, ArrowUpRight, CreditCard, PiggyBank, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

const ACTIONS = [
	{
		id: "bookVisit",
		icon: ArrowUpRight,
		labelKey: "dashboard.sendMoney",
		color: "bg-basalt-primary/10 text-basalt-primary",
	},
	{
		id: "logVitals",
		icon: ArrowDownLeft,
		labelKey: "dashboard.receive",
		color: "bg-basalt-success/10 text-basalt-success",
	},
	{
		id: "addMedication",
		icon: CreditCard,
		labelKey: "dashboard.payBill",
		color: "bg-basalt-destructive/10 text-basalt-destructive",
	},
	{
		id: "saveCheckIn",
		icon: PiggyBank,
		labelKey: "dashboard.saveAction",
		color: "bg-basalt-info/10 text-basalt-info",
	},
] as const;

export function ActionGridCard() {
	const { t } = useTranslation();

	return (
		<LayerCard className="flex flex-col h-full">
			<LayerCard.Header className="flex-col">
				<div className="flex items-center gap-basalt-space-lg">
					<Zap className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
					<h2 className="text-basalt-base font-normal text-muted-foreground">
						{t("dashboard.quickActions")}
					</h2>
				</div>
			</LayerCard.Header>
			<LayerCard.Body className="min-h-0 flex-1 flex flex-col">
				<div className="flex-1 grid grid-cols-2 gap-basalt-card">
					{ACTIONS.map((action) => {
						const label = t(action.labelKey);
						return (
							<Dialog key={action.id}>
								<DialogTrigger asChild>
									<Button variant="secondary" type="button" className="flex-col">
										<div
											className={`flex h-9 w-9 items-center justify-center rounded-basalt-md ${action.color}`}
										>
											<action.icon className="h-4 w-4" strokeWidth={1.5} />
										</div>
										<span className="text-basalt-sm text-foreground">{label}</span>
									</Button>
								</DialogTrigger>
								<DialogContent size="sm">
									<DialogHeader>
										<DialogTitle>{t("dashboard.actionDemoTitle", { action: label })}</DialogTitle>
										<DialogDescription>{t("dashboard.actionDemoBody")}</DialogDescription>
									</DialogHeader>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="secondary" type="button">
												{t("dashboard.actionDemoClose")}
											</Button>
										</DialogClose>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						);
					})}
				</div>
			</LayerCard.Body>
		</LayerCard>
	);
}
