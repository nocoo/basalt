import { Button } from "@nocoo/basalt/components/button";
import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function DefaultExample() {
	return (
		<PageHeader
			breadcrumbs={[{ href: "#", label: "Examples" }]}
			title="Dashboard"
			description="Overview of recent project activity."
			actions={
				<>
					<Button variant="outline">Filters</Button>
					<Button>New project</Button>
				</>
			}
		/>
	);
}
