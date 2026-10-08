import { Button } from "@nocoo/basalt/components/button";
import {
	ContentIsland,
	Sidebar,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	useSidebar,
} from "@nocoo/basalt/components/sidebar";
import { Home, Settings } from "lucide-react";

function Navigation() {
	const { collapsed, peeking } = useSidebar();
	return (
		<Sidebar>
			<SidebarNav>
				{[
					{ label: "Catalog", icon: Home },
					{ label: "Settings", icon: Settings },
				].map(({ label, icon: Icon }, index) =>
					collapsed && !peeking ? (
						<SidebarIconItem key={label} active={index === 0} aria-label={label} title={label}>
							<Icon aria-hidden="true" />
						</SidebarIconItem>
					) : (
						<SidebarItem key={label} active={index === 0}>
							<Icon aria-hidden="true" />
							{label}
						</SidebarItem>
					),
				)}
			</SidebarNav>
		</Sidebar>
	);
}

function Collapse() {
	const { collapsed, setCollapsed } = useSidebar();
	return (
		<Button type="button" onClick={() => setCollapsed(!collapsed)}>
			{collapsed ? "Expand" : "Collapse"}
		</Button>
	);
}

export default function SidebarProviderExample() {
	return (
		<SidebarProvider defaultCollapsed={false} peek>
			<div className="flex h-56 w-full overflow-hidden bg-basalt-background">
				<Navigation />
				<div className="flex min-w-0 flex-1 flex-col gap-basalt-space-lg p-basalt-space-lg">
					<Collapse />
					<ContentIsland className="p-basalt-space-lg">At a glance</ContentIsland>
				</div>
			</div>
		</SidebarProvider>
	);
}
