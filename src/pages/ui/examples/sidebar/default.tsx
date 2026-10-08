import { Button } from "@nocoo/basalt/components/button";
import {
	Sidebar,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
} from "@nocoo/basalt/components/sidebar";
import { ArrowUp, Home, PanelLeft, Plus, Users } from "lucide-react";
import { useState } from "react";

const destinations = [
	{ label: "New chat", icon: Plus },
	{ label: "Home", icon: Home },
	{ label: "Invite users", icon: Users },
];
const chats = [
	"Supplier records",
	"Urgent to-dos this morning",
	"Flavor page ticket",
	"Workload summary",
	"Off-board a supplier",
	"Batch restock function",
	"Propose flavor edits",
	"Subway surfing",
];

export default function SidebarDefault() {
	const [collapsed, setCollapsed] = useState(false);
	const [active, setActive] = useState("Home");
	return (
		<Sidebar collapsed={collapsed} className="h-[30rem] max-w-full">
			<SidebarHeader>
				{!collapsed && <strong className="min-w-0 flex-1 truncate">Creamery Ops</strong>}
				<Button
					variant="ghost"
					size="icon"
					aria-label={collapsed ? "Expand navigation example" : "Collapse navigation example"}
					onClick={() => setCollapsed(!collapsed)}
				>
					<PanelLeft aria-hidden="true" />
				</Button>
			</SidebarHeader>
			<SidebarNav aria-label="Example workspace">
				{destinations.map(({ label, icon: Icon }) =>
					collapsed ? (
						<SidebarIconItem
							key={label}
							active={active === label}
							aria-label={label}
							title={label}
							onClick={() => setActive(label)}
						>
							<Icon aria-hidden="true" />
						</SidebarIconItem>
					) : (
						<SidebarItem key={label} active={active === label} onClick={() => setActive(label)}>
							<Icon aria-hidden="true" />
							<span className="truncate">{label}</span>
						</SidebarItem>
					),
				)}
				{!collapsed && (
					<SidebarGroup label="Chats">
						{chats.map((label) => (
							<SidebarItem key={label} active={active === label} onClick={() => setActive(label)}>
								<span className="truncate">{label}</span>
							</SidebarItem>
						))}
					</SidebarGroup>
				)}
			</SidebarNav>
			<SidebarFooter>
				<Button variant="outline" size={collapsed ? "icon" : "default"} aria-label="Upgrade">
					{collapsed ? <ArrowUp aria-hidden="true" /> : "Upgrade"}
				</Button>
			</SidebarFooter>
		</Sidebar>
	);
}
