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

type SonnerComponentProps = ComponentProps<typeof Sonner>;

export type ToasterToastOptions = NonNullable<SonnerComponentProps["toastOptions"]>;
export type ToasterIcons = NonNullable<SonnerComponentProps["icons"]>;
export type ToasterSwipeDirection = NonNullable<SonnerComponentProps["swipeDirections"]>[number];

export interface ToasterProps
	extends Omit<
		SonnerComponentProps,
		| "id"
		| "invert"
		| "theme"
		| "position"
		| "hotkey"
		| "richColors"
		| "expand"
		| "duration"
		| "gap"
		| "visibleToasts"
		| "closeButton"
		| "toastOptions"
		| "className"
		| "style"
		| "offset"
		| "mobileOffset"
		| "dir"
		| "swipeDirections"
		| "icons"
		| "containerAriaLabel"
		| "customAriaLabel"
	> {
	/**
	 * Unique identifier for this toaster instance. When set, only toasts dispatched with a matching toasterId will display here. Basalt standard toast options do not expose toasterId, so global un-identified mounting is recommended.
	 */
	id?: SonnerComponentProps["id"];
	/**
	 * Invert toast foreground and background colors.
	 * @default false
	 */
	invert?: SonnerComponentProps["invert"];
	/**
	 * Color scheme theme override for toast notifications.
	 * @default "light"
	 */
	theme?: SonnerComponentProps["theme"];
	/**
	 * Screen positioning for the toast viewport stack.
	 * @default "bottom-right"
	 */
	position?: SonnerComponentProps["position"];
	/**
	 * Keyboard hotkey combination to expand and focus the toast viewport.
	 * @default ["altKey", "KeyT"]
	 */
	hotkey?: SonnerComponentProps["hotkey"];
	/**
	 * Whether rich semantic colors should be applied to default notification styles.
	 * @default false
	 */
	richColors?: SonnerComponentProps["richColors"];
	/**
	 * Whether toasts should be expanded by default rather than collapsed into a stacked pile.
	 * @default false
	 */
	expand?: SonnerComponentProps["expand"];
	/**
	 * Default visibility duration in milliseconds before auto-dismissal. Resolved as `toast.duration || (Toaster.toastOptions.duration ?? Toaster.duration) || 4000`. Passing Infinity prevents auto-closing. When `toastOptions.duration === 0`, it is treated as falsy and bypasses `Toaster.duration`, falling back to 4000.
	 * @default 4000
	 */
	duration?: SonnerComponentProps["duration"];
	/**
	 * Pixel gap between stacked toasts.
	 * @default 14
	 */
	gap?: SonnerComponentProps["gap"];
	/**
	 * Maximum number of toasts visible simultaneously in the stack.
	 * @default 3
	 */
	visibleToasts?: SonnerComponentProps["visibleToasts"];
	/**
	 * Whether a close button is displayed on each toast notification. Basalt enables this by default (`closeButton = true`), and Basalt single-toast calls also default to `close: true`, overriding `Toaster.closeButton = false`. To hide the close button on an individual toast, pass `close: false` in the dispatch options.
	 * @default true
	 */
	closeButton?: SonnerComponentProps["closeButton"];
	/**
	 * Default options and custom class names applied to all rendered toasts. Passing a custom `toastOptions` object will override Basalt default styling rather than deep-merging.
	 */
	toastOptions?: ToasterToastOptions;
	/**
	 * Additional CSS class name applied to each rendered ordered list (`ol`) toast viewport.
	 */
	className?: SonnerComponentProps["className"];
	/**
	 * Inline style properties applied to each rendered ordered list (`ol`) toast viewport.
	 */
	style?: SonnerComponentProps["style"];
	/**
	 * Viewport offset margin from screen edges on desktop screens.
	 * @default "24px"
	 */
	offset?: SonnerComponentProps["offset"];
	/**
	 * Viewport offset margin from screen edges on mobile devices.
	 * @default "16px"
	 */
	mobileOffset?: SonnerComponentProps["mobileOffset"];
	/**
	 * Layout direction of the notification viewport ('ltr', 'rtl', or document direction when unspecified).
	 * @default document direction
	 */
	dir?: SonnerComponentProps["dir"];
	/**
	 * Allowed swipe directions to dismiss toasts. Defaults based on position orientation (e.g. ['bottom', 'right'] for bottom-right).
	 */
	swipeDirections?: ToasterSwipeDirection[];
	/**
	 * Custom icon overrides for toast status variants. Basalt preconfigures Lucide icons; passing an `icons` object replaces defaults rather than deep-merging. Basalt status variant dispatches (`toast.success`, `error`, `warning`, `info`) supply default status icons directly, which take precedence over `Toaster.icons`; custom individual toast icons should be passed via `options.icon`.
	 */
	icons?: ToasterIcons;
	/**
	 * Accessible label for the notification region container.
	 * @default "Notifications"
	 */
	containerAriaLabel?: SonnerComponentProps["containerAriaLabel"];
	/**
	 * Custom accessible label overriding both containerAriaLabel and hotkey text on the section wrapper.
	 */
	customAriaLabel?: SonnerComponentProps["customAriaLabel"];
}

export function Toaster({ closeButton = true, ...props }: ToasterProps) {
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
