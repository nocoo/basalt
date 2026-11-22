import type { ComponentProps, ReactNode } from "react";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { Check, CircleAlert, Info, Loader2, TriangleAlert, X } from "../utils/internal-icons";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger";

export type ToastOptions = {
	/**
	 * Secondary supporting text or node displayed below the main message.
	 */
	description?: ReactNode;
	/**
	 * Custom icon override. When set to `false`, suppresses default status or notification icons.
	 */
	icon?: ReactNode | false;
	/**
	 * Whether a close button is displayed on this individual toast notification.
	 * @default true
	 */
	close?: boolean;
	/**
	 * Visibility duration in milliseconds before auto-dismissal. Resolved as `toast.duration || (Toaster.toastOptions.duration ?? Toaster.duration) || 4000`. Infinity disables auto-closing. Setting to 0 treats it as falsy and falls back through container duration before defaulting to 4000ms.
	 * @default "inherited from container, finally 4000ms"
	 */
	duration?: number;
	/**
	 * Unique identifier for this toast notification. Can be used with `toast.dismiss(id)` to manually dismiss this specific toast.
	 */
	id?: string | number;
	/**
	 * Optional action button configuration with label and onClick handler.
	 */
	action?: {
		label: string;
		onClick: () => void;
	};
};

/**
 * Options accepted by the root `toast(message, options)` dispatch function, extending `ToastOptions` with an optional `tone`.
 */
export type ToastCallOptions = ToastOptions & {
	/**
	 * Visual status tone for this toast.
	 * @default "neutral"
	 */
	tone?: ToastTone;
};

const TONE_CLASS: Record<ToastTone, string> = {
	neutral: "bg-basalt-popover",
	info: "bg-basalt-popover [&_[data-icon]]:text-basalt-info",
	success: "bg-basalt-popover [&_[data-icon]]:text-basalt-success",
	warning: "bg-basalt-popover [&_[data-icon]]:text-basalt-warning",
	danger: "bg-basalt-popover [&_[data-icon]]:text-basalt-danger",
};

const TONE_ICON: Record<ToastTone, ReactNode> = {
	neutral: null,
	info: <Info className="size-basalt-icon-lg" />,
	success: <Check className="size-basalt-icon-lg" />,
	warning: <TriangleAlert className="size-basalt-icon-lg" />,
	danger: <CircleAlert className="size-basalt-icon-lg" />,
};

function resolveIcon(tone: ToastTone, icon: ToastOptions["icon"]) {
	if (icon === false) {
		return null;
	}
	if (icon != null) {
		return icon;
	}
	return TONE_ICON[tone] ?? undefined;
}

/**
 * Dispatches a toast notification with the given message and options.
 * @param message Main notification content or React node.
 * @param options Notification customization options including optional tone.
 * @returns The unique toast identifier (string or number).
 */
function show(message: ReactNode, options: ToastCallOptions = {}) {
	const { tone = "neutral", icon, close = true, ...rest } = options;
	const payload = {
		...rest,
		closeButton: close,
		className: TONE_CLASS[tone],
		icon: resolveIcon(tone, icon),
	};
	if (tone === "success") {
		return sonnerToast.success(message, payload);
	}
	if (tone === "danger") {
		return sonnerToast.error(message, payload);
	}
	if (tone === "warning") {
		return sonnerToast.warning(message, payload);
	}
	if (tone === "info") {
		return sonnerToast.info(message, payload);
	}
	return sonnerToast(message, payload);
}

/**
 * Imperative notification dispatcher. Directly callable as `toast(message, options)` to display a neutral notification, with helper methods for status tones (`success`, `danger`, `warning`, `info`), `loading`, `promise`, and dismissal (`dismiss`).
 */
