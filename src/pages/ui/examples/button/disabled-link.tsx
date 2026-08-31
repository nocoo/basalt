import { LinkButton } from "@nocoo/basalt/components/button";

export default function ButtonDisabledLink() {
	return (
		<LinkButton aria-disabled="true" tabIndex={-1} role="link" className="opacity-50">
			Disabled link
		</LinkButton>
	);
}
