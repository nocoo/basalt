import { useState } from "react";
import {
  Layers, PanelRight, PanelLeft, PanelTop, PanelBottom,
  MessageSquare, Settings, ChevronDown, Filter, User, X,
} from "lucide-react";
import { PageIntro } from "@/components/PageIntro";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet, SheetContent, SheetDescription,
  SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-card bg-secondary p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function OverlaysPage() {
  const [collapsible1, setCollapsible1] = useState(false);
  const [collapsible2, setCollapsible2] = useState(false);

  return (
    <div className="space-y-4">
      <PageIntro
        title="Overlays and layered surfaces"
        description="Sheets, dialogs, alert dialogs, popovers, and collapsible sections for progressive disclosure."
        eyebrow="Overlays"
        icon={Layers}
      />

      {/* Sheet / Drawer */}
      <Section title="Sheet / Drawer" icon={PanelRight}>
        <p className="text-xs text-muted-foreground mb-3">Side panels that slide in from any edge. Ideal for detail views, filters, and settings.</p>
        <div className="flex flex-wrap gap-3">
          {/* Right sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelRight className="mr-2 h-3.5 w-3.5" /> Right
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Detail Panel</SheetTitle>
                <SheetDescription>View and edit record details in this side panel.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john@example.com" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch defaultChecked />
                </div>
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save changes</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Left sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelLeft className="mr-2 h-3.5 w-3.5" /> Left
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Narrow down results using the options below.</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {["Status", "Category", "Date range", "Priority"].map((f) => (
                  <div key={f} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{f}</span>
                    <Button variant="outline" size="sm">Any</Button>
                  </div>
                ))}
              </div>
              <SheetFooter className="mt-6">
                <Button variant="outline" size="sm">Reset</Button>
                <Button size="sm">Apply filters</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Top sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelTop className="mr-2 h-3.5 w-3.5" /> Top
              </Button>
            </SheetTrigger>
            <SheetContent side="top">
              <SheetHeader>
                <SheetTitle>Announcement</SheetTitle>
                <SheetDescription>System maintenance scheduled for tonight at 2:00 AM UTC.</SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>

          {/* Bottom sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelBottom className="mr-2 h-3.5 w-3.5" /> Bottom
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader>
                <SheetTitle>Quick Actions</SheetTitle>
                <SheetDescription>Select an action to perform.</SheetDescription>
              </SheetHeader>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Export CSV", "Print", "Share link", "Archive"].map((a) => (
                  <Button key={a} variant="outline" size="sm">{a}</Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      {/* Dialog Variants */}
      <Section title="Dialogs" icon={MessageSquare}>
        <div className="flex flex-wrap gap-3">
          {/* Basic dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Basic dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Display name</Label>
                  <Input defaultValue="Zheng Li" />
                </div>
                <div className="space-y-2">
                  <Label>Bio</Label>
                  <Input defaultValue="Software engineer" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Small dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Compact dialog</Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Confirm action</DialogTitle>
                <DialogDescription>Are you sure you want to proceed?</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" size="sm">No</Button>
                <Button size="sm">Yes, continue</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Large scrollable dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">Scrollable dialog</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Terms of Service</DialogTitle>
                <DialogDescription>Please review the terms below before accepting.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-foreground mb-1">Section {i + 1}</p>
                    <p className="text-xs text-muted-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                      incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                      exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm">Decline</Button>
                <Button size="sm">Accept</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Section>

      {/* Alert Dialog */}
      <Section title="Alert Dialogs" icon={X}>
        <p className="text-xs text-muted-foreground mb-3">Non-dismissible by clicking outside. Used for destructive or irreversible actions.</p>
        <div className="flex flex-wrap gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete item</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the item and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">Discard changes</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have unsaved changes that will be lost. Are you sure you want to leave?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Section>

      {/* Popover with content */}
      <Section title="Popovers" icon={Filter}>
        <div className="flex flex-wrap gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-3.5 w-3.5" /> Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <p className="text-sm font-medium">Filter by</p>
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Input placeholder="e.g. Active" className="h-8 text-xs" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Category</Label>
                  <Input placeholder="e.g. Sales" className="h-8 text-xs" />
                </div>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm">Reset</Button>
                  <Button size="sm">Apply</Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="mr-2 h-3.5 w-3.5" /> Profile
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-medium">ZL</div>
                <div>
                  <p className="text-sm font-medium">Zheng Li</p>
                  <p className="text-xs text-muted-foreground">zhengli@example.com</p>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="space-y-1">
                {["Profile settings", "Billing", "Team", "Sign out"].map((item) => (
                  <button key={item} className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">
                    {item}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-3.5 w-3.5" /> Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <p className="text-sm font-medium mb-3">Quick settings</p>
              <div className="space-y-3">
                {["Dark mode", "Notifications", "Compact view"].map((label) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Switch />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Section>

      {/* Collapsible */}
      <Section title="Collapsible Sections" icon={ChevronDown}>
        <div className="space-y-3">
          <Collapsible open={collapsible1} onOpenChange={setCollapsible1}>
            <div className="rounded-widget border border-border bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                <span className="text-sm font-medium text-foreground">Advanced options</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${collapsible1 ? "rotate-180" : ""}`} strokeWidth={1.5} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border p-4 space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">API endpoint</Label>
                    <Input placeholder="https://api.example.com" className="h-8 text-xs" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Enable caching</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Debug mode</span>
                    <Switch />
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible open={collapsible2} onOpenChange={setCollapsible2}>
            <div className="rounded-widget border border-border bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4">
                <span className="text-sm font-medium text-foreground">Danger zone</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${collapsible2 ? "rotate-180" : ""}`} strokeWidth={1.5} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t border-border p-4 space-y-3">
                  <p className="text-xs text-muted-foreground">Destructive actions that cannot be undone.</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Delete workspace</p>
                      <p className="text-xs text-muted-foreground">Permanently remove this workspace and all data.</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>
      </Section>
    </div>
  );
}
