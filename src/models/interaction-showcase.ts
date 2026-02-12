// Pure business logic for the Interaction Showcase page.
// No React dependency — fully testable with plain unit tests.

import type { ShowcaseToast, ShowcaseDialog, ToastVariant } from "@/models/types";

export function filterToastsByVariant(items: ShowcaseToast[], variant: ToastVariant): ShowcaseToast[] {
  return items.filter((t) => t.variant === variant);
}

export function filterDialogsByStyle(
  items: ShowcaseDialog[],
  style: ShowcaseDialog["style"],
): ShowcaseDialog[] {
  return items.filter((d) => d.style === style);
}

export function toastVariantLabel(variant: ToastVariant): string {
  const labels: Record<ToastVariant, string> = {
    default: "Default",
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Info",
  };
  return labels[variant];
}

export const ALL_TOAST_VARIANTS: ToastVariant[] = [
  "default",
  "success",
  "error",
  "warning",
  "info",
];
