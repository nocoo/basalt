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
	DialogHeader,
	type DialogSize,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import { Field } from "@nocoo/basalt/components/field";
import { Input } from "@nocoo/basalt/components/input";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { SectionRule } from "@nocoo/basalt/components/section-rule";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Separator } from "@nocoo/basalt/components/separator";
import { Textarea } from "@nocoo/basalt/components/textarea";
import { useState } from "react";
import { ShowcasePage } from "@/components/ShowcasePage";

const DIALOG_FIELDS_CLASS = "mt-basalt-layout space-y-basalt-layout";
const DIALOG_SECTION_CLASS = "mt-basalt-layout space-y-basalt-layout-lg";

const DIALOG_SIZES: { size: DialogSize; label: string; width: string }[] = [
	{ size: "sm", label: "Small", width: "288px" },
	{ size: "md", label: "Medium", width: "384px" },
	{ size: "lg", label: "Large", width: "512px" },
	{ size: "xl", label: "Extra large", width: "768px" },
];

function DialogHeading({ title, description }: { title: string; description?: string }) {
	return (
		<DialogHeader>
			<DialogTitle>{title}</DialogTitle>
			{description ? <DialogDescription>{description}</DialogDescription> : null}
		</DialogHeader>
	);
}

function DialogColumnTitle({ children }: { children: string }) {
	return <p className="text-basalt-sm font-medium text-basalt-muted-foreground">{children}</p>;
}

const UNIT_LOGS = [
	{ date: "2026-03-01", action: "Add care funds", amount: "$12,400.00" },
	{ date: "2026-04-12", action: "Adjust", amount: "$800.00" },
	{ date: "2026-06-20", action: "Add care funds", amount: "$4,200.00" },
] as const;

