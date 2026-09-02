import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as React from "react";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "./button";

export type ConfirmDialogVariant = "default" | "destructive";

export interface ConfirmDialogProps {
	/** Whether the confirmation dialog is shown. */
	open: boolean;
	/** Called when the dialog requests to open or close. */
	onOpenChange: (open: boolean) => void;
	/** Called once when the user confirms. The dialog does not close itself. */
	onConfirm: () => void | Promise<void>;
	/** The dialog title. */
	title: React.ReactNode;
	/** Supporting copy that describes the action. */
	description: React.ReactNode;
	/**
	 * Label for the confirm button.
	 * @default "Confirm"
	 */
	confirmLabel?: React.ReactNode;
	/**
	 * Label for the cancel button.
	 * @default "Cancel"
	 */
	cancelLabel?: React.ReactNode;
	/**
	 * Appearance of the confirm button.
	 * @default "default"
	 */
	variant?: ConfirmDialogVariant;
	/**
	 * Disable both actions and ignore close requests while work is pending.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Control that opens the dialog. When set, closing restores focus to it.
	 */
	trigger?: React.ReactNode;
}

export interface UseConfirmOptions {
	/** The dialog title. */
	title: React.ReactNode;
	/** Supporting copy that describes the action. */
	description: React.ReactNode;
	/** Label for the confirm button. */
	confirmLabel?: React.ReactNode;
	/** Label for the cancel button. */
	cancelLabel?: React.ReactNode;
	/** Appearance of the confirm button. */
	variant?: ConfirmDialogVariant;
}

export interface UseConfirmResult {
	confirm: (options: UseConfirmOptions) => Promise<boolean>;
	dialogProps: ConfirmDialogProps;
}

export function ConfirmDialog({
	cancelLabel = "Cancel",
	confirmLabel = "Confirm",
	description,
	loading = false,
	onConfirm,
	onOpenChange,
	open,
	title,
	trigger,
	variant = "default",
}: ConfirmDialogProps) {
	const triggerRef = React.useRef<HTMLButtonElement>(null);
	const wasOpenRef = React.useRef(open);
	React.useEffect(() => {
		if (wasOpenRef.current && !open) {
			triggerRef.current?.focus();
		}
		wasOpenRef.current = open;
	}, [open]);
	return (
		<AlertDialog
			open={open}
			onOpenChange={(next) => {
				if (loading && !next) {
					return;
				}
				onOpenChange(next);
			}}
		>
			{trigger ? (
				<AlertDialogTrigger ref={triggerRef} asChild>
					{trigger}
				</AlertDialogTrigger>
			) : null}
			<AlertDialogContent
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					triggerRef.current?.focus();
				}}
			>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogPrimitive.Cancel asChild>
						<Button disabled={loading} variant="outline">
							{cancelLabel}
						</Button>
					</AlertDialogPrimitive.Cancel>
					<AlertDialogPrimitive.Action asChild>
						<Button
							loading={loading}
							variant={variant}
							onClick={(event) => {
								event.preventDefault();
								if (!loading) {
									void onConfirm();
								}
							}}
						>
							{confirmLabel}
						</Button>
					</AlertDialogPrimitive.Action>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export function useConfirm(): UseConfirmResult {
	const [open, setOpen] = React.useState(false);
	const [options, setOptions] = React.useState<UseConfirmOptions>({
		title: "",
		description: "",
	});
	const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

	const settle = React.useCallback((value: boolean) => {
		const resolve = resolverRef.current;
		resolverRef.current = null;
		resolve?.(value);
	}, []);

	React.useEffect(() => {
		return () => {
			settle(false);
		};
	}, [settle]);

	const confirm = React.useCallback(
		(next: UseConfirmOptions) => {
			settle(false);
			setOptions(next);
			setOpen(true);
			return new Promise<boolean>((resolve) => {
				resolverRef.current = resolve;
			});
		},
		[settle],
	);

	return {
		confirm,
		dialogProps: {
			open,
			title: options.title,
			description: options.description,
			confirmLabel: options.confirmLabel,
			cancelLabel: options.cancelLabel,
			variant: options.variant,
			onOpenChange: (next) => {
				setOpen(next);
				if (!next) {
					settle(false);
				}
			},
			onConfirm: () => {
				settle(true);
				setOpen(false);
			},
		},
	};
}
