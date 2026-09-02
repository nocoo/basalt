import { TableOfContents, TableOfContentsItem } from "@nocoo/basalt/components/table-of-contents";

export default function TableOfContentsOptions() {
	return (
		<TableOfContents>
			<TableOfContentsItem href="#intro" active>
				Intro
			</TableOfContentsItem>
			<TableOfContentsItem href="#usage">Usage</TableOfContentsItem>
		</TableOfContents>
	);
}
