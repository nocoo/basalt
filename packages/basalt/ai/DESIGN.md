# Basalt Design Contract

This is the authoritative design contract for the library, catalog and copyable
examples. [INTEGRATION.md](INTEGRATION.md) describes composition and public APIs.
All dimensions below are reference CSS pixels at a 16px root font, not device
pixels or fixed-height limits. Respect browser font preferences and zoom.

## Visual direction

Simple, generous and worldly. Use precise alignment, confident type hierarchy,
matte material and readable proportions rather than scenic dashboard backgrounds,
decorative frames or empty hero heights. Reading pages and task interfaces have
different density; opening the page layout must not enlarge compact controls.

## Ownership and units

- Shared design values belong in `packages/basalt/src/styles/tokens.css` and are
  exposed identically by the Tailwind and standalone entrypoints. Components
  consume tokens; examples must not repair a component through private selectors.
- Use `rem` for lengths, unitless line-height for text, `em`/`lh` for text-relative
  geometry, and percentages, fractions and intrinsic sizing for layout. Do not
  set the root font-size to a pixel value.
- DOM measurements, SVG coordinates, data/chart dimensions, aspect ratios and
  caller-owned viewport constraints are geometry, not spacing. Measured CSS pixel
  coordinates are allowed for overlays; never round them to the spacing scale.
- Model/ViewModel code owns data, state and transitions. Geometry measurement is
  View-only; ViewModels do not import React Views or DOM APIs.

## Spacing

| Step | Token | Value | Reference |
| --- | --- | --- | --- |
| Extra small | `--basalt-space-xs` | `.125rem` | 2px |
| Small | `--basalt-space-sm` | `.25rem` | 4px |
| Medium | `--basalt-space-md` | `.375rem` | 6px |
| Large / default | `--basalt-space-lg`, `--basalt-space-default` | `.5rem` | 8px |

These four steps belong to control content: labels, icons, fields, actions,
selectable rows, menus and banners. They are not the maximum spacing for a page
or content surface. Card and layout boundaries use their own four-step roles:

| Step | Card token | Layout token | Value | Reference |
| --- | --- | --- | --- | --- |
| Small | `--basalt-space-card-sm` | `--basalt-space-layout-sm` | `.75rem` | 12px |
| Medium | `--basalt-space-card` | `--basalt-space-layout` | `1rem` | 16px |
| Large | `--basalt-space-card-lg` | `--basalt-space-layout-lg` | `1.5rem` | 24px |
| Extra large | `--basalt-space-card-xl` | `--basalt-space-layout-xl` | `2rem` | 32px |

Card padding defaults to medium. LayerCard header/footer insets are 16px horizontal
and 12px vertical; Body/Well use 16px. `padding="sm|md|lg|xl"` selects unstructured
card padding; structured cards keep their slot-owned insets. Compact composite
card panels use the same 16/12px panel aliases. Their internal buttons and rows
keep control spacing; do not stretch action rows to the card scale.

Layout grids default to medium (16px). ContentIsland owns 16px insets on mobile,
24px on tablets and 24px vertical / 32px horizontal from 1024px. The catalog shell
keeps 8px outside the island on mobile and 12px from 768px. Ordinary application
sections use 24px gaps, including catalog documentation. SectionRule
uses 12px content separation for compact labels and 16px for reading headings. `Grid gap="sm|md|lg|xl"`
and semantic utilities such as `gap-basalt-layout-xl` select these tiers.
There is no universal height for either category.

Dialog and AlertDialog panels use 16px outer insets on mobile and 24px from
640px. Their buttons and fields retain compact control spacing. Sheets and
small floating menus have separate inset contracts.

Metric cards use the shared `StatCard`, not a hand-built Header/Body split. A single
16px inset owns the title, value, comparison and supporting chart; 12px separates
the heading, metric and content groups, and 4px separates value/supporting text.
Keep the comparison next to the metric in reading order, before the chart. Icons
are small unboxed heading cues, not a second painted surface. Values use tabular
display numerals and wrap naturally. Compact trend plots use 4rem geometry, not
`flex-1` to fill the card; analytical charts with axes remain separate surfaces.
Show the time window and disclose a nonzero line-chart scale. Bar charts keep
their zero baseline. Metric cards have no internal divider or decorative border.

