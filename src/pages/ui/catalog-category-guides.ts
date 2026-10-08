import type { CatalogCategory } from "./catalog-categories";

interface CategoryGuide {
	rationale: string;
	geometry: string;
	interaction: string;
	practices: readonly string[];
}

export const CATEGORY_GUIDES: Record<CatalogCategory, CategoryGuide> = {
	inline: {
		rationale:
			"Badges and tags add status or classification to an existing sentence, row or heading. They should remain visually subordinate to that content; making them look like primary buttons confuses information with action.",
		geometry:
			"The shared inline recipe combines a 1rem line box, .125rem vertical padding and borders. The resulting 1.375rem is a reference, not a fixed height. Longer labels must be allowed to grow. Use the shared spacing steps to separate adjacent tags.",
		interaction:
			"Static labels do not receive hover or focus affordances. A removable tag exposes a named removal action; a selectable tag uses an actual action control rather than a click handler on a decorative badge.",
		practices: [
			"Use short, specific status text. Pair semantic colors with words so status never depends on hue alone.",
			"Place a badge next to the item it describes. Avoid a separate padded container just to hold a single badge.",
			"Use Button or Toggle for actions and filters; use Badge or TagBadge for annotation.",
			"Keep labels readable at enlarged text sizes. Do not shrink the font or clip the row to preserve 22px.",
		],
	},
	action: {
		rationale:
			"Inputs, buttons and selection controls share one visual rhythm because they frequently occupy the same form row or toolbar. Consistency comes from their text metrics and boundary ownership, not a collection of fixed heights.",
		geometry:
			"The default action uses a 1.5rem line box, .25rem vertical padding and borders for a 2.125rem reference size. Choose the shared sm (1.75rem) or lg (2.5rem) variant for the entire row. Compound inputs own one outer border; icons follow the shared action icon token.",
		interaction:
			"Selection uses a brighter surface and readable labels without decorative side bars or borders, never a muted disabled-looking fill. Selection and hover motion are on by default. The first selection snaps into place before paint, including non-first controlled values and hidden panels; only subsequent user changes animate. Keyboard focus, disabled states and reduced motion remain independent of pointer hover.",
		practices: [
			"Use persistent labels and nearby validation feedback. A placeholder is not a label, and icon-only actions need accessible names.",
			"Keep one primary action per decision. Use a link for navigation and a button for an operation.",
			"Let text determine height. Textareas grow naturally; chat inputs grow to five lines, then scroll inside the input.",
			"Keep values, validation and async submission in the ViewModel. Show pending, error and disabled states without losing the user's input.",
		],
	},
	banner: {
		rationale:
			"Feedback should be visible without dominating a dense workspace. Banners explain a persistent condition near affected content; toasts acknowledge transient events without becoming the only place important information exists.",
		geometry:
			"A 1.375rem line box plus .5rem vertical insets gives the 2.375rem single-line reference. Descriptions and action rows increase height naturally. Align the leading icon with the first text line instead of centering it against a long paragraph.",
		interaction:
			"Use polite announcements for ordinary updates and urgent alerts only when interruption is necessary. Dismissal and recovery are named actions. Entrance and exit use shared motion and honor reduced motion without delaying access to the message.",
		practices: [
			"Explain the condition and a concrete next step. Avoid vague messages such as 'Something happened'.",
			"Keep actionable errors near the affected field or region even if a toast also announces them.",
			"Reserve destructive styling for genuine failure or risk; do not communicate severity with color alone.",
			"Allow wrapping and avoid stacking multiple notifications for the same event. Do not hide required decisions behind a timeout.",
		],
	},
	card: {
		rationale:
			"A card is a content boundary, not a larger button. Matte luminance establishes grouping: an island is L1, its first card is L2 and a nested well is L3. More borders, shadows or padding do not make the hierarchy clearer.",
		geometry:
			"There is no mandatory card height. Card padding has four tiers: sm .75rem, md 1rem (default), lg 1.5rem and xl 2rem. LayerCard sections own their boundaries without doubling padding; headers use 1rem horizontal and .75rem vertical insets. Use Body for same-level layout and Well for raised content. Internal buttons keep compact control spacing.",
		interaction:
			"Expose explicit actions instead of making a whole rich card clickable around nested buttons. Approval and recommendation surfaces keep hover feedback local to the actual choice and preserve pending, selected and completed states.",
		practices: [
			"Group one coherent subject per surface. Use SectionRule between regions rather than wrapping every paragraph in another card.",
			"Use Header asChild on full-width disclosure triggers and Body inside unstyled disclosure content. Attached code owns its inset; do not wrap it in another padded Body.",
			"Model empty, loading, error and populated states at the same boundary so content does not unexpectedly disappear.",
			"Keep approval and upload state in the application ViewModel. Present real effects and do not treat a visual selection as a completed operation.",
		],
	},
	layout: {
		rationale:
			"Layouts coordinate children; they do not invent another visual density scale. This family includes navigation, tables and conversation composites, plus nonvisual theme and link providers that establish application-wide behavior.",
		geometry:
			"Layout spacing has four tiers: sm .75rem, md 1rem, lg 1.5rem and xl 2rem. Grids default to md; page sections use lg and section content uses sm. ContentIsland uses sm on mobile and md on desktop. Use intrinsic sizing and one scroll owner. Child actions, rows and labels keep compact control spacing.",
		interaction:
			"Uppercase group labels and extra group spacing separate sidebar sections from destinations. Bright selected rows retain their fill while another row is hovered. Shared moving backgrounds belong to the list, not every row. Initial selection and layout changes snap; established user selections animate with transform and opacity. Disclosure chevrons rotate with shared nonlinear motion, and hidden content must not remain focusable.",
		practices: [
			"Assign each outer inset to one owner. Sticky wrappers only position panels; LayerCard slots own their insets. Use row/cell spacing for edge-to-edge lists instead of cancelling Body padding.",
			"Keep routing, permissions, sorting and chat transport in Models/ViewModels. Views compose controls; only Views measure DOM geometry.",
			"Preserve semantic table headers, stable row identity, numeric alignment and accessible names in compact layouts.",
			"On narrow screens, adapt the composition instead of shrinking its text. Verify scroll reachability, keyboard navigation and five-line chat input behavior.",
		],
	},
	overlay: {
		rationale:
			"Temporary surfaces differ by how much attention they require. Tooltips add optional context, popovers support a small local task, menus expose commands, and dialogs or sheets contain decisions that need a focused surface.",
		geometry:
			"Triggers follow action sizing. Overlay bodies grow with content inside viewport constraints; scroll the content region instead of clipping rows. Dialogs and sheets start an L1 surface; floating menus and popovers use the shared popover surface and menu insets.",
		interaction:
			"The primitive owns focus entry, Escape, outside dismissal and return to the trigger. Enter, exit and disclosure rotation use shared motion tokens; closing content remains mounted for its exit. Reduced motion removes spatial animation without removing content.",
		practices: [
			"Choose the least disruptive surface that fits the task. A tooltip must not contain required actions or replace a visible label.",
			"Give dialogs a clear title and explicit confirm/cancel actions. Reserve destructive confirmation for a consequential operation.",
			"Keep portal positioning and focus management in the library. Do not patch them with page-level offsets or timers.",
			"Test trigger focus restoration, keyboard selection, long menus, viewport edges and nested overlays. Only one hover highlight should move within each list.",
		],
	},
	primitive: {
		rationale:
			"A checkbox mark is not a text input and an avatar is not a button. Primitives retain geometry suited to recognition or typography while the row or action around them provides alignment and an adequate hit target.",
		geometry:
			"Use shared typography, icon and shape tokens. Inline links inherit surrounding text. Graphic size is independent of target size: containing rows follow the action recipe, while floating or mobile shell actions may use the shared 2.75rem touch minimum.",
		interaction:
			"Preserve native checkbox, radio, switch and slider semantics, including keyboard control and visible focus. Loaders indicate real pending work; continuous spinners may be linear, while decorative shimmer stops for reduced motion.",
		practices: [
			"Use a visible label for selection controls and associate it with the control so the label enlarges the usable target.",
			"Pair avatars with an accessible name; use the shared colored-circle and two-letter fallback instead of a one-off identity treatment.",
			"Keep ordinary text at least .6875rem reference and use the shared scale. Never reduce text size to fit a fixed container.",
			"Provide textual meaning for progress and meters. Decorative icons should be hidden from assistive technology rather than announced twice.",
		],
	},
	chart: {
		rationale:
			"Charts earn their space by making a comparison easier than a table would. The visualization's geometry follows the data, while its labels, controls and surrounding surfaces remain part of the same design system.",
		geometry:
			"Give the chart a real responsive container and a deliberate aspect or height constraint. Use shared chart frames, legends and tooltips. Chart colors are independent of the control accent; toolbars follow the action and spacing standards.",
		interaction:
			"Keep static charts stable rather than animating every mount. If interaction reveals values, expose the same information to keyboard users and through a summary or data alternative. Respect reduced motion for supported transitions.",
		practices: [
			"Choose a chart for the question: trend, distribution, composition or comparison. State units and the time range explicitly.",
			"Use the shared chart palette and stable series identities. Do not encode meaning using color alone.",
			"Keep aggregation, formatting and domain rules in the application. Test empty, single-point and extreme-value data.",
			"Verify labels and tooltips at narrow widths. Provide an accessible summary or data table instead of relying on pointer hover.",
		],
	},
	block: {
		rationale:
			"Blocks are reusable application patterns rather than another primitive sizing category. PageHeader is a layout, ResourceList is a content surface and DeleteResource is an overlay composition; each inherits its underlying design rules.",
		geometry:
			"Compose the existing categories: control content uses .125rem to .5rem spacing, while card and layout boundaries use .75rem, 1rem, 1.5rem or 2rem. Keep page headings on the island and related content in natural-height surfaces. Do not add another scale for a preassembled pattern.",
		interaction:
			"The pattern coordinates existing control behavior; it must not reimplement hover, focus or opening motion. Application callbacks own navigation, persistence and destructive effects, including async success and failure.",
		practices: [
			"Start with the supported composition before building a custom page pattern. Avoid copying library internals into an example.",
			"Keep the primary create action last in the page heading and filters near the content they affect.",
			"For destructive operations, name the affected resource and preserve retry/cancel behavior when the operation fails.",
			"Treat catalog data as mock data. Connect business services in the ViewModel rather than turning the reusable block into a domain service.",
		],
	},
};
