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

function DialogCloseButton() {
	const { t } = useTranslation();
	return (
		<DialogClose asChild>
			<Button variant="outline" size="icon" aria-label={t("common.close")}>
				<X />
			</Button>
		</DialogClose>
	);
}

function DialogTitleRow({ title }: { title: string }) {
	return (
		<div className="mb-4 flex items-start justify-between gap-4">
			<DialogTitle>{title}</DialogTitle>
			<DialogCloseButton />
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
							<DialogTitleRow title={t("pages.dialogs.standardTitle")} />
							<DialogDescription>{t("pages.dialogs.standardBody")}</DialogDescription>
							<DialogFooter className="mt-8">
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
									<DialogTitleRow title={t(`pages.dialogs.size.${size}`)} />
									<DialogDescription>
										{t("pages.dialogs.sizeBody", { size, width })}
									</DialogDescription>
									<DialogFooter className="mt-8">
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

			<SectionRule title={t("pages.dialogs.form")} hint={t("pages.dialogs.formHint")}>
				<LayerCard>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">{t("pages.dialogs.openForm")}</Button>
						</DialogTrigger>
						<DialogContent size="base">
							<DialogTitleRow title={t("pages.dialogs.formTitle")} />
							<DialogDescription>{t("pages.dialogs.formBody")}</DialogDescription>
							<div className="mt-6">
								<Field label={t("pages.dialogs.workspaceName")}>
									<Input placeholder={t("pages.dialogs.workspacePlaceholder")} />
								</Field>
							</div>
							<DialogFooter className="mt-8">
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
								<AlertDialogFooter className="mt-8">
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
