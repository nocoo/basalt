import { LoadingScreen } from "@nocoo/basalt/components/loading-screen";
import { useSiteTitle } from "@/hooks/use-site-title";

export default function LoadingPage() {
	useSiteTitle("Loading");
	return <LoadingScreen />;
}
