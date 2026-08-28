import type { InputHTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function DatePicker({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			type="date"
			className={cn(
				"flex h-9 rounded-basalt-md border border-basalt-border bg-basalt-secondary px-3 text-sm",
				className,
			)}
			{...props}
		/>
	);
}
