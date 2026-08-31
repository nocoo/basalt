import { Input } from "@nocoo/basalt/components/input";

export default function InputTypes() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Input type="email" placeholder="Email" aria-label="Email type" />
			<Input type="password" placeholder="Password" aria-label="Password type" />
			<Input type="search" placeholder="Search" aria-label="Search type" />
		</div>
	);
}
