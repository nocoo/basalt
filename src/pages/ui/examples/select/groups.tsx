import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectGroups() {
	return (
		<Select>
			<SelectTrigger aria-label="Channel" className="w-48">
				<SelectValue placeholder="Choose…" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>Stable</SelectLabel>
					<SelectItem value="1">v1</SelectItem>
					<SelectItem value="2">v2</SelectItem>
				</SelectGroup>
				<SelectGroup>
					<SelectLabel>Preview</SelectLabel>
					<SelectItem value="next" disabled>
						next
					</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
