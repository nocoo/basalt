import { type ComponentType, createContext, type ReactNode, useContext } from "react";

export type LinkComponent = ComponentType<{
	href: string;
	className?: string;
	children?: ReactNode;
}>;

export interface LinkProviderProps {
	/**
	 * Custom link renderer component injected into Basalt Link.
	 * When omitted (undefined), Basalt Link internally falls back to a standard HTML "a" element.
	 * Note: this prop only accepts a custom React component (ComponentType<{ href: string; className?: string; children?: ReactNode }>); string literals like "a" are not accepted.
	 * useLinkComponent() returns the custom LinkComponent or "a" when no custom renderer is configured, and safely returns "a" even without LinkProvider without throwing.
	 * Component renders a React context provider without native HTML rest attribute forwarding or forwarded ref.
	 */
	render?: LinkComponent;
	/**
	 * Application components wrapped by the link routing context.
	 */
	children: ReactNode;
}

const LinkContext = createContext<LinkComponent | "a">("a");

export function LinkProvider({ render, children }: LinkProviderProps) {
	return <LinkContext.Provider value={render ?? "a"}>{children}</LinkContext.Provider>;
}

export function useLinkComponent() {
	return useContext(LinkContext);
}
