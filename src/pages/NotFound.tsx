import { useSiteTitle } from "@/hooks/use-site-title";
import NotFoundTemplate from "@/templates/NotFoundTemplate";

export default function NotFound() {
	useSiteTitle("404 Page");

	return <NotFoundTemplate />;
}
