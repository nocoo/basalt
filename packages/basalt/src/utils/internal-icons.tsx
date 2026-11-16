import { type ComponentProps, forwardRef, type ReactNode } from "react";

type InternalIconProps = Omit<ComponentProps<"svg">, "children"> & {
	size?: number | string;
};

function createIcon(name: string, content: ReactNode) {
	// biome-ignore lint/correctness/noComponentHookFactories: static icon components are created once at module initialization
	const Icon = forwardRef<SVGSVGElement, InternalIconProps>(function InternalIcon(
		{
			size = 24,
			strokeWidth = 1.5,
			className,
			"aria-label": ariaLabel,
			"aria-labelledby": ariaLabelledBy,
			"aria-hidden": ariaHidden,
			...props
		},
		ref,
	) {
		return (
			<svg
				viewBox="0 0 24 24"
				width={size}
				height={size}
				fill="none"
				stroke="currentColor"
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				{...props}
				ref={ref}
				className={`lucide lucide-${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).slice(1)} ${className ?? ""}`.trim()}
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-hidden={
					ariaHidden ?? (ariaLabel === undefined && ariaLabelledBy === undefined ? true : undefined)
				}
			>
				{content}
			</svg>
		);
	});
	Icon.displayName = name;
	return Icon;
}

export const ArrowDown = /* @__PURE__ */ createIcon(
	"ArrowDown",
	<>
		<path d="M12 5v14" />
		<path d="m19 12-7 7-7-7" />
	</>,
);
export const ArrowLeft = /* @__PURE__ */ createIcon(
	"ArrowLeft",
	<>
		<path d="m12 19-7-7 7-7" />
		<path d="M19 12H5" />
	</>,
);
export const ArrowUp = /* @__PURE__ */ createIcon(
	"ArrowUp",
	<>
		<path d="m5 12 7-7 7 7" />
		<path d="M12 19V5" />
	</>,
);
export const ArrowUpDown = /* @__PURE__ */ createIcon(
	"ArrowUpDown",
	<>
		<path d="m21 16-4 4-4-4" />
		<path d="M17 20V4" />
		<path d="m3 8 4-4 4 4" />
		<path d="M7 4v16" />
	</>,
);
export const Check = /* @__PURE__ */ createIcon("Check", <path d="M20 6 9 17l-5-5" />);
export const ChevronDown = /* @__PURE__ */ createIcon("ChevronDown", <path d="m6 9 6 6 6-6" />);
export const ChevronLeft = /* @__PURE__ */ createIcon("ChevronLeft", <path d="m15 18-6-6 6-6" />);
export const ChevronRight = /* @__PURE__ */ createIcon("ChevronRight", <path d="m9 18 6-6-6-6" />);
export const ChevronUp = /* @__PURE__ */ createIcon("ChevronUp", <path d="m18 15-6-6-6 6" />);
export const ChevronsLeft = /* @__PURE__ */ createIcon(
	"ChevronsLeft",
	<>
		<path d="m11 17-5-5 5-5" />
		<path d="m18 17-5-5 5-5" />
	</>,
);
export const ChevronsRight = /* @__PURE__ */ createIcon(
	"ChevronsRight",
	<>
		<path d="m6 17 5-5-5-5" />
		<path d="m13 17 5-5-5-5" />
	</>,
);
export const Circle = /* @__PURE__ */ createIcon("Circle", <circle cx="12" cy="12" r="10" />);
export const CircleAlert = /* @__PURE__ */ createIcon(
	"CircleAlert",
	<>
		<circle cx="12" cy="12" r="10" />
		<line x1="12" x2="12" y1="8" y2="12" />
		<line x1="12" x2="12.01" y1="16" y2="16" />
	</>,
);
export const Copy = /* @__PURE__ */ createIcon(
	"Copy",
	<>
		<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
		<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
	</>,
);
export const Eye = /* @__PURE__ */ createIcon(
	"Eye",
	<>
		<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
		<circle cx="12" cy="12" r="3" />
	</>,
);
export const EyeOff = /* @__PURE__ */ createIcon(
	"EyeOff",
	<>
		<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
		<path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
		<path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
		<path d="m2 2 20 20" />
	</>,
);
export const FileCode2 = /* @__PURE__ */ createIcon(
	"FileCode2",
	<>
		<path d="M4 12.15V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-3.35" />
		<path d="M14 2v5a1 1 0 0 0 1 1h5" />
		<path d="m5 16-3 3 3 3" />
		<path d="m9 22 3-3-3-3" />
	</>,
);
export const FileText = /* @__PURE__ */ createIcon(
	"FileText",
	<>
		<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
		<path d="M14 2v5a1 1 0 0 0 1 1h5" />
		<path d="M10 9H8" />
		<path d="M16 13H8" />
		<path d="M16 17H8" />
	</>,
);
export const Folder = /* @__PURE__ */ createIcon(
	"Folder",
	<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />,
);
export const Info = /* @__PURE__ */ createIcon(
	"Info",
	<>
		<circle cx="12" cy="12" r="10" />
		<path d="M12 16v-4" />
		<path d="M12 8h.01" />
	</>,
);
export const Loader2 = /* @__PURE__ */ createIcon(
	"Loader2",
	<path d="M21 12a9 9 0 1 1-6.219-8.56" />,
);
export const LogOut = /* @__PURE__ */ createIcon(
	"LogOut",
	<>
		<path d="m16 17 5-5-5-5" />
		<path d="M21 12H9" />
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
	</>,
);
export const Menu = /* @__PURE__ */ createIcon(
	"Menu",
	<>
		<path d="M4 5h16" />
		<path d="M4 12h16" />
		<path d="M4 19h16" />
	</>,
);
export const Minus = /* @__PURE__ */ createIcon("Minus", <path d="M5 12h14" />);
export const Monitor = /* @__PURE__ */ createIcon(
	"Monitor",
	<>
		<rect width="20" height="14" x="2" y="3" rx="2" />
		<line x1="8" x2="16" y1="21" y2="21" />
		<line x1="12" x2="12" y1="17" y2="21" />
	</>,
);
export const Moon = /* @__PURE__ */ createIcon(
	"Moon",
	<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />,
);
export const PanelLeft = /* @__PURE__ */ createIcon(
	"PanelLeft",
	<>
		<rect width="18" height="18" x="3" y="3" rx="2" />
		<path d="M9 3v18" />
	</>,
);
export const Pencil = /* @__PURE__ */ createIcon(
	"Pencil",
	<>
		<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
		<path d="m15 5 4 4" />
	</>,
);
export const RotateCcw = /* @__PURE__ */ createIcon(
	"RotateCcw",
	<>
		<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
		<path d="M3 3v5h5" />
	</>,
);
export const Search = /* @__PURE__ */ createIcon(
	"Search",
	<>
		<path d="m21 21-4.34-4.34" />
		<circle cx="11" cy="11" r="8" />
	</>,
);
export const Sun = /* @__PURE__ */ createIcon(
	"Sun",
	<>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2" />
		<path d="M12 20v2" />
		<path d="m4.93 4.93 1.41 1.41" />
		<path d="m17.66 17.66 1.41 1.41" />
		<path d="M2 12h2" />
		<path d="M20 12h2" />
		<path d="m6.34 17.66-1.41 1.41" />
		<path d="m19.07 4.93-1.41 1.41" />
	</>,
);
export const Trash2 = /* @__PURE__ */ createIcon(
	"Trash2",
	<>
		<path d="M10 11v6" />
		<path d="M14 11v6" />
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</>,
);
export const TriangleAlert = /* @__PURE__ */ createIcon(
	"TriangleAlert",
	<>
		<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
		<path d="M12 9v4" />
		<path d="M12 17h.01" />
	</>,
);
export const Upload = /* @__PURE__ */ createIcon(
	"Upload",
	<>
		<path d="M12 3v12" />
		<path d="m17 8-5-5-5 5" />
		<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
	</>,
);
export const X = /* @__PURE__ */ createIcon(
	"X",
	<>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</>,
);