All nonzero padding, margin and gaps use the appropriate category scale or aliases.
Zero, auto margins and hairline seams are structural exceptions, not new density
levels. Negative margins may cancel an owned boundary, not invent a new gap.
Use `p-basalt-card`, `gap-basalt-layout`, `gap-basalt-space-sm`, etc. Default nav
insets and field gaps remain 8px. Selectable rows use 8px horizontal / 6px vertical
insets and an 8px icon gap. One component owns each boundary: nested sections must
not accidentally double outer padding. Indented detail content may derive its
alignment from the row inset + icon width + gap; this is not another density tier.

Existing numbered `--basalt-space-*` tokens are a geometry scale for icons,
media and shell widths. They are not an alternative margin/padding scale.

## Component categories and natural size

Choose a category before implementing a component. A composite's root and its
children can have different categories. Root module inventory:

| Category | Reference | Component modules |
| --- | --- | --- |
| Inline | 22px single line | `badge`, `tag-badge` |
| Action | 34px default | `button`, `input`, `select`, `toggle`, `toggle-group`, `segment-control`, `autocomplete`, `combobox`, `typeahead-field`, `sensitive-input`, `input-group`, `input-area`, `clipboard-text`, `inline-editable`, `multi-select`, `date-picker`, `icon-picker`, `tag-color-picker`, `theme-toggle`, `pagination`, `table-pager` |
| Banner | 38px single line | `banner`, `toast` |
| Card / content surface | Natural | `layer-card`, `approval-card`, `context-cards`, `recommendation-card`, `chat-bubble`, `code`, `empty`, `file-dropzone`, `resource-list`, `upload-queue` |
| Layout / composite | Natural | `accordion`, `collapsible`, `app-header`, `app-shell`, `sidebar`, `navigation-menu`, `editable-nav-item`, `breadcrumbs`, `page-header`, `section-rule`, `filter-bar`, `toolbar`, `grid`, `flow`, `field`, `description-list`, `table`, `data-table`, `diff-table`, `tabs`, `table-of-contents`, `responsive-master-detail`, `scroll-area`, `separator`, `stat-strip`, `chat-header`, `chat-inbox`, `chat-message`, `chat-markdown`, `chat-composer`, `prompt-bar`, `thinking`, `tool-chips`, `loading-screen` |
| Overlay composite | Natural; triggers/actions follow Action | `dialog`, `alert-dialog`, `confirm-dialog`, `delete-resource`, `sheet`, `dock`, `popover`, `hover-card`, `tooltip`, `dropdown-menu`, `context-menu`, `menu-bar`, `command-palette` |
| Graphic / text primitive | Content-specific | `avatar`, `basalt-mark`, `battery-meter`, `meter`, `loader`, `skeleton-line`, `text`, `label`, `link`, `checkbox`, `radio`, `switch`, `slider`, `fab` |

Graphic primitives preserve their intrinsic shape: a checkbox mark is not a
34px square and an avatar is not a text input. Their containing action rows use
the Action standard. Inline links retain surrounding typography. Floating and
mobile shell actions may use the shared 44px touch minimum for accessibility.
Charts use data geometry; their toolbars still follow Action and spacing rules.

The live catalog splits Components into Inline, Actions, Banners, Cards, Layouts,
Overlays and Primitives. Each begins with an Overview covering design reasoning,
geometry, interaction and best practices at `/ui/overview/<category>` (singular
category IDs). Nonvisual theme/link providers live with Layouts. Charts and Blocks
retain separate navigation groups and their own overviews; blocks still inherit
the root categories in the inventory above. Existing `/ui/<component>` URLs do
not change. Catalog navigation, filters and discovery share
`src/pages/ui/catalog-categories.ts`; guide content is application documentation,
not a separate set of component tokens or APIs.

The shared classes calculate natural size as follows:

- `basalt-inline`: 12px font, 16px line box + 2px padding each side + 1px border
  each side = 22px. Text wraps/grows rather than being clipped.
