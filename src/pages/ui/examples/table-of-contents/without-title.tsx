import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";

export default function TableOfContentsWithoutTitle() {
	return (
		<TableOfContents title="">
			<TableOfContentsItem active>Intro</TableOfContentsItem>
		</TableOfContents>
	);
}
