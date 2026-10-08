import { AvatarInitials } from "@nocoo/basalt/components/avatar";
import { DataTable, type DataTableColumn } from "@nocoo/basalt/components/data-table";
import { TagBadge, type TagColor } from "@nocoo/basalt/components/tag-badge";
import { CalendarDays, ExternalLink, Link2, ListFilter, Signal } from "lucide-react";

const records = [
	{
		id: "alpine",
		name: "Alpine Churn — Zurich",
		tags: ["B2B", "Gelato", "Wholesale"],
		last: "4 days ago",
		strength: "Very strong",
		website: "alpine-churn.example.com",
	},
	{
		id: "amber",
		name: "Amber Scoop — Prague",
		tags: ["Gelato", "B2B"],
		last: "over 1 year ago",
		strength: "No communication",
		website: "",
	},
	{
		id: "andes",
		name: "Andes Snow Creamery — Quito",
		tags: ["Gelato", "Catering"],
		last: "almost 2 years ago",
		strength: "Very weak",
		website: "",
	},
	{
		id: "apricot",
		name: "Apricot Atlas — Algiers",
		tags: ["Sorbet", "Imports"],
		last: "11 months ago",
		strength: "Very weak",
		website: "apricot-atlas.example.com",
	},
	{
		id: "aurora",
		name: "Aurora Scoops — Reykjavik",
		tags: ["Gelato", "Seasonal"],
		last: "9 days ago",
		strength: "Very strong",
		website: "aurora-scoops.example.com",
	},
	{
		id: "baltic",
		name: "Baltic Berry — Tallinn",
		tags: ["Dairy-free", "Seasonal", "B2C"],
		last: "5 weeks ago",
		strength: "Weak",
		website: "baltic-berry.example.com",
	},
];
const tagColors: Record<string, TagColor> = {
	B2B: "amber",
	Gelato: "violet",
	Wholesale: "amber",
	Catering: "rose",
	Sorbet: "rose",
	Imports: "warning",
	Seasonal: "success",
	"Dairy-free": "info",
	B2C: "teal",
};
const columns: DataTableColumn<(typeof records)[number]>[] = [
	{
		id: "name",
		header: "Company",
		width: 240,
		sortValue: (row) => row.name,
		accessor: (row) => (
			<span className="flex items-center gap-basalt-space-lg">
				<AvatarInitials name={row.name} colorKey={row.id} size="sm" />
				<span className="block max-w-[13.125rem] truncate" title={row.name}>
					{row.name}
				</span>
			</span>
		),
	},
	{
		id: "tags",
		header: "Categories",
		headerContent: (
			<>
				<ListFilter className="size-basalt-icon-sm" strokeWidth={1.5} aria-hidden="true" />
				Categories
			</>
		),
		width: 240,
		sortable: false,
		accessor: (row) => (
			<span className="flex items-center gap-basalt-space-sm">
				{row.tags.map((tag) => (
					<TagBadge key={tag} size="sm" name={tag} color={tagColors[tag]} />
				))}
			</span>
		),
	},
	{
		id: "last",
		header: "Last interaction",
		headerContent: (
			<>
				<CalendarDays className="size-basalt-icon-sm" strokeWidth={1.5} aria-hidden="true" />
				Last interaction
			</>
		),
		width: 150,
		accessor: (row) => row.last,
	},
	{
		id: "strength",
		header: "Connection strength",
		headerContent: (
			<>
				<Signal className="size-basalt-icon-sm" strokeWidth={1.5} aria-hidden="true" />
				Connection strength
			</>
		),
		width: 180,
		accessor: (row) => row.strength,
	},
	{
		id: "website",
		header: "Links",
		headerContent: (
			<>
				<Link2 className="size-basalt-icon-sm" strokeWidth={1.5} aria-hidden="true" />
				Links
			</>
		),
		width: 190,
		accessor: (row) =>
			row.website ? (
				<a
					href={`https://${row.website}`}
					target="_blank"
					rel="noreferrer"
					title={row.website}
					className="inline-flex max-w-[10.625rem] items-center gap-basalt-space-sm text-basalt-muted-foreground hover:text-basalt-foreground"
				>
					<span className="truncate">{row.website}</span>
					<ExternalLink
						className="size-basalt-icon-sm shrink-0"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
				</a>
			) : (
				<span className="text-basalt-muted-foreground">—</span>
			),
	},
];

export default function RecordsTable() {
	return (
		<div className="w-full space-y-basalt-space-lg" data-demo="records-table">
			<DataTable
				data={records}
				columns={columns}
				rowNumbers
				multiple
				defaultSelected={[]}
				getRowId={(row) => row.id}
				defaultSort={{ id: "name", dir: "asc" }}
				maxHeight={300}
				aria-label="Supplier records"
			/>
			<p className="text-basalt-sm text-basalt-muted-foreground">
				6 records · Scroll horizontally for relationship details
			</p>
		</div>
	);
}
