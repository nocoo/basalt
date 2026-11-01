import { lazy, Suspense, useState } from "react";
import { useLocation } from "react-router";

const Toaster = lazy(() =>
	import("@nocoo/basalt/components/toast").then((module) => ({ default: module.Toaster })),
);

/**
 * The landing page never raises toasts, so sonner loads with the first application route and then
 * stays mounted for the rest of the session.
 */
export function DeferredToaster() {
	const { pathname } = useLocation();
	const [mounted, setMounted] = useState(pathname !== "/");
	if (!mounted && pathname !== "/") setMounted(true);
	return mounted ? (
		<Suspense fallback={null}>
			<Toaster />
		</Suspense>
	) : null;
}
