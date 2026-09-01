import { Input } from "@nocoo/basalt/components/input";

export default function InputSizes() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Input size="sm" aria-label="Small" />
			<Input aria-label="Default" />
			<Input size="lg" aria-label="Large" />
		</div>
	);
}
