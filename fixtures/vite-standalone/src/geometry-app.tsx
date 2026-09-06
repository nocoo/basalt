import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { CodeBlock } from "@nocoo/basalt/components/code";
import { Combobox } from "@nocoo/basalt/components/combobox";
import { CommandShortcut } from "@nocoo/basalt/components/command-palette";
import { DescriptionList } from "@nocoo/basalt/components/description-list";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@nocoo/basalt/components/dialog";
import { Empty } from "@nocoo/basalt/components/empty";
import { Input } from "@nocoo/basalt/components/input";
import { InputArea } from "@nocoo/basalt/components/input-area";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { MenuBarMenu, MenuBarRoot, MenuBarTrigger } from "@nocoo/basalt/components/menu-bar";
import { PageHeader } from "@nocoo/basalt/components/page-header";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";
import { Switch } from "@nocoo/basalt/components/switch";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@nocoo/basalt/components/table";
import { Text } from "@nocoo/basalt/components/text";
import * as React from "react";

export function GeometryApp() {
	const [switchLoading, setSwitchLoading] = React.useState(false);
	const [parentClickCount, setParentClickCount] = React.useState(0);
	const [childClickCount, setChildClickCount] = React.useState(0);
	const [parentCaptureCount, setParentCaptureCount] = React.useState(0);
	const [childCaptureCount, setChildCaptureCount] = React.useState(0);

	React.useEffect(() => {
		(
			window as unknown as {
				setSwitchLoading?: (v: boolean) => void;
				getDynamicCounts?: () => {
					parentClick: number;
					childClick: number;
					parentCapture: number;
					childCapture: number;
				};
			}
		).setSwitchLoading = setSwitchLoading;
		(
			window as unknown as {
				getDynamicCounts?: () => {
					parentClick: number;
					childClick: number;
					parentCapture: number;
					childCapture: number;
				};
			}
		).getDynamicCounts = () => ({
			parentClick: parentClickCount,
			childClick: childClickCount,
			parentCapture: parentCaptureCount,
			childCapture: childCaptureCount,
		});
	}, [parentClickCount, childClickCount, parentCaptureCount, childCaptureCount]);
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
				<Button id="basalt-btn-anchor-disabled" disabled asChild>
					<a href="#forbidden-hash" aria-disabled="false" tabIndex={0}>
						Disabled Anchor
					</a>
				</Button>

				{/* Switch-to-loading interactive test */}
				<button id="before-dynamic-anchor-btn" type="button">
					Before Dynamic Target
				</button>
				<button
					id="toggle-loading-btn"
					type="button"
					onClick={() => setSwitchLoading((prev) => !prev)}
				>
					Toggle Loading
				</button>
				<Button
					id="basalt-btn-dynamic-anchor"
					loading={switchLoading}
					asChild
					onClick={() => setParentClickCount((c) => c + 1)}
					onClickCapture={() => setParentCaptureCount((c) => c + 1)}
				>
					{/* biome-ignore lint/a11y/useValidAnchor: test fixture asserts navigation cancellation on disabled asChild anchor */}
					<a
						href="#dynamic-forbidden"
						id="dynamic-anchor-target"
						onClick={() => setChildClickCount((c) => c + 1)}
						onClickCapture={() => setChildCaptureCount((c) => c + 1)}
					>
						Dynamic Anchor
					</a>
				</Button>
				<button id="after-dynamic-anchor-btn" type="button">
					After Dynamic Target
				</button>

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

				{/* LayerCard containing Combobox to assert unclipped portal positioning */}
				<LayerCard id="basalt-card-overflow" padding="md" className="overflow-hidden">
					<div id="basalt-card-overflow-wrap">
						<Combobox
							id="card-combobox-input"
							items={[
								{ value: "item-1", label: "Clipped 1" },
								{ value: "item-2", label: "Clipped 2" },
								{ value: "item-3", label: "Clipped 3" },
							]}
							placeholder="Card Combobox"
						/>
					</div>
				</LayerCard>

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

				{/* Surface regressions: Banner, Empty, PageHeader, DescriptionList, CodeBlock, Text, Breadcrumbs, Badge */}
				<Banner id="basalt-banner" title="Banner Title" description="Banner description text" />

				<Empty
					id="basalt-empty"
					title="No results found"
					description="Try adjusting your search criteria."
				/>

				<div id="basalt-page-header-wrap">
					<PageHeader title="Page Title" description="Supporting description copy." />
				</div>

				<DescriptionList id="basalt-description-list" columns={1}>
					<DescriptionList.Item id="basalt-dl-item" term="Deployment Region">
						US-East (N. Virginia)
					</DescriptionList.Item>
				</DescriptionList>

				<CodeBlock id="basalt-code-block">const greeting = "hello basalt";</CodeBlock>

				<div id="basalt-text-group">
					<Text id="basalt-text-h2" as="h2">
						Heading Text
					</Text>
					<Text id="basalt-text-p">Paragraph Text</Text>
					<Text id="basalt-text-heading" variant="heading" as="h2">
						Semibold Heading
					</Text>
				</div>

				<div id="basalt-breadcrumbs-wrap">
					<Breadcrumbs items={[{ label: "Home", href: "/home" }, { label: "Settings" }]} />
				</div>

				<Badge id="basalt-badge">Active</Badge>

				<Dialog open modal={false}>
					<DialogTrigger id="basalt-dialog-trigger">Open Dialog</DialogTrigger>
					<DialogContent id="basalt-dialog-content">
						<DialogTitle id="basalt-dialog-title">Dialog Heading</DialogTitle>
						<Input id="portal-input" defaultValue="Portal Input" />
						<Button id="portal-btn">Portal Button</Button>
						<Combobox
							id="dialog-combobox-input"
							items={[
								{ value: "d-1", label: "Dialog Option 1" },
								{ value: "d-2", label: "Dialog Option 2" },
							]}
							placeholder="Dialog Combobox"
						/>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
