import { Pagination } from "@nocoo/basalt/components/pagination";

export default function PaginationDisabled() {
	return <Pagination defaultPage={3} pageCount={5} disabled />;
}
