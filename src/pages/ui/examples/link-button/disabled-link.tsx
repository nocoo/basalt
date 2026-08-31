import { LinkButton } from "@nocoo/basalt/components/button";

export default function LinkButtonDisabledLink() {
	return (
		<LinkButton aria-disabled="true" tabIndex={-1} role="link" className="opacity-50">
			Disabled link
		</LinkButton>
	);
}
