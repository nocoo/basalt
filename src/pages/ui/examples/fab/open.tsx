import { Fab } from "@nocoo/basalt/components/fab";
import { Sparkles } from "lucide-react";

export default function OpenExample() {
	return (
		<div className="relative h-24 w-full">
			<Fab open placement="absolute" aria-label="Open assistant">
				<Sparkles />
			</Fab>
		</div>
	);
}
