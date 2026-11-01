import { type ReactNode, use } from "react";
import { loadI18n } from "@/i18n/load";

/** Suspends until i18next is initialized; place inside the route's Suspense boundary. */
export function I18nReady({ children }: { children: ReactNode }) {
	use(loadI18n());
	return children;
}
