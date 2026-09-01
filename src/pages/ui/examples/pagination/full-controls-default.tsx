import { Pagination } from "@nocoo/basalt/components/pagination";
import { useState } from "react";

export default function PaginationFullControlsDefault() {
	const [page, setPage] = useState(1);
	return <Pagination page={page} pageCount={10} onPageChange={setPage} />;
}
