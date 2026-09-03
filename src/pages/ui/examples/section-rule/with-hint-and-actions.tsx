import { Button } from "@nocoo/basalt/components/button";
import { SectionRule } from "@nocoo/basalt/components/section-rule";

export default function SectionRuleWithHintAndActions() {
	return (
		<SectionRule
			title="Activity"
			hint="Events from the last 24 hours."
			actions={
				<>
					<Button variant="outline" size="sm">
						Export
					</Button>
					<Button size="sm">Refresh</Button>
				</>
			}
		>
			<p className="text-sm text-basalt-muted-foreground">
				Hint and actions can share the same rule.
			</p>
		</SectionRule>
	);
}
