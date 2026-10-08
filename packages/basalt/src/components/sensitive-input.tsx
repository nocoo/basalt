import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { controlSurfaceClass } from "../utils/control-surface";
import { Button } from "./button";
import { Input, type InputSize } from "./input";

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
			<div
				className={controlSurfaceClass(
					"flex focus-within:border-basalt-ring has-[input[aria-invalid=true]]:border-basalt-destructive",
				)}
			>
				<Input
					ref={ref}
					type={revealed ? "text" : "password"}
					size={size}
					passwordManagerIgnore={passwordManagerIgnore}
					className={cn("min-w-0 flex-1 border-0 bg-transparent shadow-none", className)}
					disabled={disabled}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size={size === "default" ? "icon" : size}
					className="basalt-action-icon basalt-action-inset shrink-0"
					aria-label={revealed ? hideLabel : revealLabel}
					disabled={disabled}
					onClick={() => setRevealed((value) => !value)}
				>
					{revealed ? (
						<EyeOff className="h-basalt-4 w-basalt-4" aria-hidden="true" />
					) : (
						<Eye className="h-basalt-4 w-basalt-4" aria-hidden="true" />
					)}
				</Button>
			</div>
		);
	},
);
SensitiveInput.displayName = "SensitiveInput";
