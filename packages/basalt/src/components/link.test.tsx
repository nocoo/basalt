import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LinkProvider } from "../providers/link";
import { Link, type LinkProps } from "./link";

function acceptLinkProps(_props: LinkProps) {}

describe("Link", () => {
	it("renders a default provider anchor", () => {
		render(
			<LinkProvider>
				<Link href="/docs">Docs</Link>
			</LinkProvider>,
		);
		const link = screen.getByRole("link", { name: "Docs" });
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "/docs");
		expect(link).toHaveClass("text-basalt-primary", "underline-offset-4", "hover:underline");
	});

	it("merges className onto the default anchor", () => {
		render(
			<LinkProvider>
				<Link href="/docs" className="extra">
					Docs
				</Link>
			</LinkProvider>,
		);
		expect(screen.getByRole("link", { name: "Docs" })).toHaveClass(
			"text-basalt-primary",
			"underline-offset-4",
			"hover:underline",
			"extra",
		);
	});

	it("forwards href, target, rel, data, ARIA, and events", () => {
		const onClick = vi.fn();
		render(
			<LinkProvider>
				<Link
					href="/docs"
					target="_blank"
					rel="noreferrer"
					data-router="custom"
					aria-label="Docs"
					onClick={onClick}
				>
					Docs
				</Link>
			</LinkProvider>,
		);
		const link = screen.getByRole("link", { name: "Docs" });
		expect(link).toHaveAttribute("href", "/docs");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noreferrer");
		expect(link).toHaveAttribute("data-router", "custom");
		expect(link).toHaveAttribute("aria-label", "Docs");
		fireEvent.click(link);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("requires href and accepts native plus custom keys", () => {
		acceptLinkProps({ href: "/docs" });
		acceptLinkProps({
			href: "/docs",
			className: "extra",
			target: "_blank",
			rel: "noreferrer",
			download: "file",
			onClick: () => undefined,
			"aria-label": "Docs",
			"data-router": "custom",
		});
		// @ts-expect-error href is required
		acceptLinkProps({});
	});
});
