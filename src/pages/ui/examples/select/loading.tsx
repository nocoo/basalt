import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectLoading() {
	return (
		<Select>
			<SelectTrigger loading aria-label="Loading version" className="w-48">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">v1</SelectItem>
			</SelectContent>
		</Select>
	);
}
