import { Link } from "@nocoo/basalt/components/link";
import { LinkProvider } from "@nocoo/basalt/providers/link";

export default function LinkBasicLink() {
	return (
		<LinkProvider>
			<Link href="#section">Inline link</Link>
		</LinkProvider>
	);
}
