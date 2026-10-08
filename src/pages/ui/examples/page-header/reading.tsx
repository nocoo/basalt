import { Button } from "@nocoo/basalt/components/button";
import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function ResourcesHeader() {
	return (
		<PageHeader
			size="xl"
			title="A place for clear thinking"
			description="Give long-form guidance a distinct opening. Keep the title and supporting text on the content grid, without adding another surface or fixed-height banner."
			actions={<Button variant="outline">View source</Button>}
		/>
	);
}
