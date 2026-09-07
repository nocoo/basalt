"use client";

import { Button } from "@nocoo/basalt/components/button";
import { useEffect, useState } from "react";
import AppFrame from "./recipe-modules/recipe-app-frame";
import Login, { LoginForm } from "./recipe-modules/recipe-login";
import Resources from "./recipe-modules/recipe-resources";

function LoginAbortProbe() {
	const [visible, setVisible] = useState(true);
	const [calls, setCalls] = useState(0);
	const [aborted, setAborted] = useState(false);
	const [success, setSuccess] = useState(false);
	return (
		<main style={{ padding: 24 }}>
			{visible && (
				<LoginForm
					onSuccess={() => setSuccess(true)}
					authenticate={(_, signal) => {
						setCalls((count) => count + 1);
						return new Promise<void>((_, reject) =>
							signal.addEventListener(
								"abort",
								() => {
									setAborted(true);
									reject(new Error("Aborted"));
								},
								{ once: true },
							),
						);
					}}
				/>
			)}
			<Button onClick={() => setVisible(false)}>Unmount login</Button>
			<p data-testid="auth-calls">{calls}</p>
			<p data-testid="auth-aborted">{String(aborted)}</p>
			<p data-testid="auth-success">{String(success)}</p>
		</main>
	);
}
export default function RecipesApp() {
	const [recipe, setRecipe] = useState<string | null>(null);
	useEffect(() => {
		setRecipe(new URLSearchParams(location.search).get("recipe") ?? "app-frame");
	}, []);
	if (!recipe) return null;
	return (
		<div data-recipe-mounted={recipe}>
			{recipe === "app-frame" ? (
				<AppFrame />
			) : recipe === "login" ? (
				<Login />
			) : recipe === "resources" ? (
				<Resources />
			) : (
				<LoginAbortProbe />
			)}
		</div>
	);
}
