import { Link } from "@nocoo/basalt/components/link";
import { useTranslation } from "react-i18next";
import { useSiteTitle } from "@/hooks/use-site-title";

export default function NotFound() {
	const { t } = useTranslation();
	useSiteTitle(t("nav.notFoundPage"));

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background">
			<h1 className="text-basalt-10xl leading-basalt-tight font-light text-muted-foreground font-display tracking-tight select-none">
				{t("pages.notFound.title")}
			</h1>
			<Link href="/" className="mt-basalt-space-lg text-basalt-base text-muted-foreground">
				{t("pages.notFound.backHome")}
			</Link>
		</div>
	);
}