export const toast = Object.assign(show, {
	/**
	 * Dispatches a success status toast notification.
	 * @param message Main notification content or React node.
	 * @param options Notification customization options.
	 * @returns The unique toast identifier (string or number).
	 */
	success: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, tone: "success" }),
	/**
	 * Dispatches a danger status toast notification.
	 * @param message Main notification content or React node.
	 * @param options Notification customization options.
	 * @returns The unique toast identifier (string or number).
	 */
	danger: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, tone: "danger" }),
	/**
	 * Dispatches a warning status toast notification.
	 * @param message Main notification content or React node.
	 * @param options Notification customization options.
	 * @returns The unique toast identifier (string or number).
	 */
	warning: (message: ReactNode, options?: ToastOptions) =>
		show(message, { ...options, tone: "warning" }),
	/**
	 * Dispatches an info status toast notification.
	 * @param message Main notification content or React node.
	 * @param options Notification customization options.
	 * @returns The unique toast identifier (string or number).
	 */
	info: (message: ReactNode, options?: ToastOptions) => show(message, { ...options, tone: "info" }),
	/**
	 * Dispatches a persistent loading toast notification.
	 * @param message Main notification content or React node.
	 * @param options Notification customization options.
	 * @returns The unique toast identifier (string or number).
	 */
	loading: (message: ReactNode, options: ToastOptions = {}) => {
		const { icon, close = true, ...rest } = options;
		return sonnerToast.loading(message, {
			...rest,
			closeButton: close,
			className: TONE_CLASS.neutral,
			icon:
				icon === false ? null : icon != null ? (
					icon
				) : (
					<Loader2 className="size-basalt-icon-lg animate-spin" />
				),
		});
	},
	/**
	 * Binds an async task or promise to automatic loading, success, and danger toast transitions.
	 * @param promise Promise or promise-returning callback to track.
	 * @param data Loading, success, and error message handlers plus optional toast options.
	 * @returns The sonner promise toast handle with `unwrap()`.
	 */
	promise: <ToastData,>(
		promise: Promise<ToastData> | (() => Promise<ToastData>),
		data: Omit<ToastOptions, "description" | "icon"> & {
			loading: ReactNode;
			success: ReactNode | ((value: ToastData) => ReactNode | Promise<ReactNode>);
			error: ReactNode | ((reason: unknown) => ReactNode | Promise<ReactNode>);
			description?: ReactNode | ((value: unknown) => ReactNode | Promise<ReactNode>);
			finally?: () => void | Promise<void>;
		},
	) => {
		const { close = true, ...rest } = data;
		return sonnerToast.promise(promise, {
			...rest,
			closeButton: close,
			className: TONE_CLASS.neutral,
		});
	},
	/**
	 * Dismisses an active toast by its identifier, or dismisses all toasts when called without arguments. Note: Calling without arguments returns `undefined` at runtime; calling with `id` returns the dismissed `id`.
	 * @param id Optional identifier of the toast to dismiss. When omitted, all toasts are dismissed.
	 * @returns The dismissed toast identifier if provided, or undefined if dismissed without arguments.
	 */
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
	 * Custom icon overrides for toast status tones. Basalt preconfigures Lucide icons; passing an `icons` object replaces defaults rather than deep-merging. Basalt status tone dispatches (`toast.success`, `danger`, `warning`, `info`, `loading`) supply default status icons directly, which take precedence over `Toaster.icons`; custom individual toast icons should be passed via `options.icon`.
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
				success: <Check className="size-basalt-icon-lg" />,
				error: <CircleAlert className="size-basalt-icon-lg" />,
				warning: <TriangleAlert className="size-basalt-icon-lg" />,
				info: <Info className="size-basalt-icon-lg" />,
				loading: <Loader2 className="size-basalt-icon-lg animate-spin" />,
				close: <X className="size-basalt-icon" />,
			}}
			toastOptions={{
				unstyled: true,
				classNames: {
					toast:
						"basalt-ui basalt-toast flex w-full items-center gap-basalt-space-lg rounded-basalt-md border border-basalt-border bg-basalt-popover px-basalt-card py-basalt-card-sm text-basalt-base leading-[var(--basalt-leading-banner)] text-basalt-foreground shadow-basalt-floating [&_[data-content]]:min-w-0 [&_[data-content]]:flex-1",
					title: "font-medium",
					description:
						"text-basalt-base leading-[var(--basalt-line-relaxed)] text-basalt-muted-foreground",
					closeButton:
						"basalt-action basalt-action-icon order-last inline-flex shrink-0 cursor-pointer items-center justify-center rounded-basalt-sm text-basalt-muted-foreground hover:bg-basalt-hover hover:text-basalt-foreground",
					actionButton:
						"basalt-action shrink-0 cursor-pointer rounded-basalt-md bg-basalt-primary text-basalt-primary-foreground hover:bg-basalt-primary-hover",
					cancelButton:
						"basalt-action shrink-0 cursor-pointer rounded-basalt-md bg-basalt-control hover:bg-basalt-hover",
					icon: "flex size-basalt-icon-lg shrink-0 items-center justify-center",
					success: TONE_CLASS.success,
					error: TONE_CLASS.danger,
					warning: TONE_CLASS.warning,
					info: TONE_CLASS.info,
				},
			}}
			{...props}
		/>
	);
}
