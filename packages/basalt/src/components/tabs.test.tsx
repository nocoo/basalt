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
	});
});
