import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import { Button } from "@nocoo/basalt/components/button";
import { ConfirmDialog } from "@nocoo/basalt/components/confirm-dialog";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	type DialogSize,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const DIALOG_SIZES: { size: DialogSize; width: string }[] = [
	{ size: "sm", width: "288px" },
	{ size: "base", width: "384px" },
	{ size: "lg", width: "512px" },
	{ size: "xl", width: "768px" },
];

function DialogDismiss() {
	const { t } = useTranslation();
	return (
		<DialogClose asChild>
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-4 right-4"
				aria-label={t("common.close")}
			>
				<X />
			</Button>
		</DialogClose>
	);
}

function DialogHeading({ title, description }: { title: string; description?: string }) {
	return (
		<div className="pr-10">
			<DialogTitle>{title}</DialogTitle>
			{description ? <DialogDescription className="mt-1.5">{description}</DialogDescription> : null}
		</div>
	);
}

export default function DialogsPage() {
	const { t } = useTranslation();
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [destroyOpen, setDestroyOpen] = useState(false);

	return (
		<div className="space-y-8">
			<PageHeader title={t("pages.dialogs.title")} description={t("pages.dialogs.description")} />

			<SectionRule title={t("pages.dialogs.anatomy")} hint={t("pages.dialogs.anatomyHint")}>
				<LayerCard>
					<DescriptionList columns={1}>
						<DescriptionList.Item term={t("pages.dialogs.width")}>
							{t("pages.dialogs.widthValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.dialogs.titleRow")}>
							{t("pages.dialogs.titleRowValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.dialogs.subtitle")}>
							{t("pages.dialogs.subtitleValue")}
						</DescriptionList.Item>
						<DescriptionList.Item term={t("pages.dialogs.actions")}>
							{t("pages.dialogs.actionsValue")}
						</DescriptionList.Item>
					</DescriptionList>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.dialogs.standard")} hint={t("pages.dialogs.standardHint")}>
				<LayerCard>
					<Dialog>
						<DialogTrigger asChild>
							<Button>{t("pages.dialogs.openStandard")}</Button>
						</DialogTrigger>
						<DialogContent size="base">
							<DialogDismiss />
							<DialogHeading
								title={t("pages.dialogs.standardTitle")}
								description={t("pages.dialogs.standardBody")}
							/>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">{t("common.cancel")}</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button>{t("common.apply")}</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.dialogs.sizes")} hint={t("pages.dialogs.sizesHint")}>
				<LayerCard>
					<div className="flex flex-wrap gap-3">
						{DIALOG_SIZES.map(({ size, width }) => (
							<Dialog key={size}>
								<DialogTrigger asChild>
									<Button variant="outline">
										{t(`pages.dialogs.size.${size}`)} ({width})
									</Button>
								</DialogTrigger>
								<DialogContent size={size}>
									<DialogDismiss />
									<DialogHeading
										title={t(`pages.dialogs.size.${size}`)}
										description={t("pages.dialogs.sizeBody", { size, width })}
									/>
									<DialogFooter>
										<DialogClose asChild>
											<Button variant="outline">{t("common.close")}</Button>
										</DialogClose>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						))}
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.dialogs.money")} hint={t("pages.dialogs.moneyHint")}>
				<LayerCard>
					<div className="flex flex-wrap gap-3">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">{t("pages.dialogs.openSend")}</Button>
							</DialogTrigger>
							<DialogContent size="sm">
								<DialogHeading
									title={t("pages.dialogs.sendTitle")}
									description={t("pages.dialogs.sendBody")}
								/>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">{t("common.cancel")}</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>{t("pages.dialogs.send")}</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">{t("pages.dialogs.openLog")}</Button>
							</DialogTrigger>
							<DialogContent size="base">
								<DialogDismiss />
								<DialogHeading
									title={t("pages.dialogs.logTitle")}
									description={t("pages.dialogs.logBody")}
								/>
								<div className="mt-4 space-y-4">
									<Field label={t("pages.dialogs.operation")}>
										<Input defaultValue={t("pages.dialogs.invest")} />
									</Field>
									<Field label={t("pages.dialogs.amount")}>
										<Input defaultValue="12,400.00" inputMode="decimal" />
									</Field>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">{t("common.cancel")}</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>{t("common.save")}</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">{t("pages.dialogs.openHolding")}</Button>
							</DialogTrigger>
							<DialogContent size="lg">
								<DialogDismiss />
								<DialogHeading
									title={t("pages.dialogs.holdingTitle")}
									description={t("pages.dialogs.holdingBody")}
								/>
								<div className="mt-4 space-y-4">
									<Field label={t("pages.dialogs.holdingName")}>
										<Input defaultValue={t("pages.dialogs.holdingNameValue")} />
									</Field>
									<Field label={t("pages.dialogs.channel")}>
										<Input defaultValue={t("pages.dialogs.channelValue")} />
									</Field>
									<Field label={t("pages.dialogs.amount")}>
										<Input defaultValue="80,000.00" inputMode="decimal" />
									</Field>
									<Field label={t("pages.dialogs.note")} required={false}>
										<InputArea defaultValue={t("pages.dialogs.noteValue")} />
									</Field>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">{t("common.cancel")}</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>{t("common.save")}</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">{t("pages.dialogs.openReview")}</Button>
							</DialogTrigger>
							<DialogContent size="xl">
								<DialogDismiss />
								<DialogHeading
									title={t("pages.dialogs.reviewTitle")}
									description={t("pages.dialogs.reviewBody")}
								/>
								<div className="mt-4">
									<DescriptionList columns={2}>
										<DescriptionList.Item term={t("pages.dialogs.from")}>
											{t("pages.dialogs.fromValue")}
										</DescriptionList.Item>
										<DescriptionList.Item term={t("pages.dialogs.to")}>
											{t("pages.dialogs.toValue")}
										</DescriptionList.Item>
										<DescriptionList.Item term={t("pages.dialogs.amount")}>
											$12,400.00
										</DescriptionList.Item>
										<DescriptionList.Item term={t("pages.dialogs.fee")}>$0.00</DescriptionList.Item>
									</DescriptionList>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">{t("common.cancel")}</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>{t("pages.dialogs.send")}</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.dialogs.form")} hint={t("pages.dialogs.formHint")}>
				<LayerCard>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">{t("pages.dialogs.openForm")}</Button>
						</DialogTrigger>
						<DialogContent size="base">
							<DialogDismiss />
							<DialogHeading
								title={t("pages.dialogs.formTitle")}
								description={t("pages.dialogs.formBody")}
							/>
							<div className="mt-4">
								<Field label={t("pages.dialogs.workspaceName")}>
									<Input placeholder={t("pages.dialogs.workspacePlaceholder")} />
								</Field>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">{t("common.cancel")}</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button>{t("common.save")}</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</LayerCard>
			</SectionRule>

			<SectionRule title={t("pages.dialogs.confirm")} hint={t("pages.dialogs.confirmHint")}>
				<LayerCard>
					<div className="flex flex-wrap gap-3">
						<ConfirmDialog
							open={confirmOpen}
							onOpenChange={setConfirmOpen}
							title={t("pages.dialogs.confirmTitle")}
							description={t("pages.dialogs.confirmBody")}
							confirmLabel={t("common.apply")}
							cancelLabel={t("common.cancel")}
							onConfirm={() => setConfirmOpen(false)}
							trigger={<Button variant="outline">{t("pages.dialogs.openConfirm")}</Button>}
						/>
						<ConfirmDialog
							open={destroyOpen}
							onOpenChange={setDestroyOpen}
							title={t("pages.dialogs.destroyTitle")}
							description={t("pages.dialogs.destroyBody")}
							confirmLabel={t("common.delete")}
							cancelLabel={t("common.cancel")}
							variant="destructive"
							onConfirm={() => setDestroyOpen(false)}
							trigger={<Button variant="destructive">{t("pages.dialogs.openDestroy")}</Button>}
						/>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">{t("pages.dialogs.openAlert")}</Button>
							</AlertDialogTrigger>
							<AlertDialogContent size="base">
								<AlertDialogHeader>
									<AlertDialogTitle>{t("pages.dialogs.alertTitle")}</AlertDialogTitle>
									<AlertDialogDescription>{t("pages.dialogs.alertBody")}</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
									<AlertDialogAction>{t("common.delete")}</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</LayerCard>
			</SectionRule>
		</div>
	);
}
