import { Button } from "@nocoo/basalt/components/button";

export default function ButtonReducedMotion() {
	return (
		<div className="flex flex-wrap items-center gap-3">
			<Button loading>Loading Action</Button>
			<Button loading variant="secondary">
				Secondary Loading
			</Button>
			<Button loading variant="outline">
				Outline Loading
			</Button>
		</div>
	);
}
