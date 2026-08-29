import { Check, CircleAlert, Info, TriangleAlert, X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export type ToastOptions = {
	description?: ReactNode;
	icon?: ReactNode | false;
	close?: boolean;
	duration?: number;
	id?: string | number;
	action?: {
		label: string;
		onClick: () => void;
	};
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
	default: "bg-basalt-popover",
	success:
		"bg-basalt-heatmap-green-1 [&_[data-icon]]:text-basalt-heatmap-green-4 [&_[data-title]]:text-basalt-heatmap-green-4",
	error:
		"bg-basalt-danger-tint [&_[data-icon]]:text-basalt-danger [&_[data-title]]:text-basalt-danger",
	warning:
		"bg-basalt-warning-tint [&_[data-icon]]:text-basalt-warning [&_[data-title]]:text-basalt-warning",
	info: "bg-basalt-info-tint [&_[data-icon]]:text-basalt-info [&_[data-title]]:text-basalt-info",
};

const VARIANT_ICON: Record<ToastVariant, ReactNode> = {
	default: null,
	success: <Check className="size-4" />,
	error: <CircleAlert className="size-4" />,
	warning: <TriangleAlert className="size-4" />,
	info: <Info className="size-4" />,
};

function resolveIcon(variant: ToastVariant, icon: ToastOptions["icon"]) {
	if (icon === false) {
		return false;
	}
	if (icon != null) {
		return icon;
	}
	return VARIANT_ICON[variant] ?? undefined;
}

function show(message: ReactNode, options: ToastOptions & { variant?: ToastVariant } = {}) {
	const { variant = "default", icon, close = true, ...rest } = options;
	const payload = {
		...rest,
		closeButton: close,
		className: VARIANT_CLASS[variant],
		icon: resolveIcon(variant, icon),
	};
	if (variant === "success") {
		return sonnerToast.success(message, payload);
	}
	if (variant === "error") {
		return sonnerToast.error(message, payload);
	}
	if (variant === "warning") {
		return sonnerToast.warning(message, payload);
	}
	if (variant === "info") {
		return sonnerToast.info(message, payload);
	}
	return sonnerToast(message, payload);
}

export const toast = Object.assign(show, {
	success: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, variant: "success" }),
	error: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, variant: "error" }),
	warning: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, variant: "warning" }),
	info: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, variant: "info" }),
	dismiss: sonnerToast.dismiss,
});

export function Toaster({ closeButton = true, ...props }: ComponentProps<typeof Sonner>) {
	return (
		<Sonner
			closeButton={closeButton}
			icons={{
				success: <Check className="size-4" />,
				error: <CircleAlert className="size-4" />,
				warning: <TriangleAlert className="size-4" />,
				info: <Info className="size-4" />,
				close: <X className="size-3.5" />,
			}}
			toastOptions={{
				classNames: {
					toast: "border border-basalt-border text-basalt-foreground shadow-lg",
					title: "text-sm font-medium",
					description: "text-sm text-basalt-muted-foreground",
					closeButton:
						"border-basalt-border bg-basalt-popover text-basalt-muted-foreground hover:text-basalt-foreground",
					icon: "size-4",
					success: VARIANT_CLASS.success,
					error: VARIANT_CLASS.error,
					warning: VARIANT_CLASS.warning,
					info: VARIANT_CLASS.info,
				},
			}}
			{...props}
		/>
	);
}

export const Toast = Toaster;
