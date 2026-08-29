import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
	it("renders header, body, and footer", () => {
		render(
			<Card>
				<CardHeader>
					<CardTitle>Credentials</CardTitle>
					<CardDescription>Sign in to continue</CardDescription>
				</CardHeader>
				<CardContent>Form</CardContent>
				<CardFooter>Actions</CardFooter>
			</Card>,
		);
		expect(screen.getByText("Credentials")).toBeInTheDocument();
		expect(screen.getByText("Sign in to continue")).toBeInTheDocument();
		expect(screen.getByText("Form")).toBeInTheDocument();
		expect(screen.getByText("Actions")).toBeInTheDocument();
	});
});
