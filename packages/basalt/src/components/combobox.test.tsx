import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxOption } from "./combobox";

const FRAMEWORKS: ComboboxOption[] = [
	{
		value: "next",
		label: "Next.js",
		description: "React full-stack framework",
		keywords: ["vercel", "ssr"],
		leading: <span data-testid="lead-next">N</span>,
	},
	{ value: "vite", label: "Vite", keywords: ["bundler"] },
	{ value: "astro", label: "Astro", disabled: true },
	{ value: "remix", label: "Remix" },
];

describe("Combobox", () => {
	beforeAll(() => {
		Element.prototype.scrollIntoView = vi.fn();
		if (typeof globalThis.ResizeObserver === "undefined") {
			globalThis.ResizeObserver = class {
				observe() {}
				unobserve() {}
				disconnect() {}
			};
		}
	});

	it("supports single selection, search filtering, keywords, and ref forwarding", async () => {
		const ref = createRef<HTMLButtonElement>();
		const onValueChange = vi.fn();
		render(
			<Combobox
				ref={ref}
				id="framework-picker"
				label="Framework"
				placeholder="Pick a framework"
				options={FRAMEWORKS}
				onValueChange={onValueChange}
				aria-invalid="true"
				aria-describedby="framework-hint"
			/>,
		);

		const trigger = screen.getByRole("combobox", { name: "Framework" });
		expect(ref.current).toBe(trigger);
		expect(trigger).toHaveAttribute("id", "framework-picker");
		expect(trigger).toHaveAttribute("aria-invalid", "true");
		expect(trigger).toHaveAttribute("aria-describedby", "framework-hint");
		expect(trigger).toHaveTextContent("Pick a framework");

		fireEvent.click(trigger);
		const searchInput = await screen.findByRole("combobox", { name: "Framework: search" });
		expect(screen.getByTestId("lead-next")).toBeInTheDocument();
		expect(screen.getByText("React full-stack framework")).toBeInTheDocument();

		fireEvent.change(searchInput, { target: { value: "vercel" } });
		await waitFor(() => {
			expect(screen.getByRole("option", { name: /Next\.js/ })).toBeInTheDocument();
			expect(screen.queryByRole("option", { name: /Vite/ })).not.toBeInTheDocument();
		});

		fireEvent.click(screen.getByRole("option", { name: /Next\.js/ }));
		expect(onValueChange).toHaveBeenCalledWith("next");
		expect(trigger).toHaveTextContent("Next.js");
		await waitFor(() => {
			expect(screen.queryByRole("combobox", { name: "Framework: search" })).not.toBeInTheDocument();
		});
	});

	it("supports multi-select toggling, summary display, and clearable reset", async () => {
		const onValueChange = vi.fn();
		render(
			<Combobox
				multiple
				clearable
				label="Targets"
				defaultValue={["vite"]}
				options={FRAMEWORKS}
				onValueChange={onValueChange}
			/>,
		);

		const trigger = screen.getByRole("combobox", { name: "Targets" });
		expect(trigger).toHaveTextContent("Vite");

		fireEvent.click(trigger);
		fireEvent.click(await screen.findByRole("option", { name: /Next\.js/ }));
		expect(onValueChange).toHaveBeenLastCalledWith(["vite", "next"]);
		expect(trigger).toHaveTextContent("Vite, Next.js");

		fireEvent.click(screen.getByRole("option", { name: /Remix/ }));
		expect(onValueChange).toHaveBeenLastCalledWith(["vite", "next", "remix"]);
		expect(trigger).toHaveTextContent("3 selected");

		fireEvent.click(screen.getByRole("option", { name: /Next\.js/ }));
		expect(onValueChange).toHaveBeenLastCalledWith(["vite", "remix"]);

		fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
		expect(onValueChange).toHaveBeenLastCalledWith([]);
		expect(trigger).toHaveTextContent("Select option…");
	});

	it("supports controlled search, loading state, empty message, and disabled state", async () => {
		const onSearchChange = vi.fn();
		const onValueChange = vi.fn();
		const { rerender } = render(
			<Combobox
				label="Packages"
				options={FRAMEWORKS}
				value="next"
				search="abc"
				onSearchChange={onSearchChange}
				shouldFilter={false}
				loading
				loadingLabel="Searching packages…"
				clearable
				size="lg"
				defaultOpen
				onValueChange={onValueChange}
			/>,
		);

		expect(screen.getByRole("combobox", { name: "Packages" })).toHaveClass("basalt-action-lg");
		expect(screen.getByRole("status")).toHaveTextContent("Searching packages…");

		const searchInput = screen.getByRole("combobox", { name: "Packages: search" });
		fireEvent.change(searchInput, { target: { value: "xyz" } });
		expect(onSearchChange).toHaveBeenCalledWith("xyz");

		fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
		expect(onValueChange).toHaveBeenCalledWith("");

		rerender(
			<Combobox
				label="Packages"
				options={[]}
				emptyLabel="Nothing matches."
				defaultOpen
				size="sm"
			/>,
		);
		expect(screen.getByRole("combobox", { name: "Packages" })).toHaveClass("basalt-action-sm");
		expect(screen.getByText("Nothing matches.")).toBeInTheDocument();

		rerender(
			<Combobox label="Packages" options={FRAMEWORKS} value={["next"]} disabled clearable />,
		);
		expect(screen.getByRole("combobox", { name: "Packages" })).toBeDisabled();
		expect(screen.queryByRole("button", { name: "Clear selection" })).not.toBeInTheDocument();
	});

	it("ignores disabled options and supports fallback values and controlled open", () => {
		const onValueChange = vi.fn();
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<Combobox
				options={FRAMEWORKS}
				open
				onOpenChange={onOpenChange}
				defaultValue=""
				onValueChange={onValueChange}
			/>,
		);

		const disabledOption = screen.getByRole("option", { name: "Astro" });
		expect(disabledOption).toHaveAttribute("aria-disabled", "true");
		fireEvent.click(disabledOption);
		expect(onValueChange).not.toHaveBeenCalled();

		fireEvent.keyDown(screen.getByRole("combobox", { name: "Select option…: search" }), {
			key: "Escape",
		});
		expect(onOpenChange).toHaveBeenCalledWith(false);

		rerender(<Combobox label="Framework" options={FRAMEWORKS} value="custom-id" />);
		expect(screen.getByRole("combobox", { name: "Framework" })).toHaveTextContent("custom-id");

		rerender(<Combobox label="Single array" options={FRAMEWORKS} value={["vite"]} />);
		expect(screen.getByRole("combobox", { name: "Single array" })).toHaveTextContent("Vite");
	});
});
