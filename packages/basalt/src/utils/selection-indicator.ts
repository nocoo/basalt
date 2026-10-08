import * as React from "react";

export const SELECTION_INDICATOR_MOTION_CLASS = "basalt-selection-motion";

export type SelectionGeometry = { left: number; width: number; top: number; height: number };
export type SelectionIndicatorState = SelectionGeometry & { visible: boolean; animated: boolean };
const EMPTY: SelectionGeometry = { left: 0, width: 0, top: 0, height: 0 };

export function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
	if (typeof ref === "function") ref(value);
	else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

export function measureSelectionItem(item: HTMLElement): SelectionGeometry {
	return {
		left: item.offsetLeft,
		width: item.offsetWidth,
		top: item.offsetTop,
		height: item.offsetHeight,
	};
}

export function useSelectionIndicator({
	itemSelector,
	enabled = true,
	mapGeometry,
	ref,
}: {
	itemSelector: string;
	enabled?: boolean;
	mapGeometry?: (item: HTMLElement, root: HTMLElement) => SelectionGeometry;
	ref?: React.Ref<HTMLElement | null>;
}) {
	const rootRef = React.useRef<HTMLElement | null>(null);
	const composedRef = React.useCallback(
		(node: HTMLElement | null) => {
			rootRef.current = node;
			assignRef(ref, node);
		},
		[ref],
	);
	const [state, setState] = React.useState<SelectionIndicatorState>({
		...EMPTY,
		visible: false,
		animated: false,
	});
	React.useLayoutEffect(() => {
		const root = rootRef.current;
		if (!root || !enabled) {
			setState({ ...EMPTY, visible: false, animated: false });
			return;
		}
		let previous: HTMLElement | null = null;
		let frame = 0;
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		const sync = () => {
			frame = 0;
			const item = root.querySelector<HTMLElement>(itemSelector);
			const box = item ? (mapGeometry ?? measureSelectionItem)(item, root) : EMPTY;
			// Hidden panels measure zero. They must never become the animation's origin.
			const visible = !!item && item.offsetWidth > 0 && item.offsetHeight > 0;
			const animated = visible && !!previous && previous !== item && !media.matches;
			previous = visible ? item : null;
			const next = { ...box, visible, animated };
			setState((current) => {
				const unchanged =
					current.visible === visible &&
					current.left === box.left &&
					current.top === box.top &&
					current.width === box.width &&
					current.height === box.height;
				// Initial ResizeObserver delivery must not cancel an in-flight selection.
				return unchanged && !(media.matches && current.animated) ? current : next;
			});
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(sync);
		};
		const resize = new ResizeObserver(schedule);
		const observe = () => {
			resize.disconnect();
			resize.observe(root);
			for (const child of root.children)
				if (child instanceof HTMLElement && child.getAttribute("aria-hidden") !== "true")
					resize.observe(child);
		};
		const mutations = new MutationObserver((records) => {
			if (records.some((record) => record.type === "childList")) observe();
			schedule();
		});
		observe();
		sync();
		mutations.observe(root, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: [
				"data-state",
				"aria-checked",
				"aria-current",
				"data-selected",
				"data-disabled",
				"hidden",
			],
		});
		media.addEventListener("change", schedule);
		return () => {
			cancelAnimationFrame(frame);
			resize.disconnect();
			mutations.disconnect();
			media.removeEventListener("change", schedule);
		};
	}, [enabled, itemSelector, mapGeometry]);
	return {
		ref: composedRef,
		state,
		motionClassName: state.animated ? SELECTION_INDICATOR_MOTION_CLASS : undefined,
	};
}