export default function DialogsPage() {
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [destroyOpen, setDestroyOpen] = useState(false);

	return (
		<ShowcasePage
			title="Dialogs"
			description="Standard overlay for decisions, short forms, and confirmations. Use Dialog, AlertDialog, and ConfirmDialog — never a native dialog or button."
		>
			<SectionRule title="Anatomy" hint="Copy this structure so every product dialog matches.">
				<LayerCard>
					<DescriptionList columns={1}>
						<DescriptionList.Item term="Width">
							Default size is md (384px). sm 288px, lg 512px, xl 768px. The panel pads 16px on
							mobile and 24px on desktop and scrolls if content overflows.
						</DescriptionList.Item>
						<DescriptionList.Item term="Title and close">
							Title is top-left. Optional close is a ghost icon Button, absolute top-right, labeled
							Close. Confirm and alert dialogs omit it.
						</DescriptionList.Item>
						<DescriptionList.Item term="Subtitle">
							DialogDescription sits under the title. One or two sentences, muted.
						</DescriptionList.Item>
						<DescriptionList.Item term="Actions">
							DialogFooter sits 16px below the body, bottom-right. Cancel is outline first, confirm
							is last. ConfirmDialog focuses Cancel first and does not dismiss on outside click.
						</DescriptionList.Item>
					</DescriptionList>
				</LayerCard>
			</SectionRule>

			<SectionRule title="Standard" hint="Informational dialog with close, cancel, and confirm.">
				<LayerCard>
					<Dialog>
						<DialogTrigger asChild>
							<Button>Open standard</Button>
						</DialogTrigger>
						<DialogContent size="md" closeLabel="Close">
							<DialogHeading
								title="Rename care team"
								description="This name appears in the sidebar and in share links. You can change it later."
							/>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button>Apply</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Sizes"
				hint="Pick a size. Do not set a custom max-width unless the content cannot fit these four."
			>
				<LayerCard>
					<div className="flex flex-wrap gap-basalt-space-lg">
						{DIALOG_SIZES.map(({ size, label, width }) => (
							<Dialog key={size}>
								<DialogTrigger asChild>
									<Button variant="outline">
										{label} ({width})
									</Button>
								</DialogTrigger>
								<DialogContent size={size} closeLabel="Close">
									<DialogHeading
										title={label}
										description={`size="${size}" stays ${width} wide on desktop.`}
									/>
								</DialogContent>
							</Dialog>
						))}
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Money flows"
				hint="From a small send to a wide review. Complex panels get the top-right close. Confirmations do not."
			>
				<LayerCard>
					<div className="flex flex-wrap gap-basalt-space-lg">
						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">Open send</Button>
							</DialogTrigger>
							<DialogContent size="sm" showCloseButton={false}>
								<DialogHeading
									title="Send $1,200?"
									description="Transfer from your care reserve to your treatment fund. This posts today."
								/>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">Cancel</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>Send</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">Open contribution</Button>
							</DialogTrigger>
							<DialogContent size="md" closeLabel="Close">
								<DialogHeading
									title="Log contribution"
									description="Record cash in or out of a holding."
								/>
								<div data-dialog-fields="" className={DIALOG_FIELDS_CLASS}>
									<Field label="Operation">
										<Input defaultValue="Add care funds" />
									</Field>
									<Field label="Amount">
										<Input defaultValue="12,400.00" inputMode="decimal" />
									</Field>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">Cancel</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>Save changes</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">Open holding</Button>
							</DialogTrigger>
							<DialogContent size="lg" closeLabel="Close">
								<DialogHeading
									title="Edit treatment fund"
									description="Care program, payment channel, and available funding."
								/>
								<div data-dialog-fields="" className={DIALOG_FIELDS_CLASS}>
									<Field label="Treatment fund">
										<Input defaultValue="Recovery fund" />
									</Field>
									<Field label="Channel">
										<Input defaultValue="Care account" />
									</Field>
									<Field label="Amount">
										<Input defaultValue="80,000.00" inputMode="decimal" />
									</Field>
									<Field label="Note" required={false}>
										<Textarea defaultValue="Reserved for the next recovery program." />
									</Field>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">Cancel</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>Save changes</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">Open review</Button>
							</DialogTrigger>
							<DialogContent size="xl" closeLabel="Close">
								<DialogHeading
									title="Review transfer"
									description="Check the route before the money leaves."
								/>
								<div className="mt-basalt-layout">
									<DescriptionList columns={2}>
										<DescriptionList.Item term="From">Care reserve</DescriptionList.Item>
										<DescriptionList.Item term="To">Treatment fund</DescriptionList.Item>
										<DescriptionList.Item term="Amount">$12,400.00</DescriptionList.Item>
										<DescriptionList.Item term="Fee">$0.00</DescriptionList.Item>
									</DescriptionList>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">Cancel</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>Send</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button variant="outline">Open unit editor</Button>
							</DialogTrigger>
							<DialogContent
								size="xl"
								closeLabel="Close"
								className="sm:w-[min(72rem,calc(100vw-2rem))]"
							>
								<DialogHeading
									title="Edit care funding record · U-2044"
									description="Basics, product operations, and history in one commit. Save applies them together."
								/>
								<div data-dialog-fields="" className={DIALOG_SECTION_CLASS}>
									<div className="grid grid-cols-1 items-start gap-basalt-layout lg:grid-cols-3">
										<div className="space-y-basalt-layout">
											<DialogColumnTitle>Basics</DialogColumnTitle>
											<Field label="Code">
												<Input defaultValue="U-2044" />
											</Field>
											<Field label="Amount">
												<Input defaultValue="80,000.00" inputMode="decimal" />
											</Field>
											<div className="grid grid-cols-1 gap-basalt-layout sm:grid-cols-2">
												<Select defaultValue="USD">
													<Field label="Currency">
														<SelectTrigger aria-label="Currency">
															<SelectValue />
														</SelectTrigger>
													</Field>
													<SelectContent>
														<SelectItem value="USD">USD</SelectItem>
														<SelectItem value="CNY">CNY</SelectItem>
														<SelectItem value="HKD">HKD</SelectItem>
													</SelectContent>
												</Select>
												<Select defaultValue="active">
													<Field label="Status">
														<SelectTrigger aria-label="Status">
															<SelectValue />
														</SelectTrigger>
													</Field>
													<SelectContent>
														<SelectItem value="active">Active</SelectItem>
														<SelectItem value="planned">Planned</SelectItem>
														<SelectItem value="archived">Archived</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<Select defaultValue="usd-cash">
												<Field label="Strategy">
													<SelectTrigger aria-label="Strategy">
														<SelectValue />
													</SelectTrigger>
												</Field>
												<SelectContent>
													<SelectItem value="usd-cash">USD cash</SelectItem>
													<SelectItem value="long">Long-term</SelectItem>
													<SelectItem value="short">Short-term</SelectItem>
												</SelectContent>
											</Select>
											<Field label="Start date">
												<Input defaultValue="2024-11-01" />
											</Field>
											<Field label="Unit note" required={false}>
												<Textarea defaultValue="Rolled from the 36-month certificate." />
											</Field>
										</div>
										<div className="space-y-basalt-layout">
											<DialogColumnTitle>Product and operations</DialogColumnTitle>
											<Field label="Product">
												<Input defaultValue="Recovery fund" />
											</Field>
											<Field label="Channel">
												<Input defaultValue="Care account" />
											</Field>
											<div className="space-y-basalt-layout">
												<p className="text-basalt-sm text-basalt-muted-foreground">
													Stage an operation
												</p>
												<div className="flex flex-wrap gap-basalt-space-lg">
													<Button type="button" variant="outline" size="sm">
														Add care funds
													</Button>
													<Button type="button" variant="outline" size="sm">
														Withdraw
													</Button>
													<Button type="button" variant="outline" size="sm">
														Switch product
													</Button>
												</div>
											</div>
											<DescriptionList columns={1}>
												<DescriptionList.Item term="Lock window">
													90 days · next open 2026-09-15
												</DescriptionList.Item>
												<DescriptionList.Item term="Next open">2026-09-15</DescriptionList.Item>
											</DescriptionList>
										</div>
										<div className="space-y-basalt-layout">
											<DialogColumnTitle>History</DialogColumnTitle>
											<div className="space-y-basalt-layout">
												{UNIT_LOGS.map((log) => (
													<div
														key={log.date}
														className="flex flex-wrap items-baseline gap-basalt-card-sm"
													>
														<div>
															<p className="text-basalt-base text-basalt-foreground">
																{log.action}
															</p>
															<p className="text-basalt-sm text-basalt-muted-foreground">
																{log.date}
															</p>
														</div>
														<p className="ms-auto text-basalt-base tabular-nums">{log.amount}</p>
													</div>
												))}
											</div>
										</div>
									</div>
									<div className="space-y-basalt-layout">
										<Separator />
										<div className="grid gap-basalt-layout sm:grid-cols-[minmax(0,1fr)_11rem]">
											<Field label="Commit note" required={false}>
												<Input placeholder="Why this change (written to the log)" />
											</Field>
											<Field label="Operation date">
												<Input defaultValue="2026-09-04" />
											</Field>
										</div>
									</div>
								</div>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant="outline">Cancel</Button>
									</DialogClose>
									<DialogClose asChild>
										<Button>Save changes</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</div>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Form"
				hint="Short forms stay on md. Use Field and Input, then cancel and save."
			>
				<LayerCard>
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline">Open form</Button>
						</DialogTrigger>
						<DialogContent size="md" closeLabel="Close">
							<DialogHeading
								title="Create care team"
								description="A care team coordinates patients, appointments, and shared records."
							/>
							<div data-dialog-fields="" className={DIALOG_FIELDS_CLASS}>
								<Field label="Care team name">
									<Input placeholder="Harbor Clinic" />
								</Field>
							</div>
							<DialogFooter>
								<DialogClose asChild>
									<Button variant="outline">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button>Save changes</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</LayerCard>
			</SectionRule>

			<SectionRule
				title="Confirm and destroy"
				hint="ConfirmDialog for yes/no. AlertDialog for a destructive acknowledgment that cannot be dismissed by clicking outside."
			>
				<LayerCard>
					<div className="flex flex-wrap gap-basalt-space-lg">
						<ConfirmDialog
							open={confirmOpen}
							onOpenChange={setConfirmOpen}
							title="Apply this layout?"
							description="The current arrangement will replace the saved default."
							confirmLabel="Apply"
							cancelLabel="Cancel"
							onConfirm={() => setConfirmOpen(false)}
							trigger={<Button variant="outline">Open confirm</Button>}
						/>
						<ConfirmDialog
							open={destroyOpen}
							onOpenChange={setDestroyOpen}
							title="Delete care team?"
							description="This permanently removes the simulated team and its shared records."
							confirmLabel="Delete"
							cancelLabel="Cancel"
							variant="destructive"
							onConfirm={() => setDestroyOpen(false)}
							trigger={<Button variant="destructive">Open destructive</Button>}
						/>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive">Open alert</Button>
							</AlertDialogTrigger>
							<AlertDialogContent size="md">
								<AlertDialogHeader>
									<AlertDialogTitle>Delete care team?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. All data will be permanently removed.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction>Delete</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</LayerCard>
			</SectionRule>
		</ShowcasePage>
	);
}
