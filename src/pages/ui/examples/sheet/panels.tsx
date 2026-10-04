import { Button } from "@nocoo/basalt/components/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@nocoo/basalt/components/sheet";

export default function SheetPanels() {
	return (
		<div className="flex flex-wrap gap-3">
			{(["right", "left", "top", "bottom"] as const).map((side) => (
				<Sheet key={side}>
					<SheetTrigger asChild>
						<Button variant="outline">Open {side} panel</Button>
					</SheetTrigger>
					<SheetContent side={side}>
						<SheetHeader>
							<SheetTitle>Account overview</SheetTitle>
							<SheetDescription>
								The panel slides from the {side} as the workspace softly blurs behind it.
							</SheetDescription>
						</SheetHeader>
						<dl className="grid grid-cols-2 gap-3 py-4 text-sm">
							<dt className="text-basalt-muted-foreground">Company</dt>
							<dd>Acme Studio</dd>
							<dt className="text-basalt-muted-foreground">Account owner</dt>
							<dd>Alex Morgan</dd>
							<dt className="text-basalt-muted-foreground">Stage</dt>
							<dd>Expansion</dd>
						</dl>
						<SheetFooter className="mt-auto">
							<SheetClose asChild>
								<Button variant="outline">Close panel</Button>
							</SheetClose>
						</SheetFooter>
					</SheetContent>
				</Sheet>
			))}
		</div>
	);
}
