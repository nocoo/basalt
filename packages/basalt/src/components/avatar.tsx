import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";
import { avatarColorIndex, avatarInitials } from "../models/avatar";
import { cn } from "../utils/cn";
import { TAG_COLORS } from "./tag-badge";

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
			className={cn(
				"relative flex h-basalt-9 w-basalt-9 shrink-0 overflow-hidden rounded-full",
				className,
			)}
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

const AVATAR_TONES = [
	TAG_COLORS.blue.className,
	TAG_COLORS.amber.className,
	TAG_COLORS.rose.className,
	TAG_COLORS.teal.className,
	TAG_COLORS.violet.className,
	TAG_COLORS.success.className,
] as const;

export interface AvatarInitialsProps {
	/** Person or organization name; initials are derived from its first two words. */
	name: string;
	/** Stable color identity, independent of display name changes. */
	colorKey?: string;
	/** Two-letter override for application-specific abbreviations. */
	initials?: string;
	/** Avatar diameter. @default "default" */
	size?: "sm" | "default";
	className?: string;
}

export function AvatarInitials({
	name,
	colorKey,
	initials,
	size = "default",
	className,
}: AvatarInitialsProps) {
	return (
		<Avatar
			role="img"
			aria-label={name}
			className={cn(size === "sm" && "size-basalt-6", className)}
		>
			<AvatarFallback
				className={cn(
					"font-medium",
					size === "sm" ? "text-[11px]" : "text-xs",
					AVATAR_TONES[avatarColorIndex(colorKey ?? name)],
				)}
			>
				{initials?.trim()
					? Array.from(initials.trim().toLocaleUpperCase("en-US")).slice(0, 2).join("")
					: avatarInitials(name)}
			</AvatarFallback>
		</Avatar>
	);
}
