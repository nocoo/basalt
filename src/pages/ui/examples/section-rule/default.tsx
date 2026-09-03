import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function SectionRuleDefault() {
	return (
		<SectionRule title="Catalog">
			<p className="text-sm text-basalt-muted-foreground">
				Region content sits under the dashed rule.
			</p>
		</SectionRule>
	);
}
