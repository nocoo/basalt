import { ContentIsland, Sidebar, SidebarItem } from "@nocoo/basalt/components/sidebar";

export default function SidebarDefault() {
	return (
		<div className="flex h-56 w-full overflow-hidden bg-basalt-background">
			<Sidebar className="h-full min-h-0 w-40">
				<SidebarItem active>Catalog</SidebarItem>
				<SidebarItem>Settings</SidebarItem>
			</Sidebar>
			<div className="flex min-w-0 flex-1 flex-col p-2">
				<ContentIsland className="p-4">At a glance</ContentIsland>
			</div>
		</div>
	);
}
