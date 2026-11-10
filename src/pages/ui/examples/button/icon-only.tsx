import { Button } from "@nocoo/basalt/components/button";
import { Plus } from "lucide-react";

export default function ButtonIconOnly() {
	return (
		<div className="flex items-center gap-basalt-space-lg">
			<Button size="icon" aria-label="Add item">
				<Plus aria-hidden="true" />
			</Button>
			<Button size="icon-sm" aria-label="Add item compact">
				<Plus aria-hidden="true" />
			</Button>
		</div>
	);
}
