import type React from "react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import {
	Button,
	Field,
	Input,
	LayerCard,
	Switch,
	ThemeProvider,
} from "../../../packages/basalt/src";
import { DatePicker } from "../../../packages/basalt/src/components/date-picker";

function QuickstartApp() {
	return (
		<ThemeProvider>
			<LayerCard>
				<LayerCard.Header>
					<span className="font-semibold text-basalt-foreground">Overview</span>
				</LayerCard.Header>
				<LayerCard.Body>
					<Input placeholder="Project Name" aria-label="Project Name" />
					<DatePicker aria-label="Target Date" />
					<Button variant="default">Submit</Button>
				</LayerCard.Body>
			</LayerCard>
		</ThemeProvider>
	);
}

function ProfileForm() {
	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		const email = data.get("email");
		const notifications = data.get("notifications") === "on";
		console.log({ email, notifications });
	};

	return (
		<form onSubmit={handleSubmit}>
			<Field label="Email" hint="Your primary email address">
				<Input name="email" type="email" required />
			</Field>

			<Field label="Notifications">
				<Switch name="notifications" defaultChecked />
			</Field>

			<div className="mt-4 flex gap-2">
				<Button type="reset" variant="secondary">
					Reset
				</Button>
				<Button type="submit" variant="default">
					Save Changes
				</Button>
			</div>
		</form>
	);
}

function ControlledDatePickerField() {
	const [selectedDate, setSelectedDate] = useState<string>("2026-09-01");

	return <DatePicker value={selectedDate} onChange={setSelectedDate} aria-label="Target Date" />;
}

describe("documentation recipes", () => {
	it("compiles and executes QuickstartApp, ProfileForm, and ControlledDatePickerField", () => {
		expect(typeof QuickstartApp).toBe("function");
		expect(typeof ProfileForm).toBe("function");
		expect(typeof ControlledDatePickerField).toBe("function");
	});
});
