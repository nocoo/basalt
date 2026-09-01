import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";

export default function TableOfContentsNoActiveItem() {
	return (
		<TableOfContents>
			<TableOfContentsItem>Intro</TableOfContentsItem>
			<TableOfContentsItem>Usage</TableOfContentsItem>
		</TableOfContents>
	);
}
