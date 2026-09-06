import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@nocoo/basalt/components/accordion";
import { Autocomplete } from "@nocoo/basalt/components/autocomplete";
import { Badge } from "@nocoo/basalt/components/badge";
import { Banner } from "@nocoo/basalt/components/banner";
import { Breadcrumbs } from "@nocoo/basalt/components/breadcrumbs";
import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { CodeBlock } from "@nocoo/basalt/components/code";
import { Combobox } from "@nocoo/basalt/components/combobox";
import { CommandShortcut } from "@nocoo/basalt/components/command-palette";
import { DatePicker } from "@nocoo/basalt/components/date-picker";
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
	const [dialogCloseAttempts, setDialogCloseAttempts] = React.useState(0);
	const [autocompleteValue, setAutocompleteValue] = React.useState("");
	const [autocompleteCommits, setAutocompleteCommits] = React.useState<string[]>([]);
	const [resetRerenderCount, setResetRerenderCount] = React.useState(0);
	const [rangeResetRerenderCount, setRangeResetRerenderCount] = React.useState(0);
	const [controlledCheckboxes, setControlledCheckboxes] = React.useState<string[]>(["a"]);
	const [controlledSwitches, setControlledSwitches] = React.useState<string[]>(["a"]);
	const [controlledCheckboxCalls, setControlledCheckboxCalls] = React.useState<string[][]>([]);
	const [controlledSwitchCalls, setControlledSwitchCalls] = React.useState<string[][]>([]);
	const [uncontrolledCheckboxCalls, setUncontrolledCheckboxCalls] = React.useState<string[][]>([]);
	const [uncontrolledSwitchCalls, setUncontrolledSwitchCalls] = React.useState<string[][]>([]);
	const dateRefEvents = React.useRef<string[]>([]);
	const dateInputRef = React.useRef<HTMLInputElement | null>(null);

	const handleDateRef = React.useCallback((node: HTMLInputElement | null) => {
		dateInputRef.current = node;
		if (node) {
			dateRefEvents.current.push(`attach:${node.tagName}`);
			return () => {
				dateRefEvents.current.push("cleanup");
				dateInputRef.current = null;
			};
		}
	}, []);

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
				getDialogCloseAttempts?: () => number;
				getAutocompleteCommits?: () => string[];
				getDateRefEvents?: () => string[];
				getDateRefTag?: () => string | null;
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
				getDialogCloseAttempts?: () => number;
				getAutocompleteCommits?: () => string[];
				getDateRefEvents?: () => string[];
				getDateRefTag?: () => string | null;
			}
		).getDynamicCounts = () => ({
			parentClick: parentClickCount,
			childClick: childClickCount,
			parentCapture: parentCaptureCount,
			childCapture: childCaptureCount,
		});
		(
			window as unknown as {
				getDialogCloseAttempts?: () => number;
			}
		).getDialogCloseAttempts = () => dialogCloseAttempts;
		(
			window as unknown as {
				getAutocompleteCommits?: () => string[];
			}
		).getAutocompleteCommits = () => autocompleteCommits;
		(
			window as unknown as {
				getDateRefEvents?: () => string[];
				getDateRefTag?: () => string | null;
			}
		).getDateRefEvents = () => [...dateRefEvents.current];
		(
			window as unknown as {
				getDateRefTag?: () => string | null;
			}
		).getDateRefTag = () => dateInputRef.current?.tagName ?? null;
		(
			window as unknown as {
				getResetRerenderCount?: () => number;
				getRangeResetRerenderCount?: () => number;
				getControlledGroupEvidence?: () => {
					checkboxCalls: string[][];
					switchCalls: string[][];
					uncontrolledCheckboxCalls: string[][];
					uncontrolledSwitchCalls: string[][];
				};
			}
		).getResetRerenderCount = () => resetRerenderCount;
		(
			window as unknown as {
				getRangeResetRerenderCount?: () => number;
			}
		).getRangeResetRerenderCount = () => rangeResetRerenderCount;
		(
			window as unknown as {
				getControlledGroupEvidence?: () => {
					checkboxCalls: string[][];
					switchCalls: string[][];
					uncontrolledCheckboxCalls: string[][];
					uncontrolledSwitchCalls: string[][];
				};
			}
		).getControlledGroupEvidence = () => ({
			checkboxCalls: controlledCheckboxCalls,
			switchCalls: controlledSwitchCalls,
			uncontrolledCheckboxCalls,
			uncontrolledSwitchCalls,
		});
	}, [
		parentClickCount,
		childClickCount,
		parentCaptureCount,
		childCaptureCount,
		dialogCloseAttempts,
		autocompleteCommits,
		resetRerenderCount,
		rangeResetRerenderCount,
		controlledCheckboxCalls,
		controlledSwitchCalls,
		uncontrolledCheckboxCalls,
		uncontrolledSwitchCalls,
	]);
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
				<button
					id="outside-prevent-mousedown-btn"
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => {
						const w = window as unknown as { outsideClicks?: number };
						w.outsideClicks = (w.outsideClicks ?? 0) + 1;
					}}
					style={{ marginBottom: 8 }}
				>
					Outside Keep Focus Action
				</button>
				<LayerCard
					id="basalt-card-overflow"
					padding="md"
					className="overflow-hidden"
					style={{ height: 60 }}
				>
					<div id="basalt-card-overflow-wrap">
						<Combobox
							id="card-combobox-input"
							items={Array.from({ length: 40 }, (_, i) => ({
								value: `item-${i + 1}`,
								label: `Clipped ${i + 1}`,
							}))}
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

				{/* Autocomplete Tab/Shift+Tab and pointer blur regression harness */}
				<div id="autocomplete-test-harness" style={{ marginTop: 8, marginBottom: 8 }}>
					<button id="autocomplete-before-btn" type="button">
						Before Autocomplete
					</button>
					<Autocomplete
						id="test-autocomplete-input"
						items={[
							{ value: "val-apple", label: "Apple" },
							{ value: "val-banana", label: "Banana" },
							{ value: "val-cherry", label: "Cherry" },
						]}
						value={autocompleteValue}
						onValueChange={(val) => {
							setAutocompleteValue(val);
							setAutocompleteCommits((prev) => [...prev, val]);
						}}
						placeholder="Search fruits"
					/>
					<button id="autocomplete-after-btn" type="button">
						After Autocomplete
					</button>
				</div>

				{/* DatePicker Native Form & Ref Regression Harness */}
				<form
					id="datepicker-test-form"
					onSubmit={(e) => e.preventDefault()}
					onReset={(e) => {
						const w = window as unknown as { shouldCancelDateReset?: boolean };
						if (w.shouldCancelDateReset) {
							e.preventDefault();
						}
					}}
				>
					<DatePicker
						id="test-date-picker"
						name="test_date"
						defaultValue="2026-09-01"
						required
						ref={handleDateRef}
						aria-label="Test Date"
					/>
					<button id="datepicker-reset-btn" type="reset">
						Reset Date Form
					</button>
					<button id="datepicker-submit-btn" type="submit">
						Submit Date Form
					</button>
				</form>

				{/* Separate initially-empty required DatePicker form for true native submission validation */}
				<form id="datepicker-empty-required-form" onSubmit={(e) => e.preventDefault()}>
					<DatePicker
						id="test-empty-required-picker"
						name="empty_required_date"
						required
						aria-label="Empty Required Date"
					/>
					<button id="datepicker-empty-submit-btn" type="submit">
						Submit Empty Form
					</button>
				</form>

				{/* Separate DatePicker range reset form with parent onReset setState */}
				<form
					id="datepicker-range-test-form"
					onSubmit={(e) => e.preventDefault()}
					onReset={(e) => {
						setRangeResetRerenderCount((c) => c + 1);
						const w = window as unknown as { shouldCancelRangeReset?: boolean };
						if (w.shouldCancelRangeReset) {
							e.preventDefault();
						}
					}}
				>
					<span id="range-reset-rerender-count">{rangeResetRerenderCount}</span>
					<DatePicker
						id="test-range-date-picker"
						name="test_range"
						mode="range"
						defaultRangeValue={{ from: "2026-09-01", to: "2026-09-03" }}
						aria-label="Test Stay Range"
					/>
					<button id="datepicker-range-reset-btn" type="reset">
						Reset Range Form
					</button>
				</form>

				{/* Typeahead & Group Native Reset Regression Harness */}
				<form
					id="typeahead-group-test-form"
					onSubmit={(e) => e.preventDefault()}
					onReset={(e) => {
						setResetRerenderCount((c) => c + 1);
						const w = window as unknown as {
							shouldCancelTypeaheadGroupReset?: boolean;
						};
						if (w.shouldCancelTypeaheadGroupReset) {
							e.preventDefault();
						}
					}}
				>
					<span id="reset-rerender-count">{resetRerenderCount}</span>
					<Combobox
						id="test-reset-combobox"
						name="test_combobox"
						defaultValue="a"
						aria-label="Test Combobox"
						items={[
							{ value: "a", label: "Alpha" },
							{ value: "b", label: "Beta" },
						]}
					/>
					<Autocomplete
						id="test-reset-autocomplete"
						name="test_autocomplete"
						defaultValue="a"
						aria-label="Test Autocomplete"
						items={[
							{ value: "a", label: "Alpha" },
							{ value: "b", label: "Beta" },
						]}
					/>
					<Checkbox.Group
						id="test-reset-checkbox-group"
						defaultValue={["a"]}
						onValueChange={(val) => setUncontrolledCheckboxCalls((prev) => [...prev, val])}
					>
						<Checkbox.Item value="a" name="test_checkbox" aria-label="Alpha Checkbox" />
						<Checkbox.Item value="b" name="test_checkbox" aria-label="Beta Checkbox" />
					</Checkbox.Group>
					<Switch.Group
						id="test-reset-switch-group"
						defaultValue={["a"]}
						onValueChange={(val) => setUncontrolledSwitchCalls((prev) => [...prev, val])}
					>
						<Switch.Item value="a" name="test_switch" aria-label="Alpha Switch" />
						<Switch.Item value="b" name="test_switch" aria-label="Beta Switch" />
					</Switch.Group>

					{/* Controlled Checkbox & Switch Groups for native reset regression */}
					<Checkbox.Group
						id="test-controlled-checkbox-group"
						value={controlledCheckboxes}
						onValueChange={(val) => {
							setControlledCheckboxCalls((prev) => [...prev, val]);
							setControlledCheckboxes(val);
						}}
					>
						<Checkbox.Item
							value="a"
							name="test_controlled_checkbox"
							aria-label="Alpha Controlled Checkbox"
						/>
						<Checkbox.Item
							value="b"
							name="test_controlled_checkbox"
							aria-label="Beta Controlled Checkbox"
						/>
					</Checkbox.Group>
					<Switch.Group
						id="test-controlled-switch-group"
						value={controlledSwitches}
						onValueChange={(val) => {
							setControlledSwitchCalls((prev) => [...prev, val]);
							setControlledSwitches(val);
						}}
					>
						<Switch.Item
							value="a"
							name="test_controlled_switch"
							aria-label="Alpha Controlled Switch"
						/>
						<Switch.Item
							value="b"
							name="test_controlled_switch"
							aria-label="Beta Controlled Switch"
						/>
					</Switch.Group>

					<button id="typeahead-group-reset-btn" type="reset">
						Reset Controls Form
					</button>
				</form>

				<Badge id="basalt-badge">Active</Badge>

				<Dialog
					open
					modal={false}
					onOpenChange={(next) => {
						if (!next) {
							setDialogCloseAttempts((c) => c + 1);
						}
					}}
				>
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
