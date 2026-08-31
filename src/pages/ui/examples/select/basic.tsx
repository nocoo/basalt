import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectBasic() {
	return (
		<Select>
			<SelectTrigger aria-label="Version" className="w-48">
				<SelectValue placeholder="Select version" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="1">v1</SelectItem>
				<SelectItem value="2">v2</SelectItem>
			</SelectContent>
		</Select>
	);
}
