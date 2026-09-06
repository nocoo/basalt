import { Slider } from "@nocoo/basalt/components/slider";
import React, { useState } from "react";

declare global {
	interface Window {
		sliderAudit?: {
			mounted: boolean;
		};
	}
}

export function SliderApp() {
	const [vValue, setVValue] = useState([20, 80]);

	React.useEffect(() => {
		window.sliderAudit = { mounted: true };
	}, []);

	return (
		<div style={{ padding: 40 }}>
			<div style={{ width: 320, marginBottom: 40 }}>
				<Slider id="slider-h" defaultValue={[20, 80]} labels={["Min range", "Max range"]} />
			</div>
			<div style={{ height: 220, width: 20 }}>
				<Slider
					id="slider-v"
					orientation="vertical"
					value={vValue}
					onValueChange={setVValue}
					labels={["Min vertical", "Max vertical"]}
					style={{ height: 220 }}
				/>
			</div>
		</div>
	);
}
