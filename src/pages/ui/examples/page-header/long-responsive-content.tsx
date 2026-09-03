import { Button } from "@nocoo/basalt/components/button";
import { Input } from "@nocoo/basalt/components/input";
import { PageHeader } from "@nocoo/basalt/components/page-header";

export default function LongResponsiveContentExample() {
	return (
		<PageHeader
			eyebrow="Workspace"
			breadcrumbs={[
				{ href: "#", label: "Organization" },
				{ href: "#", label: "Projects" },
				{ label: "Quarterly operations review" },
			]}
			title="Quarterly operations review for the north-region delivery network"
			description="Summarize delivery health, remaining launch risks, and the owners who need to act before the next planning cycle so the heading and supporting copy can wrap on narrow screens."
			actions={
				<>
					<Button variant="ghost">Share</Button>
					<Button variant="secondary">Export</Button>
					<Button>Create report</Button>
				</>
			}
			filters={
				<>
					<Input placeholder="Owner" className="max-w-48" />
					<Input placeholder="Region" className="max-w-48" />
					<Input placeholder="Risk" className="max-w-48" />
				</>
			}
		/>
	);
}
