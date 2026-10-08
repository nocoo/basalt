import { Button } from "@nocoo/basalt/components/button";

export default function ButtonVariants() {
	return (
		<div className="flex flex-wrap items-center gap-basalt-space-lg">
			<Button>Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
		</div>
	);
}
