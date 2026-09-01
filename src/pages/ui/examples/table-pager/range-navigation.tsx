import { TablePager } from "@nocoo/basalt/components/table-pager";
import { useState } from "react";

export default function RangeNavigationExample() {
	const [page, setPage] = useState(2);

	return <TablePager page={page} pageSize={10} totalCount={47} onPageChange={setPage} />;
}
