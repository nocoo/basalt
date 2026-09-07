import { ArrowLeft } from "lucide-react";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "../utils/cn";
import { BASALT_UI_CLASS } from "../utils/control-surface";
import { Button } from "./button";

export interface ResponsiveMasterDetailProps {
	/** Accessible name of the composition. */
	label: string;
	/** Application-rendered list; selection, routing and data remain outside. */
	list: ReactNode;
	/** Application-rendered detail content. */
	children: ReactNode;
	/** Controlled detail visibility. */
	detailOpen: boolean;
	/** Requests opening/closing the detail; the caller accepts the change. */
	onDetailOpenChange: (open: boolean) => void;
	/** Current selection identity, used to focus newly selected mobile details. */
	selectedId?: string | null;
	/** List region name. @default "Items" */
	listLabel?: string;
	/** Detail region name. @default "Details" */
	detailLabel?: string;
	/** Mobile return action text. @default "Back to items" */
	backLabel?: string;
	/** Desktop detail placeholder while no item is open. */
	empty?: ReactNode;
	/** Additional root classes; provide application-specific height/scrolling here. */
	className?: string;
}
/** Two columns at 768px and above; one visible, focusable pane below it. Not a modal. */
export function ResponsiveMasterDetail({
	label,
	list,
	children,
	detailOpen,
	onDetailOpenChange,
	selectedId,
	listLabel = "Items",
	detailLabel = "Details",
	backLabel = "Back to items",
	empty = (
		<p className="p-6 text-sm text-basalt-muted-foreground">Choose an item to see its details.</p>
	),
	className,
}: ResponsiveMasterDetailProps) {
	const [compact, setCompact] = useState(false);
	const listRegion = useRef<HTMLElement>(null);
	const detailRegion = useRef<HTMLElement>(null);
	const opener = useRef<HTMLElement | null>(null);
	const previous = useRef({ compact: false, detailOpen: false, selectedId });
	useEffect(() => {
		const query = window.matchMedia("(max-width: 767px)");
		const update = () => setCompact(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	useLayoutEffect(() => {
		const before = previous.current;
		if (
			compact &&
			detailOpen &&
			(!before.compact || !before.detailOpen || before.selectedId !== selectedId)
		)
			detailRegion.current?.focus();
		if (compact && !detailOpen && before.detailOpen) {
			const target = opener.current;
			if (target?.isConnected && !target.closest("[hidden], [inert]")) target.focus();
			else listRegion.current?.focus();
		}
		previous.current = { compact, detailOpen, selectedId };
	}, [compact, detailOpen, selectedId]);
	return (
		<div
			role="group"
			aria-label={label}
			className={cn(
				BASALT_UI_CLASS,
				"grid min-w-0 grid-cols-1 overflow-hidden rounded-basalt-lg border border-basalt-border md:grid-cols-[minmax(12rem,20rem)_minmax(0,1fr)]",
				className,
			)}
		>
			<section
				ref={listRegion}
				aria-label={listLabel}
				tabIndex={-1}
				hidden={compact && detailOpen}
				inert={compact && detailOpen}
				className={cn(
					"min-w-0 bg-basalt-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basalt-ring md:border-r md:border-basalt-border",
					detailOpen && "hidden md:block",
				)}
				onFocusCapture={(event) => {
					opener.current = event.target;
				}}
				onPointerDownCapture={(event) => {
					const target = (event.target as Element).closest<HTMLElement>(
						"button, a[href], input, [tabindex]",
					);
					if (target) opener.current = target;
				}}
			>
				{list}
			</section>
			<section
				ref={detailRegion}
				aria-label={detailLabel}
				tabIndex={-1}
				hidden={compact && !detailOpen}
				inert={compact && !detailOpen}
				className={cn(
					"min-w-0 bg-basalt-background focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-basalt-ring",
					!detailOpen && "hidden md:block",
				)}
			>
				{compact && detailOpen && (
					<div className="border-b border-basalt-border p-2">
						<Button size="sm" variant="ghost" onClick={() => onDetailOpenChange(false)}>
							<ArrowLeft />
							{backLabel}
						</Button>
					</div>
				)}
				<div hidden={!detailOpen} inert={!detailOpen}>
					{children}
				</div>
				{!detailOpen && empty}
			</section>
		</div>
	);
}
