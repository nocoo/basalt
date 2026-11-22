import * as React from "react";
import { cn } from "./cn";

export const CHOICE_GROUP_FIELDSET_CLASS = "basalt-ui flex flex-col gap-basalt-field-gap";
export const CHOICE_LEGEND_CLASS =
	"mb-basalt-field-gap text-basalt-base font-medium leading-[var(--basalt-line-body)] text-basalt-foreground";
export const CHOICE_ITEM_LABEL_CLASS =
	"flex cursor-pointer items-center gap-basalt-space-lg text-basalt-base text-basalt-foreground has-[:disabled]:cursor-not-allowed";

export const ChoiceGroupFieldset = React.forwardRef<
	HTMLFieldSetElement,
	React.FieldsetHTMLAttributes<HTMLFieldSetElement>
>(function ChoiceGroupFieldset({ className, ...props }, ref) {
	return <fieldset ref={ref} className={cn(CHOICE_GROUP_FIELDSET_CLASS, className)} {...props} />;
});

export const ChoiceGroupLegend = React.forwardRef<
	HTMLLegendElement,
	React.HTMLAttributes<HTMLLegendElement>
>(function ChoiceGroupLegend({ className, ...props }, ref) {
	return <legend ref={ref} className={cn(CHOICE_LEGEND_CLASS, className)} {...props} />;
});

export function ChoiceGroupError({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<p id={id} className="text-basalt-sm text-basalt-danger-solid" role="alert">
			{children}
		</p>
	);
}

export function ChoiceItemLabel({
	htmlFor,
	control,
	children,
}: {
	htmlFor: string;
	control: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<label htmlFor={htmlFor} className={CHOICE_ITEM_LABEL_CLASS}>
			{control}
			<span className="peer-disabled:opacity-50">{children}</span>
		</label>
	);
}
