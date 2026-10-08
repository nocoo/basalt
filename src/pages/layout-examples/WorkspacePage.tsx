import { AppHeader } from "@nocoo/basalt/components/app-header";
import { AppMain, AppShell, AppSkipLink } from "@nocoo/basalt/components/app-shell";
import { Button, LinkButton } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@nocoo/basalt/components/sheet";
import {
	ContentIsland,
	Sidebar,
	SidebarFooter,
	SidebarHeader,
	SidebarItem,
	SidebarNav,
} from "@nocoo/basalt/components/sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function WorkspacePage() {
	const [saved, setSaved] = useState(false);
	const [layout, setLayout] = useState<"workspace" | "responsive" | "document">("responsive");
	return (
		<AppShell layout={layout}>
			<AppSkipLink>Skip to content</AppSkipLink>
			<Sidebar aria-label="Desktop workspace" className="hidden md:flex">
				<SidebarHeader>Basalt workspace</SidebarHeader>
				<SidebarNav>
					<LinkButton href="/examples/reader" variant="ghost">
						Field journal
					</LinkButton>
				</SidebarNav>
				<SidebarFooter>Document or bounded layout</SidebarFooter>
			</Sidebar>
			<AppMain>
				<AppHeader
					density="compact"
					title="Workspace settings"
					leading={
						<Sheet>
							<SheetTrigger asChild>
								<Button aria-label="Open navigation" size="icon" variant="ghost">
									<Menu />
								</Button>
							</SheetTrigger>
							<SheetContent side="left" className="w-[16.25rem] max-w-[16.25rem] border-0 p-0">
								<SheetTitle className="sr-only">Workspace navigation</SheetTitle>
								<SheetDescription className="sr-only">Local layout examples.</SheetDescription>
								<Sidebar>
									<SidebarHeader>Basalt layouts</SidebarHeader>
									<SidebarNav>
										{Array.from({ length: 30 }, (_, index) => (
											<SheetClose asChild key={`section-${index}`}>
												<SidebarItem className="min-h-basalt-touch">
													Section {index + 1}
												</SidebarItem>
											</SheetClose>
										))}
									</SidebarNav>
									<SidebarFooter>
										<SheetClose asChild>
											<Button className="min-h-11">Close navigation</Button>
										</SheetClose>
									</SidebarFooter>
								</Sidebar>
							</SheetContent>
						</Sheet>
					}
					actions={
						<LinkButton href="/layout" variant="ghost">
							Layouts
						</LinkButton>
					}
				/>
				<div className="flex min-h-0 min-w-0 flex-1 flex-col px-basalt-space-lg pb-basalt-space-lg md:px-basalt-space-lg md:pb-basalt-space-lg">
					<ContentIsland>
						<div className="mx-auto max-w-2xl space-y-basalt-space-lg">
							<PageHeader
								title="Profile and preferences"
								description="An inset form surface. Resize, tab through fields, then open and dismiss navigation."
							/>
							<div
								role="group"
								aria-label="Scroll layout"
								className="flex flex-wrap gap-basalt-space-lg"
							>
								{(["responsive", "document", "workspace"] as const).map((mode) => (
									<Button
										key={mode}
										variant="outline"
										className="min-h-11"
										aria-pressed={layout === mode}
										onClick={() => setLayout(mode)}
									>
										{mode}
									</Button>
								))}
							</div>
							<form
								aria-label="Workspace profile"
								className="space-y-basalt-space-lg"
								onSubmit={(event) => {
									event.preventDefault();
									setSaved(true);
								}}
							>
								{Array.from({ length: 14 }, (_, index) => (
									<div key={`field-${index}`} className="space-y-basalt-space-lg">
										<Label htmlFor={`field-${index}`}>
											{index === 13 ? "Final note" : `Preference ${index + 1}`}
										</Label>
										<Input
											id={`field-${index}`}
											name={`field-${index}`}
											className="min-h-11 text-basalt-lg"
											autoComplete="off"
											required={index === 13}
										/>
									</div>
								))}
								<Button type="submit" className="min-h-11">
									Save preferences
								</Button>
								<p role="status">
									{saved ? "Preferences saved locally." : "Nothing is sent to a server."}
								</p>
							</form>
						</div>
					</ContentIsland>
				</div>
			</AppMain>
		</AppShell>
	);
}
