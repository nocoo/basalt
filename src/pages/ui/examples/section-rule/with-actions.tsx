import { Button } from "@nocoo/basalt/components/button";
import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function SectionRuleWithActions() {
	return (
		<SectionRule title="Catalog" actions={<Button size="sm">New project</Button>}>
			<p className="text-sm text-basalt-muted-foreground">
				Put the primary action on the right of the rule.
			</p>
		</SectionRule>
	);
}
