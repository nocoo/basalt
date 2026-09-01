import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectSizes() {
	return (
		<div className="flex w-full flex-col gap-3">
			<Select>
				<SelectTrigger size="sm" aria-label="Small" className="w-48">
					<SelectValue placeholder="Small" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
				</SelectContent>
			</Select>
			<Select>
				<SelectTrigger aria-label="Default size" className="w-48">
					<SelectValue placeholder="Default" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
				</SelectContent>
			</Select>
			<Select>
				<SelectTrigger size="lg" aria-label="Large" className="w-48">
					<SelectValue placeholder="Large" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="1">v1</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
