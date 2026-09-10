import * as React from "react";

export function useCheckableGroup({
	value,
	defaultValue,
	onValueChange,
	error,
	describedBy,
	ariaInvalid,
	form,
	ref,
}: {
	value?: string[];
	defaultValue?: string[];
	onValueChange?: (value: string[]) => void;
	error?: React.ReactNode;
	describedBy?: string;
	ariaInvalid?: React.AriaAttributes["aria-invalid"];
	form?: string;
	ref: React.ForwardedRef<HTMLFieldSetElement>;
}) {
	const generatedId = React.useId();
	const nodeRef = React.useRef<HTMLFieldSetElement | null>(null);
	const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? []);
	const current = value ?? uncontrolled;
	const invalid = Boolean(error);
	const errorId = `${generatedId}-error`;
	const mergedDescribedBy =
		[invalid ? errorId : null, describedBy].filter(Boolean).join(" ") || undefined;
	const resetEventRef = React.useRef<Event | null>(null);
	const setValue = React.useCallback(
		(next: string[]) => {
			const activeReset = resetEventRef.current;
			if (activeReset && activeReset.eventPhase !== Event.NONE) {
				return;
			}
			if (value === undefined) {
				setUncontrolled(next);
			}
			onValueChange?.(next);
		},
		[onValueChange, value],
	);
	const setRefs = React.useCallback(
		(node: HTMLFieldSetElement | null) => {
			nodeRef.current = node;
			if (!ref) {
				return;
			}
			if (typeof ref === "function") {
				const cleanup = (ref as React.RefCallback<HTMLFieldSetElement>)(node);
				if (typeof cleanup === "function") {
					return () => {
						nodeRef.current = null;
						cleanup();
					};
				}
				return () => {
					nodeRef.current = null;
					ref(null);
				};
			}
			(ref as React.RefObject<HTMLFieldSetElement | null>).current = node;
			return () => {
				nodeRef.current = null;
				(ref as React.RefObject<HTMLFieldSetElement | null>).current = null;
			};
		},
		[ref],
	);
	const latestConfigRef = React.useRef({
		defaultValue,
		value,
	});
	React.useEffect(() => {
		latestConfigRef.current = {
			defaultValue,
			value,
		};
	});

	React.useEffect(() => {
		const formEl = nodeRef.current?.form;
		if (!formEl || (form && formEl.id !== form)) {
			return;
		}
		let disposed = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const onReset = (event: Event) => {
			resetEventRef.current = event;
			const timer = setTimeout(() => {
				timers.delete(timer);
				if (disposed || event.defaultPrevented) {
					return;
				}
				const cfg = latestConfigRef.current;
				if (cfg.value === undefined) {
					setUncontrolled(cfg.defaultValue ?? []);
				}
			}, 0);
			timers.add(timer);
		};
		formEl.addEventListener("reset", onReset, true);
		return () => {
			disposed = true;
			resetEventRef.current = null;
			for (const timer of timers) {
				clearTimeout(timer);
			}
			timers.clear();
			formEl.removeEventListener("reset", onReset, true);
		};
	}, [form]);

	return {
		current,
		setValue,
		invalid,
		errorId,
		mergedDescribedBy,
		setRefs,
		ariaInvalid: invalid ? true : ariaInvalid,
	};
}
