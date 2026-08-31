import { Button } from "@nocoo/basalt/components/button";

export default function ButtonSizes() {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Button size="sm">Small</Button>
			<Button>Default</Button>
			<Button size="lg">Large</Button>
		</div>
	);
}
