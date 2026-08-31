import { Button } from "@nocoo/basalt/components/button";

export default function ButtonLinkAsButton() {
	return (
		<Button asChild>
			<a href="#docs">Open docs</a>
		</Button>
	);
}
