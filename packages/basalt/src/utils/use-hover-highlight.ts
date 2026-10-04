import { type Ref, useCallback } from "react";
import { assignRef } from "./selection-indicator";

const ROW = "[data-basalt-hover-item]";
const ACTIVE =
	'[data-highlighted], [data-hover-active="true"], [aria-selected="true"], [data-state="checked"], [data-hover-selected="true"]';

export function useHoverHighlight(ref?: Ref<HTMLElement | null>) {
	return useCallback(
		(root: HTMLElement | null) => {
			assignRef(ref, root);
			if (!root) return;
			let hovered: HTMLElement | null = null;
			let focused: HTMLElement | null = null;
			let previous: HTMLElement | null = null;
			let frame = 0;
			let geometry = "";
			const eligible = (node: HTMLElement | null) =>
				node &&
				root.contains(node) &&
				!node.closest('[hidden], [disabled], [aria-disabled="true"], [data-disabled]')
					? node
					: null;
			const row = (target: EventTarget | null) =>
				eligible(target instanceof Element ? target.closest<HTMLElement>(ROW) : null);
			const resize = new ResizeObserver(() => schedule());
			const update = () => {
				frame = 0;
				const active = root.querySelector<HTMLElement>(
					`${ROW}:is([data-highlighted], [data-hover-active="true"])`,
				);
				const selected = root.querySelector<HTMLElement>(`${ROW}:is(${ACTIVE})`);
				const item =
					eligible(active) ?? eligible(hovered) ?? eligible(focused) ?? eligible(selected);
				if (item !== previous) {
					if (previous) resize.unobserve(previous);
					if (item) resize.observe(item);
				}
				if (!item) {
					root.dataset.hoverVisible = "false";
					previous = null;
					geometry = "";
					return;
				}
				let x = 0;
				let y = 0;
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
				const next = `${x},${y},${item.offsetWidth},${item.offsetHeight}`;
				if (next !== geometry) {
					root.dataset.hoverAnimated = previous ? "true" : "false";
					root.style.setProperty("--basalt-hover-x", `${x}px`);
					root.style.setProperty("--basalt-hover-y", `${y}px`);
					root.style.setProperty("--basalt-hover-width", `${item.offsetWidth}px`);
					root.style.setProperty("--basalt-hover-height", `${item.offsetHeight}px`);
					geometry = next;
				}
				root.dataset.hoverVisible = "true";
				previous = item;
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
				const target = event.target;
				if (
					!(target instanceof Element) ||
					(!root.contains(target) && (!root.id || target.getAttribute("aria-controls") !== root.id))
				)
					return;
				hovered = null;
				schedule();
			};
			const mutations = new MutationObserver(() => schedule());
			mutations.observe(root, {
				subtree: true,
				childList: true,
				attributes: true,
				attributeFilter: [
					"data-highlighted",
					"data-state",
					"aria-selected",
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
			root.addEventListener("scroll", schedule, true);
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
				root.removeEventListener("scroll", schedule, true);
				assignRef(ref, null);
			};
		},
		[ref],
	);
}
