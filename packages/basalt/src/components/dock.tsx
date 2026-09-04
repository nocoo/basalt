import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { dialogOverlayClass } from "./dialog";
import { OVERLAY_LAYER, OVERLAY_MOTION } from "./overlay";

const FOCUSABLE =
	'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const PORTAL_FOCUS = "[data-radix-popper-content-wrapper], [data-radix-select-viewport]";

function tabbables(root: HTMLElement | null) {
	if (!root) {
		return [];
	}
	return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((node) => {
		if (node.closest("[inert]")) {
			return false;
		}
		return node.tabIndex >= 0;
	});
}

export type DockMode = "overlay" | "push";

export interface DockProps {
	/**
	 * Whether the dock occupies its width.
	 */
	open: boolean;
	/**
	 * `push` shrinks the main column. `overlay` covers it with a Dialog scrim.
	 * @default "push"
	 */
	mode?: DockMode;
	/**
	 * Width when open.
	 * @default "clamp(300px, 32.5vw, 546px)"
	 */
	width?: string;
	/**
	 * Overlay scrim click. Ignored in push mode.
	 */
	onDismiss?: () => void;
	/**
	 * Overlay scrim accessible name.
	 * @default "Dismiss"
	 */
	dismissLabel?: string;
	/**
	 * Accessible name.
	 */
	"aria-label": string;
	className?: string;
	children: ReactNode;
}

export interface DockBodyProps {
	className?: string;
	children: ReactNode;
}

export function DockBody({ className, children }: DockBodyProps) {
	return (
		<div className={cn("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3", className)}>
			{children}
		</div>
	);
}

export function Dock({
	open,
	mode = "push",
	width = "clamp(300px, 32.5vw, 546px)",
	onDismiss,
	dismissLabel = "Dismiss",
	className,
	children,
	"aria-label": ariaLabel,
}: DockProps) {
	const overlay = mode === "overlay";
	const panelRef = useRef<HTMLElement | null>(null);
	const overlayRootRef = useRef<HTMLDivElement>(null);
	const setPanel = (node: HTMLElement | null) => {
		panelRef.current = node;
	};
	const wasOpen = useRef(!overlay && open);
	const previousFocus = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (open) {
			if (wasOpen.current) {
				return;
			}
			previousFocus.current =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
			const timer = window.setTimeout(() => {
				const root = panelRef.current;
				const nodes = tabbables(root);
				(nodes[0] ?? root)?.focus();
				wasOpen.current = true;
			}, 0);
			return () => window.clearTimeout(timer);
		}
		if (wasOpen.current) {
			previousFocus.current?.focus?.();
			previousFocus.current = null;
			wasOpen.current = false;
		}
	}, [open]);

	useEffect(() => {
		if (!overlay || !open) {
			return;
		}
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (event.defaultPrevented || !onDismiss) {
					return;
				}
				event.preventDefault();
				onDismiss();
				return;
			}
			if (event.key !== "Tab") {
				return;
			}
			const root = overlayRootRef.current;
			if (!root) {
				return;
			}
			const nodes = tabbables(root);
			if (nodes.length === 0) {
				event.preventDefault();
				panelRef.current?.focus();
				return;
			}
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			const active = document.activeElement;
			if (active instanceof Element) {
				const nestedModal = active.closest("[role='dialog'], [role='alertdialog']");
				if (nestedModal && nestedModal !== panelRef.current && !root.contains(nestedModal)) {
					return;
				}
				if (active.closest(PORTAL_FOCUS)) {
					return;
				}
			}
			if (
				!(active instanceof Node) ||
				!root.contains(active) ||
				(!event.shiftKey && active === last)
			) {
				event.preventDefault();
				first?.focus();
				return;
			}
			if (event.shiftKey && active === first) {
				event.preventDefault();
				last?.focus();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [overlay, open, onDismiss]);
	const panelClass = cn(
		"overflow-hidden bg-basalt-background transition-[width] duration-300 ease-in-out",
		overlay ? cn("absolute top-0 right-0 h-full", OVERLAY_LAYER) : "sticky top-0 h-screen shrink-0",
		OVERLAY_MOTION,
		className,
	);
	const panelStyle = { width: open ? width : 0 };
	const inner = (
		<div
			className="flex h-full flex-col bg-basalt-card shadow-lg ring-1 ring-basalt-border/40"
			style={{ width }}
		>
			{children}
		</div>
	);

	if (!overlay) {
		return (
			<aside
				ref={setPanel}
				className={panelClass}
				style={panelStyle}
				aria-label={ariaLabel}
				aria-hidden={!open}
				inert={!open || undefined}
				tabIndex={open ? -1 : undefined}
			>
				{inner}
			</aside>
		);
	}

	return (
		<div
			ref={overlayRootRef}
			className={cn("absolute inset-0", OVERLAY_LAYER, !open && "pointer-events-none")}
		>
			{onDismiss ? (
				<button
					type="button"
					tabIndex={open ? 0 : -1}
					aria-label={dismissLabel}
					aria-hidden={!open}
					data-state={open ? "open" : "closed"}
					className={cn(dialogOverlayClass("absolute"), !open && "opacity-0")}
					onClick={open ? onDismiss : undefined}
				/>
			) : (
				<div
					aria-hidden
					data-state={open ? "open" : "closed"}
					className={cn(dialogOverlayClass("absolute"), !open && "opacity-0")}
				/>
			)}
			<div
				ref={setPanel}
				role="dialog"
				aria-modal={open ? true : undefined}
				aria-label={ariaLabel}
				className={panelClass}
				style={panelStyle}
				aria-hidden={!open}
				inert={!open || undefined}
				tabIndex={open ? -1 : undefined}
			>
				{inner}
			</div>
		</div>
	);
}
