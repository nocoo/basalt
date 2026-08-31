import { Toaster } from "@nocoo/basalt/components/toast";
import { TooltipProvider } from "@nocoo/basalt/components/tooltip";
import { LinkProvider } from "@nocoo/basalt/providers/link";
import { ThemeProvider } from "@nocoo/basalt/providers/theme";
import { type ComponentType, lazy, type ReactNode, Suspense } from "react";
import { BrowserRouter, Route, Link as RouterLink, Routes } from "react-router";
import { DashboardLayout } from "@/components/DashboardLayout";

const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const BadgeLoginPage = lazy(() => import("./pages/BadgeLoginPage"));
const BankingDashboardPage = lazy(() => import("./pages/BankingDashboardPage"));
const ComponentsPage = lazy(() => import("./pages/ComponentsPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DataPage = lazy(() => import("./pages/DataPage"));
const FlowComparisonPage = lazy(() => import("./pages/FlowComparisonPage"));
const FormsPage = lazy(() => import("./pages/FormsPage"));
const HealthPage = lazy(() => import("./pages/HealthPage"));
const InteractionShowcasePage = lazy(() => import("./pages/InteractionShowcasePage"));
const InteractivePage = lazy(() => import("./pages/InteractivePage"));
const LayoutPage = lazy(() => import("./pages/LayoutPage"));
const LoadingPage = lazy(() => import("./pages/LoadingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const NavigationPage = lazy(() => import("./pages/NavigationPage"));
const NetworkOpsDashboardPage = lazy(() => import("./pages/NetworkOpsDashboardPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PalettePage = lazy(() => import("./pages/PalettePage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const ProgressTrackingPage = lazy(() => import("./pages/ProgressTrackingPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const StaticPage = lazy(() => import("./pages/StaticPage"));
const UiIndexPage = lazy(() => import("./pages/ui/UiIndexPage"));
const UiPlaceholderPage = lazy(() => import("./pages/ui/UiPlaceholderPage"));
const WearableDashboardPage = lazy(() => import("./pages/WearableDashboardPage"));

function AppLink({
	href,
	className,
	children,
	...props
}: {
	href: string;
	className?: string;
	children?: ReactNode;
} & Record<string, unknown>) {
	if (/^(https?:|mailto:|tel:)/.test(href)) {
		return (
			<a href={href} className={className} {...props}>
				{children}
			</a>
		);
	}
	return (
		<RouterLink to={href} className={className} {...props}>
			{children}
		</RouterLink>
	);
}

function RouteLoadingFallback() {
	return (
		<div
			role="status"
			aria-live="polite"
			className="flex min-h-48 w-full max-w-full items-center justify-center overflow-hidden p-6 text-sm text-basalt-muted-foreground"
		>
			Loading page…
		</div>
	);
}

function routeElement(Page: ComponentType) {
	return (
		<Suspense fallback={<RouteLoadingFallback />}>
			<Page />
		</Suspense>
	);
}

const App = () => (
	<ThemeProvider>
		<BrowserRouter>
			<LinkProvider render={AppLink}>
				<TooltipProvider>
					<Toaster />
					<Routes>
						{/* Layout route: sidebar + header wraps all dashboard pages */}
						<Route element={<DashboardLayout />}>
							<Route path="/components" element={routeElement(ComponentsPage)} />
							<Route path="/forms" element={routeElement(FormsPage)} />
							<Route path="/navigation" element={routeElement(NavigationPage)} />
							<Route path="/interactive" element={routeElement(InteractivePage)} />
							<Route path="/data" element={routeElement(DataPage)} />
							<Route path="/" element={routeElement(DashboardPage)} />
							<Route path="/accounts" element={routeElement(AccountsPage)} />
							<Route path="/progress-tracking" element={routeElement(ProgressTrackingPage)} />
							<Route path="/flow-comparison" element={routeElement(FlowComparisonPage)} />
							<Route path="/portfolio" element={routeElement(PortfolioPage)} />
							<Route path="/layout" element={routeElement(LayoutPage)} />
							<Route path="/settings" element={routeElement(SettingsPage)} />
							<Route path="/palette" element={routeElement(PalettePage)} />
							<Route path="/interactions" element={routeElement(InteractionShowcasePage)} />
							<Route path="/health" element={routeElement(HealthPage)} />
							<Route path="/wearable" element={routeElement(WearableDashboardPage)} />
							<Route path="/banking" element={routeElement(BankingDashboardPage)} />
							<Route path="/network" element={routeElement(NetworkOpsDashboardPage)} />
							<Route path="/ui" element={routeElement(UiIndexPage)} />
							<Route path="/ui/:slug" element={routeElement(UiPlaceholderPage)} />
						</Route>
						{/* Standalone pages (no sidebar) */}
						<Route path="/login" element={routeElement(LoginPage)} />
						<Route path="/badge-login" element={routeElement(BadgeLoginPage)} />
						<Route path="/static-page" element={routeElement(StaticPage)} />
						<Route path="/loading" element={routeElement(LoadingPage)} />
						<Route path="/404" element={routeElement(NotFound)} />
						<Route path="*" element={routeElement(NotFound)} />
					</Routes>
				</TooltipProvider>
			</LinkProvider>
		</BrowserRouter>
	</ThemeProvider>
);

export default App;
