import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Tabs, TabsList, TabsTrigger } from "./tabs";

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
});
