import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";

export default function TableOfContentsOptions() {
	return (
		<TableOfContents>
			<TableOfContentsItem active>Intro</TableOfContentsItem>
			<TableOfContentsItem>Usage</TableOfContentsItem>
		</TableOfContents>
	);
}
