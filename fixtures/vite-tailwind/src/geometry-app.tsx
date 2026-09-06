import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { CommandShortcut } from "@nocoo/basalt/components/command-palette";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@nocoo/basalt/components/dialog";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { MenuBarMenu, MenuBarRoot, MenuBarTrigger } from "@nocoo/basalt/components/menu-bar";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Switch } from "@nocoo/basalt/components/switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@nocoo/basalt/components/table";

export function GeometryApp() {
	return (
		<div>
			{/* Host native elements (un-styled, un-marked) for isolation / leak check */}
			<div id="host-scope">
				<button id="host-btn" type="button">
					Host Button
				</button>
				<input id="host-input" type="text" defaultValue="Host Input" />
				<textarea id="host-textarea" defaultValue="Host Textarea" />
				<table id="host-table">
					<tbody>
						<tr>
							<td>Host Cell</td>
						</tr>
					</tbody>
				</table>
			</div>

			{/* Baseline raw un-styled iframe for native Chromium UA style comparison */}
			<iframe
				id="raw-frame"
				title="raw-frame"
				srcDoc="<!doctype html><html><body style='margin:0;padding:0;font-family:sans-serif;'><button id='raw-btn' type='button'>Btn</button><input id='raw-input' type='text' value='Input' /><textarea id='raw-textarea'>Area</textarea><table id='raw-table'><tbody><tr><td>Cell</td></tr></tbody></table></body></html>"
			/>

			{/* Basalt components in 320px container */}
			<div id="basalt-container" style={{ width: 320, marginTop: 20 }}>
				<Input id="basalt-input" defaultValue="Basalt Input" />
				<InputArea id="basalt-input-area" defaultValue="Basalt Input Area" />
				<Button id="basalt-btn-default">Default Button</Button>
				<Button id="basalt-btn-outline" variant="outline">
					Outline Button
				</Button>
				<Button id="basalt-btn-anchor" asChild>
					<a href="#test-link">Anchor Button</a>
				</Button>

				<Checkbox id="basalt-checkbox" aria-label="Basalt Checkbox" />
				<Switch id="basalt-switch" aria-label="Basalt Switch" />

				<Select defaultValue="one">
					<SelectTrigger id="basalt-select-trigger" aria-label="Basalt Select">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="one">Option 1</SelectItem>
						<SelectItem value="two">Option 2</SelectItem>
					</SelectContent>
				</Select>

				<LayerCard id="basalt-card" padding="md">
					<div id="basalt-card-wrap">
						<Input id="basalt-card-input" defaultValue="Card Input" />
					</div>
				</LayerCard>

				<Table id="basalt-table">
					<TableHeader>
						<TableRow>
							<TableCell>Col 1</TableCell>
							<TableCell>Col 2</TableCell>
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell>Cell 1</TableCell>
							<TableCell>Cell 2</TableCell>
						</TableRow>
					</TableBody>
				</Table>

				<Accordion id="basalt-accordion" type="single" collapsible>
					<AccordionItem value="item-1">
						<AccordionTrigger id="basalt-accordion-trigger">Accordion Header</AccordionTrigger>
						<AccordionContent id="basalt-accordion-content">
							Accordion Content Body
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<MenuBarRoot id="basalt-menubar-root">
					<MenuBarMenu>
						<MenuBarTrigger id="basalt-menubar-trigger">File</MenuBarTrigger>
					</MenuBarMenu>
				</MenuBarRoot>

				{/* Parent flex container for CommandShortcut layout test */}
				<div id="shortcut-parent" style={{ display: "flex", width: 320, alignItems: "center" }}>
					<span id="shortcut-label">Search Action</span>
					<CommandShortcut id="basalt-command-shortcut">⌘K</CommandShortcut>
				</div>

				<Dialog defaultOpen modal={false}>
					<DialogTrigger id="basalt-dialog-trigger">Open Dialog</DialogTrigger>
					<DialogContent id="basalt-dialog-content">
						<DialogTitle id="basalt-dialog-title">Dialog Heading</DialogTitle>
						<Input id="portal-input" defaultValue="Portal Input" />
						<Button id="portal-btn">Portal Button</Button>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
