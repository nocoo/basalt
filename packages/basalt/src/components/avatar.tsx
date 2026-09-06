import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { cn } from "../utils/cn";

export type AvatarProps = Omit<
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
	"asChild"
> & {
	/**
	 * Change the default rendered element for the one passed as a child, merging their props and behavior.
	 * @default false
	 */
	asChild?: boolean;
};

export const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, AvatarProps>(
	({ className, ...props }, ref) => (
		<AvatarPrimitive.Root
			ref={ref}
			className={cn("relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full", className)}
			{...props}
		/>
	),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

export type AvatarImageProps = Omit<
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>,
	"asChild" | "onLoadingStatusChange" | "src" | "alt"
> & {
	/**
	 * Change the default rendered element for the one passed as a child, merging their props and behavior.
	 * @default false
	 */
	asChild?: boolean;
	/**
	 * Image source URL for the avatar image.
	 */
	src?: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>["src"];
	/**
	 * Text description of the image for accessibility and screen readers.
	 */
	alt?: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>["alt"];
	/**
	 * A callback providing the current loading status of the image ('idle' | 'loading' | 'loaded' | 'error').
	 */
	onLoadingStatusChange?: React.ComponentPropsWithoutRef<
		typeof AvatarPrimitive.Image
	>["onLoadingStatusChange"];
};

export const AvatarImage = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Image>,
	AvatarImageProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Image
		ref={ref}
		className={cn("aspect-square h-full w-full", className)}
		{...props}
	/>
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export type AvatarFallbackProps = Omit<
	React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>,
	"asChild" | "delayMs"
> & {
	/**
	 * Change the default rendered element for the one passed as a child, merging their props and behavior.
	 * @default false
	 */
	asChild?: boolean;
	/**
	 * Useful for delaying rendering so it only appears for those with slower connections.
	 * Unset by default, rendering immediately without delay.
	 */
	delayMs?: number;
};

export const AvatarFallback = React.forwardRef<
	React.ElementRef<typeof AvatarPrimitive.Fallback>,
	AvatarFallbackProps
>(({ className, ...props }, ref) => (
	<AvatarPrimitive.Fallback
		ref={ref}
		className={cn(
			"flex h-full w-full items-center justify-center rounded-full bg-basalt-muted text-xs",
			className,
		)}
		{...props}
	/>
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
