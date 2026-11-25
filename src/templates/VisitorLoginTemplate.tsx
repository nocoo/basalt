"use client";

import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Switch } from "@nocoo/basalt/components/switch";
import { Mountain } from "lucide-react";
import { useState } from "react";

export const VISITOR_LOGIN_CONFIG = {
	brandName: "Northstar",
	title: "Welcome back",
	subtitle: "Sign in to your workspace.",
	footerNote: "Demo only · no information leaves this page",
} as const;

export default function VisitorLoginTemplate() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [twoFactor, setTwoFactor] = useState(false);
	const [code, setCode] = useState("");
	const [feedback, setFeedback] = useState<{ tone: "error" | "success"; text: string } | null>(
		null,
	);

	return (
		<main
			data-basalt-surface-root=""
			className="flex min-h-dvh items-center justify-center bg-basalt-background p-basalt-layout"
		>
			<LayerCard padding="none" className="w-full overflow-hidden" style={{ maxWidth: "18rem" }}>
				<div
					id="login-brand"
					className="flex items-center gap-basalt-space-lg bg-basalt-primary px-basalt-card py-basalt-card-sm text-basalt-primary-foreground"
				>
					<Mountain className="size-basalt-icon-lg" aria-hidden="true" />
					<span className="font-semibold">{VISITOR_LOGIN_CONFIG.brandName}</span>
				</div>
				<LayerCard.Body id="login-form" className="space-y-basalt-card">
					<div>
						<h1 className="text-basalt-xl font-semibold">{VISITOR_LOGIN_CONFIG.title}</h1>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							{VISITOR_LOGIN_CONFIG.subtitle}
						</p>
					</div>
					<form
						className="space-y-basalt-card-sm"
						onSubmit={(event) => {
							event.preventDefault();
							setFeedback(
								twoFactor && code !== "123456"
									? { tone: "error", text: "Enter the demo verification code 123456." }
									: { tone: "success", text: "Demo verified. No credentials were sent." },
							);
						}}
					>
						<div className="space-y-basalt-space-md">
							<Label htmlFor="visitor-email">Email</Label>
							<Input
								id="visitor-email"
								name="username"
								type="email"
								required
								autoComplete="username"
								autoCorrect="off"
								autoCapitalize="none"
								spellCheck={false}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>
						<div className="space-y-basalt-space-md">
							<Label htmlFor="visitor-password">Password</Label>
							<Input
								id="visitor-password"
								name="password"
								type="password"
								required
								autoComplete="current-password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
						</div>
						<div className="flex items-center justify-between gap-basalt-space-lg">
							<Label htmlFor="visitor-two-factor">Use verification code</Label>
							<Switch id="visitor-two-factor" checked={twoFactor} onCheckedChange={setTwoFactor} />
						</div>
						{twoFactor && (
							<div className="space-y-basalt-space-md">
								<Label htmlFor="visitor-code">Verification code</Label>
								<Input
									id="visitor-code"
									name="code"
									inputMode="numeric"
									autoComplete="one-time-code"
									aria-invalid={feedback?.tone === "error" || undefined}
									value={code}
									onChange={(event) => setCode(event.target.value)}
								/>
							</div>
						)}
						<Button type="submit" className="w-full">
							Sign in
						</Button>
						{feedback?.tone === "error" ? (
							<p role="alert" className="text-basalt-sm text-basalt-danger">
								{feedback.text}
							</p>
						) : feedback?.tone === "success" ? (
							<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
								{feedback.text}
							</p>
						) : null}
					</form>
				</LayerCard.Body>
				<LayerCard.Footer id="login-footer">
					<p className="text-basalt-xs text-basalt-muted-foreground">
						{VISITOR_LOGIN_CONFIG.footerNote}
					</p>
				</LayerCard.Footer>
			</LayerCard>
		</main>
	);
}
