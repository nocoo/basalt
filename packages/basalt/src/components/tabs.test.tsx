import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

describe("Tabs", () => {
	it("renders tab triggers", () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(screen.getByRole("tab", { name: "Home" })).toBeInTheDocument();
	});

	it("renders tab panels", () => {
		render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
				<TabsContent value="a">Home panel</TabsContent>
				<TabsContent value="b">About panel</TabsContent>
			</Tabs>,
		);
		expect(screen.getByText("Home panel")).toBeInTheDocument();
		expect(screen.getByText("Home panel").className).toContain("animate-basalt-tab-in");
	});

	it("renders a sliding active indicator", () => {
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList>
					<TabsTrigger value="a">Home</TabsTrigger>
					<TabsTrigger value="b">About</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
	});

	it("can hide the sliding indicator", () => {
		const { container } = render(
			<Tabs defaultValue="a">
				<TabsList showIndicator={false}>
					<TabsTrigger value="a">Home</TabsTrigger>
				</TabsList>
			</Tabs>,
		);
		expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
	});
});
