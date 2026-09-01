import { Eye, EyeOff } from "lucide-react";
import * as React from "react";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { Input } from "./input";

export interface SensitiveInputProps extends Omit<React.ComponentProps<"input">, "type" | "size"> {
	/**
	 * Accessible label for the reveal action.
	 */
	revealLabel: string;
	/**
	 * Accessible label for the hide action.
	 */
	hideLabel: string;
}

export const SensitiveInput = React.forwardRef<HTMLInputElement, SensitiveInputProps>(
	({ className, revealLabel, hideLabel, disabled, ...props }, ref) => {
		const [revealed, setRevealed] = React.useState(false);
		return (
			<div className="relative">
				<Input
					ref={ref}
					type={revealed ? "text" : "password"}
					className={cn("pr-10", className)}
					disabled={disabled}
					{...props}
				/>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="absolute right-0 top-0 h-9 w-9"
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
