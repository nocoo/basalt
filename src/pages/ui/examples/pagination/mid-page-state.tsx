import { Pagination } from "@nocoo/basalt/components/pagination";
import { useState } from "react";

export default function PaginationMidPageState() {
	const [page, setPage] = useState(5);
	return <Pagination page={page} pageCount={12} onPageChange={setPage} />;
}
