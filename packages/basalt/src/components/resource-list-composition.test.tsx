import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ResourceList } from "./resource-list";

it("composes resource regions and preserves zero-valued state overrides", () => {
	const { rerender } = render(
		<ResourceList
			title="Projects"
			data={[]}
			header={<h2>Custom heading</h2>}
			toolbar={<button type="button">Search</button>}
			filters="Active only"
			bulkActions="2 selected"
			footer="Page 1"
			className="workspace"
		>
			<p>Custom results</p>
		</ResourceList>,
	);
	for (const text of [
		"Custom heading",
		"Search",
		"Active only",
		"2 selected",
		"Page 1",
		"Custom results",
	])
		expect(screen.getByText(text)).toBeVisible();
	expect(screen.queryByRole("table")).not.toBeInTheDocument();
	rerender(
		<ResourceList title="Projects" data={[]} state={0}>
			<p>Hidden results</p>
		</ResourceList>,
	);
	expect(screen.getByText("0")).toBeVisible();
	expect(screen.queryByText("Hidden results")).not.toBeInTheDocument();
});

it("supports default result loading, errors and retry while retaining the old data API", () => {
	const retry = vi.fn();
	const data = [{ name: "Atlas", status: "Active" }];
	const { rerender } = render(<ResourceList title="Projects" data={data} loading />);
	expect(screen.getByRole("status")).toHaveTextContent("Loading");
	rerender(<ResourceList title="Projects" data={data} error="Unavailable" onRetry={retry} />);
	fireEvent.click(screen.getByRole("button", { name: "Try again" }));
	expect(retry).toHaveBeenCalledOnce();
	rerender(<ResourceList title="Projects" data={data} />);
	expect(screen.getByText("Atlas")).toBeVisible();
});
