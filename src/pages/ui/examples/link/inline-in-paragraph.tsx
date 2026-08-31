import { Link } from "@nocoo/basalt/components/link";
import { Text } from "@nocoo/basalt/components/text";
import { LinkProvider } from "@nocoo/basalt/providers/link";

export default function LinkInlineInParagraph() {
	return (
		<LinkProvider>
			<Text>
				Read the <Link href="#docs">docs</Link>.
			</Text>
		</LinkProvider>
	);
}
