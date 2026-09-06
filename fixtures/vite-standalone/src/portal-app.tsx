import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@nocoo/basalt/components/alert-dialog";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuPanel,
	ContextMenuTrigger,
} from "@nocoo/basalt/components/context-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@nocoo/basalt/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@nocoo/basalt/components/dropdown-menu";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@nocoo/basalt/components/hover-card";
import {
	MenuBar,
	MenuBarContent,
	MenuBarItem,
	MenuBarMenu,
	MenuBarTrigger,
} from "@nocoo/basalt/components/menu-bar";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@nocoo/basalt/components/popover";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@nocoo/basalt/components/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@nocoo/basalt/components/tooltip";
import React, { useRef, useState } from "react";

export type ModuleStem =
	| "hover-card"
	| "dialog"
	| "alert-dialog"
	| "sheet"
	| "popover"
	| "tooltip"
	| "dropdown-menu"
	| "context-menu-panel"
	| "context-menu-bare"
	| "menu-bar";

export interface AuditConfig {
	slug: ModuleStem;
	open: boolean;
	forceMount?: true;
	epoch: number;
}

declare global {
	interface Window {
		auditOutsideClicks?: number;
		auditMount?: (slug: ModuleStem, open: boolean, forceMount?: true) => void;
		auditUnmount?: () => void;
		auditReady?: boolean;
	}
}

const RENDERERS: Record<ModuleStem, (config: AuditConfig) => React.ReactNode> = {
	"hover-card": ({ open, forceMount }) => (
		<HoverCard open={open}>
			<HoverCardTrigger data-audit-trigger={true} type="button">
				Trigger
			</HoverCardTrigger>
			<HoverCardContent data-audit-content="hover-card" forceMount={forceMount}>
				<button type="button">Inside action</button>
			</HoverCardContent>
		</HoverCard>
	),
	dialog: ({ open, forceMount }) => (
		<Dialog open={open}>
			<DialogTrigger data-audit-trigger={true} type="button">
				Trigger
			</DialogTrigger>
			<DialogContent data-audit-content="dialog" forceMount={forceMount}>
				<DialogTitle>Audit title</DialogTitle>
				<DialogDescription>Audit description</DialogDescription>
				<button type="button">Inside action</button>
			</DialogContent>
		</Dialog>
	),
	"alert-dialog": ({ open, forceMount }) => (
		<AlertDialog open={open}>
			<AlertDialogTrigger data-audit-trigger={true} type="button">
				Trigger
			</AlertDialogTrigger>
			<AlertDialogContent data-audit-content="alert-dialog" forceMount={forceMount}>
				<AlertDialogTitle>Audit title</AlertDialogTitle>
				<AlertDialogDescription>Audit description</AlertDialogDescription>
				<button type="button">Inside action</button>
				<AlertDialogCancel>Cancel</AlertDialogCancel>
			</AlertDialogContent>
		</AlertDialog>
	),
	sheet: ({ open, forceMount }) => (
		<Sheet open={open}>
			<SheetTrigger data-audit-trigger={true} type="button">
				Trigger
			</SheetTrigger>
			<SheetContent data-audit-content="sheet" forceMount={forceMount}>
				<SheetTitle>Audit title</SheetTitle>
				<SheetDescription>Audit description</SheetDescription>
				<button type="button">Inside action</button>
			</SheetContent>
		</Sheet>
	),
	popover: ({ open, forceMount }) => (
		<Popover open={open}>
			<PopoverTrigger data-audit-trigger={true} type="button">
				Trigger
			</PopoverTrigger>
			<PopoverContent data-audit-content="popover" forceMount={forceMount}>
				<PopoverTitle>Audit title</PopoverTitle>
				<PopoverDescription>Audit description</PopoverDescription>
				<button type="button">Inside action</button>
			</PopoverContent>
		</Popover>
	),
	tooltip: ({ open, forceMount }) => (
		<TooltipProvider>
			<Tooltip open={open}>
				<TooltipTrigger data-audit-trigger={true} type="button">
					Trigger
				</TooltipTrigger>
				<TooltipContent data-audit-content="tooltip" forceMount={forceMount}>
					Inside action
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	),
	"dropdown-menu": ({ open, forceMount }) => (
		<DropdownMenu open={open}>
			<DropdownMenuTrigger data-audit-trigger={true} type="button">
				Trigger
			</DropdownMenuTrigger>
			<DropdownMenuContent data-audit-content="dropdown-menu" forceMount={forceMount}>
				<DropdownMenuItem>Inside action</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
	"context-menu-panel": ({ forceMount, epoch }) => (
		<ContextMenu key={epoch}>
			<ContextMenuTrigger data-audit-trigger={true}>Trigger</ContextMenuTrigger>
			<ContextMenuPanel data-audit-content="context-menu-panel" forceMount={forceMount}>
				<ContextMenuItem>Inside action</ContextMenuItem>
			</ContextMenuPanel>
		</ContextMenu>
	),
	"context-menu-bare": ({ forceMount, epoch }) => (
		<ContextMenu key={epoch}>
			<ContextMenuTrigger data-audit-trigger={true}>Trigger</ContextMenuTrigger>
			<ContextMenuContent data-audit-content="context-menu-bare" forceMount={forceMount}>
				<ContextMenuItem>Inside action</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	),
	"menu-bar": ({ open, forceMount }) => (
		<MenuBar value={open ? "audit" : ""}>
			<MenuBarMenu value="audit">
				<MenuBarTrigger data-audit-trigger={true} type="button">
					Trigger
				</MenuBarTrigger>
				<MenuBarContent data-audit-content="menu-bar" forceMount={forceMount}>
					<MenuBarItem>Inside action</MenuBarItem>
				</MenuBarContent>
			</MenuBarMenu>
		</MenuBar>
	),
};

export function PortalApp() {
	const [active, setActive] = useState<AuditConfig | null>(null);
	const [unmounted, setUnmounted] = useState(false);
	const epochRef = useRef(0);

	React.useEffect(() => {
		window.auditMount = (slug, open, forceMount) => {
			epochRef.current += 1;
			setUnmounted(false);
			setActive({ slug, open, forceMount, epoch: epochRef.current });
		};
		window.auditUnmount = () => {
			setActive(null);
			setUnmounted(true);
		};
		window.auditReady = true;
	}, []);

	return (
		<div>
			<button
				id="outside-portal"
				type="button"
				onClick={() => {
					window.auditOutsideClicks = (window.auditOutsideClicks ?? 0) + 1;
				}}
			>
				Outside action
			</button>
			<div id="portal-slot">{active ? RENDERERS[active.slug](active) : null}</div>
			{unmounted ? <span data-unmounted={true}>Unmounted</span> : null}
		</div>
	);
}
