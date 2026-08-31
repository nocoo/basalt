import * as React from "react";

export const SELECTION_INDICATOR_MOTION_CLASS =
	"transition-[left,width,top,height] duration-200 ease-out";

export type SelectionGeometry = {
	left: number;
	width: number;
	top: number;
	height: number;
};

export type SelectionIndicatorState = SelectionGeometry & {
	visible: boolean;
	animated: boolean;
};

const EMPTY: SelectionGeometry = { left: 0, width: 0, top: 0, height: 0 };

export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") {
		ref(value);
	} else if (ref) {
		(ref as React.MutableRefObject<T | null>).current = value;
	}
}

export function measureSelectionItem(item: HTMLElement): SelectionGeometry {
	return {
		left: item.offsetLeft,
		width: item.offsetWidth,
		top: item.offsetTop,
		height: item.offsetHeight,
	};
}

function prefersReducedMotion() {
	return (
		typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

function selectionTargets(root: HTMLElement) {
	const targets: HTMLElement[] = [root];
	for (const node of root.children) {
		if (node instanceof HTMLElement && node.getAttribute("aria-hidden") !== "true") {
			targets.push(node);
		}
	}
	return targets;
}

export function useSelectionIndicator({
	itemSelector,
	enabled = true,
	mapGeometry = measureSelectionItem,
}: {
	itemSelector: string;
	enabled?: boolean;
	mapGeometry?: (item: HTMLElement, root: HTMLElement) => SelectionGeometry;
}) {
	const rootRef = React.useRef<HTMLElement | null>(null);
	const [state, setState] = React.useState<SelectionIndicatorState>({
		...EMPTY,
		visible: false,
		animated: false,
	});
	const [reduced, setReduced] = React.useState(prefersReducedMotion);

	React.useEffect(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => setReduced(media.matches);
		onChange();
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, []);

	const sync = React.useCallback(() => {
		const root = rootRef.current;
		if (!root || !enabled) {
			setState((current) => ({ ...current, ...EMPTY, visible: false, animated: false }));
			return;
		}
		const item = root.querySelector<HTMLElement>(itemSelector);
		if (!item) {
			setState((current) => ({ ...current, width: 0, height: 0, visible: false, animated: false }));
			return;
		}
		const geometry = mapGeometry(item, root);
		setState((current) => ({
			...geometry,
			visible: true,
			animated: current.visible && !reduced,
		}));
	}, [enabled, itemSelector, mapGeometry, reduced]);

	React.useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root || !enabled) {
			return;
		}
		let frame = 0;
		const ro = new ResizeObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(sync);
		});
		const observe = () => {
			ro.disconnect();
			for (const node of selectionTargets(root)) {
				ro.observe(node);
			}
		};
		observe();
		sync();
		const mo = new MutationObserver(() => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				observe();
				sync();
			});
		});
		mo.observe(root, {
			attributes: true,
			subtree: true,
			childList: true,
			characterData: true,
			attributeFilter: ["data-state"],
		});
		return () => {
			cancelAnimationFrame(frame);
			mo.disconnect();
			ro.disconnect();
		};
	}, [enabled, sync]);

	const bindRef = React.useCallback(<T extends HTMLElement>(external?: React.Ref<T | null>) => {
		return (node: T | null) => {
			rootRef.current = node;
			assignRef(external, node);
		};
	}, []);

	return {
		bindRef,
		state,
		motionClassName: state.animated && !reduced ? SELECTION_INDICATOR_MOTION_CLASS : undefined,
	};
}
