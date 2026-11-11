import { BasaltMark } from "@nocoo/basalt/components/basalt-mark";
import { Button } from "@nocoo/basalt/components/button";
import {
	Sidebar,
	SidebarBrand,
	SidebarDrawer,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
	SidebarToggle,
} from "@nocoo/basalt/components/sidebar";
import { Home, Inbox } from "lucide-react";
import { useRef, useState } from "react";

const items = [
	{ label: "Home", icon: Home, href: "/ui/sidebar?drawer=home" },
	{ label: "Inbox", icon: Inbox, href: "/ui/sidebar?drawer=inbox" },
];

export default function SidebarDrawerExample() {
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState("Home");
	const menuRef = useRef<HTMLButtonElement>(null);

	return (
		<div className="flex flex-col gap-basalt-layout">
			<Button
				ref={menuRef}
				variant="outline"
				className="self-start"
				aria-controls="sidebar-drawer-example"
				onClick={() => setOpen(true)}
			>
				Open navigation
			</Button>
			<SidebarDrawer
				open={open}
				onOpenChange={setOpen}
				id="sidebar-drawer-example"
				returnFocusRef={menuRef}
			>
				<Sidebar resizable={false} className="h-[24rem]">
					<SidebarHeader>
						<SidebarBrand
							logo={<BasaltMark aria-hidden="true" />}
							name="Creamery Ops"
							version="v1.0.0"
							action={<SidebarToggle mode="dismiss" onDismiss={() => setOpen(false)} />}
						/>
					</SidebarHeader>
					<SidebarNav aria-label="Example mobile navigation">
						{items.map(({ label, icon: Icon, href }) => (
							<SidebarItem
								key={label}
								href={href}
								active={active === label}
								onClick={(event) => {
									event.preventDefault();
									setActive(label);
									setOpen(false);
								}}
							>
								<Icon aria-hidden="true" />
								<span className="truncate">{label}</span>
							</SidebarItem>
						))}
					</SidebarNav>
				</Sidebar>
			</SidebarDrawer>
			<p className="text-basalt-sm text-basalt-muted-foreground">Active destination: {active}</p>
		</div>
	);
}
