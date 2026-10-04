import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
	extend: { theme: { spacing: [(value: string) => value.startsWith("basalt-")] } },
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
