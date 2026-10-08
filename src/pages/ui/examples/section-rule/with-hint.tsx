import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function SectionRuleWithHint() {
	return (
		<SectionRule title="Catalog" hint="Published items in the current workspace.">
			<p className="text-basalt-base text-basalt-muted-foreground">
				The info control explains the region without a second heading.
			</p>
		</SectionRule>
	);
}