- `basalt-action`: 14px font, 24px line box + 4px vertical padding each side +
  1px border each side = 34px. Explicit `sm` (28px) and `lg` (40px) are shared
  size variants, not ad-hoc height utilities. Icon-only actions use a minimum
  derived from `1lh`, not a fixed height; icons are normally 14px.
- `basalt-banner`: 14px font, 22px line box + 8px padding each side = 38px.
  Descriptions, wrapping and actions can make a banner taller.
- Action rows: 22px text line (`--basalt-line-row`) + 6px vertical padding each
  side = 34px. Body prose/code retain the 20px line box. Compound inputs own one
  outer border; inset children do not add another. Segmented tracks keep 12px text
  on a 20px line box: 30px items + 2px track inset per side = 34px.
- Cards, dialogs and layout containers have no mandatory height. Textareas and
  chat inputs grow with content (chat: up to five lines, then scroll).

Do not use `height`, `max-height`, truncation or overflow clipping to force text
controls to a target. Use a line box, shared padding and optional minimums.
Constrain scroll regions, not their individual text rows. Long labels, loading
indicators, validation text and 200% text zoom must remain usable.

Reading surfaces such as code panels contain horizontal overflow without trapping
vertical page scrolling. Use axis-specific overscroll: contain X, allow Y to chain.
Natural-height code leaves vertical scrolling to its ancestor; height-constrained
code scrolls internally and hands off at its top/bottom boundary. Keep native wheel
and touch behavior instead of intercepting events or converting vertical deltas
into horizontal movement. Modal scroll locks and editable text inputs have separate
interaction contracts; do not change their containment as a global workaround.

## Radius, typography and color

- Radius choices: `--basalt-radius-sm` (.25rem), `-md` (.5rem), `-lg` (.75rem)
  and `-full` (pill/circle); `none` and `inherit` are structural choices. Widget,
  card and island aliases reference those choices; no per-component radii.
- Typography uses `--basalt-text-*` and `--basalt-leading-*`. Ordinary text is
  at least 11px reference, body/action 14px, code content 12px (`text-basalt-sm`),
  code panel titles 13px (`text-basalt-code`). Display headings use
  the shared larger scale. Do not shrink text to fit a fixed box.
- Surfaces preserve the matte L0/L1/L2/L3 hierarchy. Controls use the
  surface-relative control fill. Hover uses `--basalt-hover`,
  `--basalt-primary-hover` or `--basalt-destructive-hover`, not caller opacity.
- Semantic states, tags, data series and brand imagery may choose semantic
  palettes; keep foreground/background pairs and verify both themes. Centralize
  shared values rather than declaring hex colors in component classes. Site-only
  scenery tokens live in `src/styles/site-tokens.css`, not in reusable controls.

## Selection and navigation hierarchy

- Neutral selection uses `--basalt-selected` and `--basalt-selected-foreground`.
  Selected surfaces are brighter than their container (white in light mode, 22%
  lightness in dark mode), never the darker decorative `accent` or `muted` fill.
  Do not add decorative side bars, selection outlines, shadows or pseudo-element
  frames. Navigation uses foreground contrast and medium weight alongside fill;
  existing semantic checkmarks and tab underlines remain. Both primary and
  secondary text retain at least 4.5:1 contrast.
- Hover is transient and follows the configured primary. `--basalt-hover` and
  `--basalt-hover-end` are complete CSS colors, mixed against the theme popover
  surface at 9.6%/4.8% in light mode and 16%/9.6% in dark mode. Moving menu and command
  highlights use a subtle gradient between them, without decorative borders.
  SegmentControl and ToggleGroup selected items use `--basalt-primary` and its
  contrast-corrected foreground; they are accent controls, not neutral navigation.
  Neutral row selection retains its independent selected tokens.
  Selection remains painted on its own row when the shared hover layer moves
  elsewhere. The layer animates transforms, not a second React state per item.
  Multi-selection paints every selected row, not only the current hover target.
  Typeahead and command active descendants are transient candidates, not committed
  choices; retain their moving layer instead of painting an instant second fill.
- Use the component's `active`, `selected`, `value` or `pressed` API. Neutral
  Button variants honor `aria-pressed` / `aria-current`; application controls must
  expose that state instead of switching to a gray secondary variant alone.
  Checkbox/radio/switch glyphs, primary/destructive actions and semantic diff
  colors keep their semantic fills. Color swatches retain their actual palette.
