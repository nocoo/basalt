import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
	extend: {
		theme: {
			spacing: [(value: string) => value.startsWith("basalt-")],
			radius: [(value: string) => value.startsWith("basalt-")],
			text: [
				"basalt-xs",
				"basalt-sm",
				"basalt-code",
				"basalt-base",
				"basalt-lg",
				"basalt-xl",
				"basalt-2xl",
				"basalt-3xl",
				"basalt-4xl",
				"basalt-5xl",
				"basalt-6xl",
				"basalt-7xl",
				"basalt-8xl",
				"basalt-9xl",
				"basalt-10xl",
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
