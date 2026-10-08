import { type Ref, useCallback } from "react";
import { assignRef } from "./selection-indicator";

const ROW = "[data-basalt-hover-item]";
const ACTIVE =
	'[data-highlighted], [data-hover-active="true"], [aria-selected="true"], [data-state="checked"], [data-hover-selected="true"], [data-selected="true"]';

export function useHoverHighlight(ref?: Ref<HTMLElement | null>) {
	return useCallback(
		(root: HTMLElement | null) => {
			assignRef(ref, root);
			if (!root) return;
			let hovered: HTMLElement | null = null;
			let focused: HTMLElement | null = null;
			let previous: HTMLElement | null = null;
			let selected: HTMLElement | null = null;
			let active: HTMLElement | null = null;
			let selectionDirty = true;
			let frame = 0;
			let geometry = "";
			let layoutChanged = true;
			const eligible = (node: HTMLElement | null) =>
				node &&
				root.contains(node) &&
				node.matches(ROW) &&
				node.closest(".basalt-hover-list") === root &&
				!node.closest(
					'[hidden], [disabled], [aria-disabled="true"], [data-disabled=""], [data-disabled="true"]',
				)
					? node
					: null;
			const row = (target: EventTarget | null) =>
				eligible(target instanceof Element ? target.closest<HTMLElement>(ROW) : null);
			const resize = new ResizeObserver(() => {
				layoutChanged = true;
				schedule();
			});
			const update = () => {
				frame = 0;
				if (selectionDirty) {
					active = null;
					selected = null;
					for (const node of root.querySelectorAll<HTMLElement>(`${ROW}:is(${ACTIVE})`)) {
						if (!eligible(node)) continue;
						if (!selected) selected = node;
						if (node.matches('[data-highlighted], [data-hover-active="true"]')) {
							active = node;
							break;
						}
					}
					selectionDirty = false;
				}
				const item =
					eligible(active) ?? eligible(hovered) ?? eligible(focused) ?? eligible(selected);
				if (item === previous && !layoutChanged) return;
				if (item !== previous) {
					if (previous) resize.unobserve(previous);
					if (item) resize.observe(item);
				}
				const width = item?.offsetWidth ?? 0;
				const height = item?.offsetHeight ?? 0;
				if (!item || !width || !height) {
					root.dataset.hoverVisible = "false";
					previous = null;
					geometry = "";
					layoutChanged = false;
					return;
				}
				let x = 0,
					y = 0;
				for (
					let node: HTMLElement | null = item;
					node && node !== root;
					node = node.offsetParent as HTMLElement | null
				) {
					x += node.offsetLeft;
					y += node.offsetTop;
				}
				for (let node = item.parentElement; node && node !== root; node = node.parentElement) {
					x -= node.scrollLeft;
					y -= node.scrollTop;
				}
				const next = `${x},${y},${width},${height}`;
				if (next !== geometry) {
					root.dataset.hoverAnimated =
						previous && previous !== item && !layoutChanged ? "true" : "false";
					root.style.setProperty("--basalt-hover-x", `${x}px`);
					root.style.setProperty("--basalt-hover-y", `${y}px`);
					root.style.setProperty("--basalt-hover-width", `${width}px`);
					root.style.setProperty("--basalt-hover-height", `${height}px`);
					geometry = next;
				}
				root.dataset.hoverVisible = "true";
				previous = item;
				layoutChanged = false;
			};
			function schedule() {
				if (!frame) frame = requestAnimationFrame(update);
			}
			const over = (event: PointerEvent) => {
				if (event.pointerType === "touch") return;
				const next = row(event.target);
				if (next !== hovered) {
					hovered = next;
					schedule();
				}
			};
			const leave = () => {
				hovered = null;
				schedule();
			};
			const focus = (event: FocusEvent) => {
				focused = row(event.target);
				hovered = null;
				schedule();
			};
			const blur = (event: FocusEvent) => {
				focused = row(event.relatedTarget);
				schedule();
			};
			const keyboard = (event: KeyboardEvent) => {
				if (
					!(event.target instanceof Element) ||
					(!root.contains(event.target) &&
						(!root.id || event.target.getAttribute("aria-controls") !== root.id))
				)
					return;
				hovered = null;
				schedule();
			};
			const layout = (event: Event) => {
				// Our pseudo-element transition cannot change row geometry.
				if (event.target === root && event.type !== "scroll") return;
				layoutChanged = true;
				schedule();
			};
			const mutations = new MutationObserver((records) => {
				selectionDirty = true;
				if (
					records.some((record) => record.type === "childList" || record.attributeName === "hidden")
				)
					layoutChanged = true;
				schedule();
			});
			mutations.observe(root, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: [
					"data-basalt-hover-item",
					"data-highlighted",
					"data-state",
					"aria-selected",
					"data-selected",
					"data-hover-active",
					"data-hover-selected",
					"disabled",
					"aria-disabled",
					"data-disabled",
					"hidden",
				],
			});
			resize.observe(root);
			root.addEventListener("pointerover", over);
			root.addEventListener("pointerleave", leave);
			root.addEventListener("focusin", focus);
			root.addEventListener("focusout", blur);
			root.ownerDocument.addEventListener("keydown", keyboard);
			root.addEventListener("scroll", layout, true);
			root.addEventListener("animationend", layout);
			root.addEventListener("transitionend", layout);
			schedule();
			return () => {
				cancelAnimationFrame(frame);
				resize.disconnect();
				mutations.disconnect();
				root.removeEventListener("pointerover", over);
				root.removeEventListener("pointerleave", leave);
				root.removeEventListener("focusin", focus);
				root.removeEventListener("focusout", blur);
				root.ownerDocument.removeEventListener("keydown", keyboard);
				root.removeEventListener("scroll", layout, true);
				root.removeEventListener("animationend", layout);
				root.removeEventListener("transitionend", layout);
				assignRef(ref, null);
			};
		},
		[ref],
	);
}
