import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectPlaceholder() {
	return (
		<Select>
			<SelectTrigger aria-label="Empty select" className="w-48">
				<SelectValue placeholder="Choose…" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="a">Alpha</SelectItem>
			</SelectContent>
		</Select>
	);
}
