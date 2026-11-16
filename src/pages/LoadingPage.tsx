import { LoadingScreen } from "@nocoo/basalt/components/loading-screen";
import { BasaltMark } from "@/components/BasaltMark";
import { useSiteTitle } from "@/hooks/use-site-title";

export default function LoadingPage() {
	useSiteTitle("Loading");
	return (
		<LoadingScreen mark={<BasaltMark className="h-basalt-8 w-basalt-8 text-basalt-foreground" />} />
	);
}
