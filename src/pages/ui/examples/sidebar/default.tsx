import { BasaltMark } from "@nocoo/basalt/components/basalt-mark";
import { Button } from "@nocoo/basalt/components/button";
import {
	Sidebar,
	SidebarBrand,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarIconItem,
	SidebarItem,
	SidebarNav,
	SidebarProvider,
	SidebarSearch,
	SidebarToggle,
} from "@nocoo/basalt/components/sidebar";
import { ArrowUp, Home, Plus, Users } from "lucide-react";
import { useState } from "react";

const destinations = [
	{ label: "New chat", icon: Plus, href: "/ui/sidebar?destination=new-chat" },
	{ label: "Home", icon: Home, href: "/ui/sidebar?destination=home" },
	{ label: "Invite patients", icon: Users, href: "/ui/sidebar?destination=invite" },
];
const chats = [
	"Patient records",
	"Urgent to-dos this morning",
	"Follow-up appointment",
	"Workload summary",
	"Update a care provider",
	"Care plan summary",
	"Review care plan changes",
	"Daily activity notes",
];

export default function SidebarDefault() {
	const [collapsed, setCollapsed] = useState(false);
	const [active, setActive] = useState("Home");
	return (
		<SidebarProvider collapsed={collapsed} onCollapsedChange={setCollapsed}>
			<Sidebar className="h-[30rem] max-w-full">
				<SidebarHeader>
					<SidebarBrand
						logo={<BasaltMark aria-hidden="true" />}
						name="Creamery Ops"
						version="v1.0.0"
						action={
							<SidebarToggle
								collapseLabel="Collapse navigation example"
								expandLabel="Expand navigation example"
							/>
						}
					/>
				</SidebarHeader>
				<SidebarNav aria-label="Example care team">
					<SidebarSearch onClick={() => setActive("Search")}>Search</SidebarSearch>
					{destinations.map(({ label, icon: Icon, href }) =>
						collapsed ? (
							<SidebarIconItem
								key={label}
								href={href}
								active={active === label}
								aria-label={label}
								title={label}
								onClick={(event) => {
									event.preventDefault();
									setActive(label);
								}}
							>
								<Icon aria-hidden="true" />
							</SidebarIconItem>
						) : (
							<SidebarItem
								key={label}
								href={href}
								active={active === label}
								onClick={(event) => {
									event.preventDefault();
									setActive(label);
								}}
							>
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
					<Button variant="outline" size={collapsed ? "icon-sm" : "default"} aria-label="Upgrade">
						{collapsed ? <ArrowUp aria-hidden="true" /> : "Upgrade"}
					</Button>
				</SidebarFooter>
			</Sidebar>
		</SidebarProvider>
	);
}
