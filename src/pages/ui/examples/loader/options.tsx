import { Button } from "@nocoo/basalt/components/button";
import { Loader } from "@nocoo/basalt/components/loader";
import { Switch } from "@nocoo/basalt/components/switch";
import { useState } from "react";

export default function LoaderOptions() {
	const [options, setOptions] = useState(["label", "elapsed", "animation", "shimmer"]);
	const [run, setRun] = useState(0);
	return (
		<div className="w-full space-y-6">
			<div className="flex min-h-16 items-center justify-center">
				<Loader
					key={run}
					label="Churning"
					showLabel={options.includes("label")}
					showElapsed={options.includes("elapsed")}
					animate={options.includes("animation")}
					shimmer={options.includes("shimmer")}
					elapsedDelayMs={options.includes("immediate") ? 0 : 5000}
				/>
			</div>
			<Switch.Group value={options} onValueChange={setOptions}>
				<Switch.Legend>Display options</Switch.Legend>
				<Switch.Item value="label">Label</Switch.Item>
				<Switch.Item value="elapsed">Elapsed time</Switch.Item>
				<Switch.Item value="animation">Animation</Switch.Item>
				<Switch.Item value="shimmer">Text shimmer</Switch.Item>
				<Switch.Item value="immediate">Show timer immediately</Switch.Item>
			</Switch.Group>
			<Button variant="outline" size="sm" onClick={() => setRun(run + 1)}>
				Restart
			</Button>
		</div>
	);
}
