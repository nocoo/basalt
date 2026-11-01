import type { ComponentProps } from "react";

/**
 * Width descriptors let the browser pick the smallest mark for the rendered size: header marks
 * (24-32px) use the 64/96px WebP, large marks such as the sign-in page pass their own `sizes`.
 */
export function BasaltLogo({ sizes = "2rem", ...props }: ComponentProps<"img">) {
	return (
		<img
			src="/logo-128.png"
			srcSet="/logo-64.webp 64w, /logo-96.webp 96w, /logo-128.png 128w, /logo-256.png 256w"
			sizes={sizes}
			width={24}
			height={24}
			alt="Basalt"
			{...props}
		/>
	);
}
