import { Link } from "@nocoo/basalt/components/link";
import { LinkProvider } from "@nocoo/basalt/providers/link";

export default function LinkExternalLinks() {
	return (
		<LinkProvider>
			<Link href="https://example.com">Example</Link>
		</LinkProvider>
	);
}
