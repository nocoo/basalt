import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { Button, type ButtonProps } from "./button";
import { Input } from "./input";

export type InputGroupProps = React.HTMLAttributes<HTMLDivElement> & {
	/**
	 * Disable the input and nested actions.
	 * @default false
	 */
	disabled?: boolean;
};

const InputGroupDisabled = React.createContext(false);

const InputGroupRoot = React.forwardRef<HTMLDivElement, InputGroupProps>(
	({ className, disabled, onClick, children, ...props }, ref) => (
		<InputGroupDisabled.Provider value={Boolean(disabled)}>
			<div
				ref={ref}
				data-slot="input-group"
				data-disabled={disabled ? "" : undefined}
				aria-disabled={disabled || undefined}
				inert={disabled || undefined}
				className={controlSurfaceClass(
					cn(
						"flex h-9 w-full items-center shadow-xs",
						"[&>:first-child]:rounded-l-basalt-md [&>:last-child]:rounded-r-basalt-md",
						"outline-hidden focus-within:border-basalt-ring",
						"has-[[data-slot=input-group-addon-start]]:[&_input]:pl-2",
						"has-[[data-slot=input-group-addon-end]]:[&_input]:pr-2",
						"has-[[data-slot=input-group-suffix]]:[&_input]:flex-none",
						"has-[[data-slot=input-group-suffix]]:[&_input]:[field-sizing:content]",
						"has-[[data-slot=input-group-suffix]]:[&_input]:pr-0",
						"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
						className,
					),
				)}
				onClick={(event) => {
					onClick?.(event);
					if (event.defaultPrevented || disabled) {
						return;
					}
					const target = event.target as HTMLElement;
					if (target.closest("input, textarea, button, a")) {
						return;
					}
					event.currentTarget.querySelector("input")?.focus();
				}}
				{...props}
			>
				{children}
			</div>
		</InputGroupDisabled.Provider>
	),
);
InputGroupRoot.displayName = "InputGroup";

export type InputGroupInputProps = Omit<
	React.ComponentPropsWithoutRef<typeof Input>,
	"type" | "size" | "passwordManagerIgnore"
> & {
	/**
	 * The type of input control to render.
	 */
	type?: React.HTMLInputTypeAttribute;
};

const InputGroupInput = React.forwardRef<HTMLInputElement, InputGroupInputProps>(
	({ className, disabled, ...props }, ref) => {
		const groupDisabled = React.useContext(InputGroupDisabled);
		return (
			<Input
				ref={ref}
				disabled={disabled || groupDisabled}
				className={cn(
					"h-full min-w-0 w-auto! flex-1 rounded-none border-0 bg-transparent px-3 py-0 shadow-none",
					"outline-hidden focus-visible:border-transparent focus-visible:ring-0",
					className,
				)}
				{...props}
			/>
		);
	},
);
InputGroupInput.displayName = "InputGroup.Input";

export type InputGroupAddonProps = React.HTMLAttributes<HTMLDivElement> & {
	/**
	 * Place the addon at the start or end of the group.
	 * @default start
	 */
	align?: "start" | "end";
};

function InputGroupAddon({ align = "start", className, children, ...props }: InputGroupAddonProps) {
	return (
		<div
			data-slot={align === "end" ? "input-group-addon-end" : "input-group-addon-start"}
			className={cn(
				"pointer-events-none flex shrink-0 items-center text-basalt-muted-foreground *:pointer-events-auto [&_svg]:size-4",
				align === "start" ? "-order-1 pl-3" : "order-1 pr-3",
				className,
			)}
			{...props}
		>
			{children}
		</div>
	);
}
InputGroupAddon.displayName = "InputGroup.Addon";

export type InputGroupSuffixProps = React.HTMLAttributes<HTMLDivElement>;

function InputGroupSuffix({ className, children, ...props }: InputGroupSuffixProps) {
	return (
		<div
			data-slot="input-group-suffix"
			className={cn(
				"pointer-events-none flex min-w-0 flex-1 items-center pr-3 text-basalt-muted-foreground select-none",
				className,
			)}
			{...props}
		>
			<span className="truncate">{children}</span>
		</div>
	);
}
InputGroupSuffix.displayName = "InputGroup.Suffix";

export interface InputGroupButtonProps
	extends Omit<ButtonProps, "variant" | "size" | "asChild" | "loading" | "icon"> {
	/**
	 * Visual style for the nested action.
	 * @default ghost
	 */
	variant?: ButtonProps["variant"];
	/**
	 * Size for the nested action.
	 * @default icon
	 */
	size?: ButtonProps["size"];
	/**
	 * Render the nested action through its child element.
	 * @default false
	 */
	asChild?: boolean;
	/**
	 * Show a spinner and disable the nested action.
	 * @default false
	 */
	loading?: boolean;
	/**
	 * Icon rendered before the nested action label.
	 */
	icon?: React.ReactNode;
}

const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
	({ className, variant = "ghost", size = "icon", disabled, ...props }, ref) => {
		const groupDisabled = React.useContext(InputGroupDisabled);
		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				disabled={disabled || groupDisabled}
				className={cn("h-7 w-7 shrink-0 rounded-basalt-sm", className)}
				{...props}
			/>
		);
	},
);
InputGroupButton.displayName = "InputGroup.Button";

export const InputGroup = Object.assign(InputGroupRoot, {
	Input: InputGroupInput,
	Addon: InputGroupAddon,
	Suffix: InputGroupSuffix,
	Button: InputGroupButton,
});
