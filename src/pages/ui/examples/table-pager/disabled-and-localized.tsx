import { TablePager } from "@nocoo/basalt/components/table-pager";

const format = new Intl.NumberFormat("en-US");

export default function DisabledAndLocalizedExample() {
	return (
		<TablePager
			page={2}
			pageSize={1000}
			totalCount={1234567}
			disabled
			onPageChange={() => {}}
			formatRange={({ start, end, totalCount }) =>
				`Showing ${format.format(start)}–${format.format(end)} of ${format.format(totalCount)}`
			}
		/>
	);
}
