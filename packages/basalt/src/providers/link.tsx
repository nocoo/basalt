import { type ComponentType, createContext, type ReactNode, useContext } from "react";

type LinkComponent = ComponentType<{ href: string; className?: string; children?: ReactNode }>;

const LinkContext = createContext<LinkComponent | "a">("a");

export function LinkProvider({
	render,
	children,
}: {
	render?: LinkComponent;
	children: ReactNode;
}) {
	return <LinkContext.Provider value={render ?? "a"}>{children}</LinkContext.Provider>;
}

export function useLinkComponent() {
	return useContext(LinkContext);
}
