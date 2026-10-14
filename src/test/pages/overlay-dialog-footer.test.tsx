import { readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { loadCatalogContentRecord } from "@/pages/ui/catalog-content-registry";

const catalogContent = await loadCatalogContentRecord();

describe("overlay dialog action footer", () => {
	it("keeps copied overlay source on the shared DialogFooter", () => {
		const family = readFileSync(
			path.join(process.cwd(), "src/pages/ui/catalog-content/families/overlay.tsx"),
			"utf8",
		);
		expect(family).not.toMatch(/function DialogFooter\(/);
		expect(family).toContain("function DialogActions(");
		expect(family).toContain("DialogFooter,");
		expect(family).toContain(
			'<DialogTitle className="min-w-0 wrap-anywhere">{title}</DialogTitle>',
		);
		expect(family).toContain(
			'<DialogTitle className="min-w-0 wrap-anywhere">Modal Title</DialogTitle>',
		);
	});

	it("renders Sizes and confirmation action rows with the shared 16px footer", () => {
		const sizes = catalogContent.dialog?.examples.find((item) => item.id === "dialog-sizes");
		expect(sizes).toBeDefined();
		if (!sizes) {
			return;
		}
		const SizesExample = sizes.render;
		const { unmount } = render(
			<MemoryRouter>
				<SizesExample />
			</MemoryRouter>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Small (288px)" }));
		const sizesFooter = screen.getByRole("dialog").querySelector(".mt-basalt-layout.flex");
		expect(sizesFooter).toBeTruthy();
		expect(sizesFooter).toHaveClass("gap-basalt-space-lg");
		expect(sizesFooter).not.toHaveClass("mt-basalt-space-lg");
		const sizesDialog = within(screen.getByRole("dialog"));
		expect(sizesDialog.getByRole("columnheader", { name: "Care plan" })).toHaveClass(
			"ps-basalt-table-edge",
		);
		expect(sizesDialog.getByRole("columnheader", { name: "Updated" })).toHaveClass(
			"pe-basalt-table-edge",
		);
		expect(sizesDialog.getByRole("cell", { name: "northwind-analytics" })).toHaveClass(
			"ps-basalt-table-edge",
		);
		expect(sizesDialog.getByRole("cell", { name: "Mon" })).toHaveClass("pe-basalt-table-edge");
		expect(sizes.code).toContain(
			'<TableHead className="ps-basalt-table-edge">Care plan</TableHead>',
		);
		expect(sizes.code).toContain('<TableHead className="pe-basalt-table-edge">Updated</TableHead>');
		expect(sizes.code).toContain(
			'<TableCell className="ps-basalt-table-edge">northwind-analytics</TableCell>',
		);
		expect(sizes.code).toContain('<TableCell className="pe-basalt-table-edge">Mon</TableCell>');
		unmount();
		const confirmation = catalogContent.dialog?.examples.find(
			(item) => item.id === "dialog-confirmation-dialog",
		);
		expect(confirmation).toBeDefined();
		if (!confirmation) {
			return;
		}
		const ConfirmationExample = confirmation.render;
		render(
			<MemoryRouter>
				<ConfirmationExample />
			</MemoryRouter>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Delete care plan" }));
		const confirmFooter = screen.getByRole("dialog").querySelector(".mt-basalt-layout.flex");
		expect(confirmFooter).toBeTruthy();
		expect(confirmFooter).not.toHaveClass("mt-basalt-space-lg");
		expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});

	it("lets dialog header titles shrink and wrap without clipping Close", () => {
		const basic = catalogContent.dialog?.examples.find((item) => item.id === "dialog-basic-dialog");
		const sizes = catalogContent.dialog?.examples.find((item) => item.id === "dialog-sizes");
		const actions = catalogContent.dialog?.examples.find(
			(item) => item.id === "dialog-with-actions",
		);
		expect(basic?.code).toContain(
			'<DialogTitle className="min-w-0 wrap-anywhere">Modal Title</DialogTitle>',
		);
		expect(sizes?.code).toContain(
			'<DialogTitle className="min-w-0 wrap-anywhere">{title}</DialogTitle>',
		);
		expect(actions?.code).toContain(
			'<DialogTitle className="min-w-0 wrap-anywhere">{title}</DialogTitle>',
		);
		expect(actions).toBeDefined();
		if (!actions) {
			return;
		}
		const ActionsExample = actions.render;
		render(
			<MemoryRouter>
				<ActionsExample />
			</MemoryRouter>,
		);
		fireEvent.click(screen.getByRole("button", { name: "Delete" }));
		const dialog = screen.getByRole("dialog");
		const title = within(dialog).getByRole("heading", { name: "Delete Resource?" });
		expect(title).toHaveClass("min-w-0", "wrap-anywhere", "text-basalt-3xl");
		expect(within(dialog).getByRole("button", { name: "Close" })).toHaveClass(
			"basalt-action-icon",
			"shrink-0",
		);
		expect(within(dialog).getByRole("button", { name: "Cancel" })).toBeInTheDocument();
		expect(within(dialog).getByRole("button", { name: "Delete" })).toBeInTheDocument();
	});
});
