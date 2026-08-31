import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nocoo/basalt/components/select";

export default function SelectDisabledOptions() {
	return (
		<Select>
			<SelectTrigger aria-label="Disabled option" className="w-48">
				<SelectValue placeholder="Choose…" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="a">Alpha</SelectItem>
				<SelectItem value="b" disabled>
					Beta
				</SelectItem>
			</SelectContent>
		</Select>
	);
}
