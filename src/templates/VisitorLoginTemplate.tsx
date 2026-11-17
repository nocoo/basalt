import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { Label } from "@nocoo/basalt/components/label";
import { LayerCard } from "@nocoo/basalt/components/layer-card";
import { Switch } from "@nocoo/basalt/components/switch";
import { Mountain } from "lucide-react";
import { useState } from "react";

export default function VisitorLoginTemplate() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [twoFactor, setTwoFactor] = useState(false);
	const [code, setCode] = useState("");
	const [message, setMessage] = useState("");

	return (
		<main
			data-basalt-surface-root=""
			className="flex min-h-screen items-center justify-center bg-basalt-background p-basalt-layout"
		>
			<LayerCard padding="none" className="w-full max-w-[18rem] overflow-hidden">
				<div className="flex items-center gap-basalt-space-lg bg-basalt-primary px-basalt-card py-basalt-card-sm text-basalt-primary-foreground">
					<Mountain className="size-basalt-icon-lg" strokeWidth={1.5} />
					<span className="font-semibold">Northstar</span>
				</div>
				<LayerCard.Body className="space-y-basalt-card">
					<div>
						<h1 className="text-basalt-xl font-semibold">Welcome back</h1>
						<p className="text-basalt-sm text-basalt-muted-foreground">
							Sign in to your workspace.
						</p>
					</div>
					<form
						className="space-y-basalt-card-sm"
						onSubmit={(event) => {
							event.preventDefault();
							setMessage(
								twoFactor && code !== "123456"
									? "Enter the demo verification code 123456."
									: "Demo verified. No credentials were sent.",
							);
						}}
					>
						<div className="space-y-basalt-space-md">
							<Label htmlFor="visitor-email">Email</Label>
							<Input
								id="visitor-email"
								type="email"
								required
								autoComplete="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
							/>
						</div>
						<div className="space-y-basalt-space-md">
							<Label htmlFor="visitor-password">Password</Label>
							<Input
								id="visitor-password"
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
									inputMode="numeric"
									value={code}
									onChange={(event) => setCode(event.target.value)}
								/>
							</div>
						)}
						<Button type="submit" className="w-full">
							Sign in
						</Button>
						{message && (
							<p role="status" className="text-basalt-sm text-basalt-muted-foreground">
								{message}
							</p>
						)}
					</form>
				</LayerCard.Body>
				<LayerCard.Footer>
					<p className="text-basalt-xs text-basalt-muted-foreground">
						Demo only · no information leaves this page
					</p>
				</LayerCard.Footer>
			</LayerCard>
		</main>
	);
}
