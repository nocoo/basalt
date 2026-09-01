import { Button } from "@nocoo/basalt/components/button";
import {
	ContentIsland,
	Sidebar,
	SidebarItem,
	SidebarProvider,
	useSidebar,
} from "@nocoo/basalt/components/sidebar";

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
				<Sidebar>
					<SidebarItem active>Catalog</SidebarItem>
					<SidebarItem>Settings</SidebarItem>
				</Sidebar>
				<div className="flex min-w-0 flex-1 flex-col gap-2 p-2">
					<Collapse />
					<ContentIsland className="p-4">At a glance</ContentIsland>
				</div>
			</div>
		</SidebarProvider>
	);
}
