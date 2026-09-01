import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { Input, type InputSize } from "./input";

const TOGGLE_SIZE_CLASS: Record<InputSize, string> = {
	sm: "h-8 w-8",
	default: "h-9 w-9",
	lg: "h-10 w-10",
};

export type SensitiveInputProps = Omit<React.ComponentProps<"input">, "type" | "size"> & {
	/**
	 * Accessible label for the reveal action.
	 */
	revealLabel: string;
	/**
	 * Accessible label for the hide action.
	 */
	hideLabel: string;
	/**
	 * The visual size of the field.
	 * @default default
	 */
	size?: InputSize;
	/**
	 * Ignore password managers on this field.
	 * @default false
	 */
	passwordManagerIgnore?: boolean;
};

export const SensitiveInput = React.forwardRef<HTMLInputElement, SensitiveInputProps>(
	(
		{
			className,
			revealLabel,
			hideLabel,
			disabled,
			size = "default",
			passwordManagerIgnore = false,
			...props
		},
		ref,
	) => {
		const [revealed, setRevealed] = React.useState(false);
		return (
			<div className="relative">
				<Input
					ref={ref}
					type={revealed ? "text" : "password"}
					size={size}
					passwordManagerIgnore={passwordManagerIgnore}
					className={cn("pr-10", className)}
					disabled={disabled}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					className={cn("absolute right-0 top-0", TOGGLE_SIZE_CLASS[size])}
					aria-label={revealed ? hideLabel : revealLabel}
					disabled={disabled}
					onClick={() => setRevealed((value) => !value)}
				>
					{revealed ? (
						<EyeOff className="h-4 w-4" aria-hidden="true" />
					) : (
						<Eye className="h-4 w-4" aria-hidden="true" />
					)}
				</Button>
			</div>
		);
	},
);
SensitiveInput.displayName = "SensitiveInput";