- Keyboard focus is separate from selection. Navigation uses an inset focus ring
  so overflow and collapsed groups cannot clip it. Disabled controls retain
  subdued opacity and cannot become moving-hover targets; selection never lowers
  opacity or mutes its primary label.
- SidebarPartition is a major section label (12px, semibold, uppercase, 16px top
  spacing). SidebarGroup is a compact disclosure label (11px, semibold, uppercase,
  8px inset, 12px group separation), not a destination or hover-highlight target.
  Ordinary destinations use 14px text and the shared 8px/6px row insets. Groups
  preserve keyboard expansion and chevron motion; collapsed rails omit labels.
- Content wells use the actual surface hierarchy, not selected tokens or muted
  fills. Skeletons, progress tracks and decorative code marks may remain subdued.

## Motion and performance

Motion is on by default and owned by the component, never by a required example
prop. Use shared durations (120 / 180 / 280ms) and nonlinear
`cubic-bezier(.22, 1, .36, 1)` for interaction. Portal enter/exit and sheet motion
have dedicated shared duration/easing tokens. Continuous progress spinners may
use linear motion; decorative motion pauses off-screen/in background tabs.

- Prefer transform and opacity. Rotate disclosure chevrons and smoothly reveal
  content with the shared Radix measured-height animations. Avoid transition-all,
  animated blur on every hovered row, permanent will-change, or a timer per row.
- One moving hover background per list. Coalesce reads into one animation frame,
  do not remeasure the same row for pointer movement, and write geometry without
  React rerenders. Nested lists are isolated. Disabled and hidden rows cannot
  become targets; keyboard selection/focus works independently of pointer hover.
- Selection indicators snap to the first valid measured selection before paint.
  Never animate from `(0, 0)`, including controlled initial values, non-first
  segments, remounts or initially hidden panels. Animate only between established
  user selections. Resize/font/layout changes snap; redundant observer delivery
  must not interrupt an in-flight selection animation.
- Do not observe the moving highlight as content or respond to its own transition
  completion. Disconnect observers/listeners and cancel frames on unmount.
- `prefers-reduced-motion: reduce` disables spatial motion, entrance effects and
  shimmer without hiding content or delaying access. Keep exit nodes mounted
  through the primitive's closing state, and preserve focus restoration.

## Page composition

Application pages, including every catalog category overview, use the same
composition: `ContentIsland` owns the outside inset, `PageHeader` owns the page
title/actions/filters, `SectionRule` owns region headings, and `LayerCard` owns
content surfaces. The catalog's app-local `ShowcasePage` composes the header and
section gap. All routes under `DashboardLayout` use it, including missing/planned
catalog states and source viewers. Do not add a second `main`, viewport height,
page background, wrapper card or page padding inside the island. A bounded chat
workspace can use `h-full min-h-0`; it must not create a nested viewport.

Every catalog route uses the same ShowcasePage header: 30px display titles,
16px descriptions on a 24px line box, 8px title separation and a 65ch maximum
reading width. Page sections use 24px separation regardless of route category.
The standalone PageHeader API retains its size choices for consumers, but catalog
pages do not override the shared scale. ShowcasePage marks `variant="document"`
for the library index, category guides, component documentation and source viewers.
The shell owns the complete breadcrumb trail from Dashboard through the library,
category and component to the current route. Ancestors are links; the current
route appears once as nonlinked text with aria-current. Source views include their
component parent. Narrow headers keep every segment reachable by scrolling the
breadcrumb region without overflowing the page.
Document sections use `SectionRule variant="heading"`: 20px sentence-case
headings without the compact dashed rule. Component previews retain their own
scope; document typography must not cascade into copied controls. Headers have
natural height, no scenic wrappers, negative insets or fixed empty openings.

Scrollable gallery previews reserve 8px of internal space on every edge for
control rings, focus outlines and shadows. Padding outside the scroll viewport
does not protect that paint. Center previews safely so oversized content keeps
its leading edge reachable.
The component library uses one LayerCard per category, separated by 24px. Each
category uses LayerCard.Header above its grid, not individual cards per component.
Its light surface is white-toned; dark mode uses the same surface hierarchy rather
than a fixed white fill.

