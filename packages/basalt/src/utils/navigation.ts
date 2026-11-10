import { FOCUS_INSET } from "../components/overlay";

export const NAV_LIST_CLASS = "basalt-ui basalt-hover-list basalt-nav-list flex gap-basalt-nav-gap";

export const NAV_ROW_CLASS =
	"flex min-w-0 shrink-0 min-h-basalt-control items-center gap-basalt-row-gap rounded-basalt-md px-basalt-row-x py-basalt-row-y text-left text-basalt-base font-normal leading-basalt-row [&>svg]:size-basalt-icon-lg [&>svg]:shrink-0";

export const NAV_ITEM_CLASS = `basalt-ui basalt-nav-item ${NAV_ROW_CLASS} ${FOCUS_INSET}`;
