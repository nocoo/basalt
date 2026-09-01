import { Pagination } from "@nocoo/basalt/components/pagination";
import { useState } from "react";

export default function PaginationSimpleControls() {
	const [page, setPage] = useState(2);
	return <Pagination page={page} pageCount={10} simple onPageChange={setPage} />;
}