Cards with headings use `LayerCard.Header` and `LayerCard.Body`; use one Body for
related content with a shared internal gap, not a padded Body for every line.
Structured roots and slots must not receive extra outer padding or margins.
Unstructured cards select `padding` rather than overriding it with utilities.
Do not paint a fixed surface onto LayerCard or recreate cards with rounded,
painted divs. Use library controls and tables instead of rebuilding their spacing,
focus, selection and motion in page CSS. Semantic color overrides and purposeful
chart/canvas geometry remain separate from shared control geometry.

### Container boundary ownership

Choose the boundary before choosing a spacing token. A valid token on the wrong
owner is still a design error:

| Boundary | Owner | Composition |
| --- | --- | --- |
| Page/region separation | `ShowcasePage` / `SectionRule` | Layout gaps, no second page inset |
| Painted content or navigation panel | `LayerCard` | Header and Body slots, never an unpadded painted div |
| Full-width disclosure heading | `LayerCard.Header asChild` | Slot onto `CollapsibleTrigger`; one hit target, 16/12px insets |
| Expanded prose or fields | `LayerCard.Body` | Inside `CollapsibleContent unstyled`; one 16px inset |
| Attached code | `CodeBlock attached` / `CodeHighlighted attached` | Direct child of unstyled disclosure; code owns its 16/12px insets |
| Edge-to-edge table/list | Its row/cell components | Direct card child; no Body with `p-0` or compensating margins |
| Compact status/action strip | `Banner` | Control spacing, not a hand-drawn card |

Collapsible owns visibility, focus semantics and motion; it does not add another
surface. Its default inset is for plain standalone text. Use `unstyled` when a
child already owns spacing. Compose a full collapsible card as `Collapsible asChild`
around `LayerCard`, keeping Header directly under the card so slot detection works.
Never bury all card slots inside an opaque wrapper and rely on inferred padding.

Do not use native details/summary for dashboard or catalog disclosures; they bypass
the shared inset and motion contracts. The independent public landing FAQ remains
a deliberate no-JavaScript exception. Example preview, disclosure label, code title
and source text must align to the same horizontal inset. Attached code selects a
public prop, not caller border/radius/padding overrides. Sticky placement wrappers
own only position; their panel owns its background and inset.

Landing, login, loading, error, static documents and full-page layout recipes keep
their independent root contracts; do not apply dashboard chrome to them. The landing
route additionally owns its marketing spacing, radius and display type scale, which
the compact global tiers cannot express; its CSS is exempt from those token rules and
keeps motion tokens only. Explicit
specialist controls remain in the palette demos: color swatches and native color
pickers display the colors being edited. Hidden file inputs and theme-preview
radio inputs preserve native form behavior. These exceptions are not permission
to recreate ordinary actions, selects or inputs.

## Enforcement and acceptance

`bun run design:check` scans library components/helpers and catalog examples,
including CSS, for raw spacing/type/radius/motion values, fixed action overrides
and inline design repairs. The landing route's own CSS is exempt from the spacing,
radius and type rules and still keeps motion tokens. It derives dashboard page requirements from App routes
and checks template ownership, duplicate slot spacing, recreated card surfaces,
ordinary native controls in pages and page-level control padding overrides.
It rejects compact control padding on content panels, raw application disclosures,
duplicate disclosure/body insets, zero-padding card-slot repairs and code-frame CSS
overrides. Navigation rows, tooltips and decorative marks retain their own roles.
Structural checks inspect JSX, not illustrative source strings. It also checks
this category inventory. It runs in
`.husky/pre-push`, **not** in dev, build or pre-commit. Unit tests exercise isolated
rule fixtures only; they do not run the full repository scan.

Static checking is a guard, not proof of appearance. Acceptance also requires
Tailwind and standalone builds, strict types/lint, unit coverage, keyboard and
reduced-motion behavior, both themes, narrow screens, wrapped text and enlarged
root fonts. Browser tests measure actual geometry and animation state; changing
class-name assertions alone does not certify visual correctness. Do not claim
browser acceptance when the environment cannot run it.
