import {
	ChartFrame as BasaltChartFrame,
	type ChartFrameProps as BasaltChartFrameProps,
	RESPONSIVE_CONTAINER_PROPS,
} from "@nocoo/basalt/components/chart";
import { cloneElement, type ReactElement, type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";

export type ChartFrameProps = Omit<BasaltChartFrameProps, "children"> & {
	children: ReactElement<{
		accessibilityLayer?: boolean;
		"aria-label"?: string;
	}>;
	accessibilityLayer?: boolean;
};

export type ChartShellProps = ChartFrameProps & { legend?: ReactNode };
export type ChartAccessibilityProps = Pick<
	ChartFrameProps,
	"summary" | "dataAlternative" | "accessibilityLayer"
>;

export function ChartFrame({
	ariaLabel,
	children,
	accessibilityLayer = true,
	...props
}: ChartFrameProps) {
	const childProps = children.props;
	const child = cloneElement(children, {
		accessibilityLayer: childProps.accessibilityLayer ?? accessibilityLayer,
		"aria-label": childProps["aria-label"] ?? ariaLabel,
	});
	return (
		<BasaltChartFrame ariaLabel={ariaLabel} {...props}>
			<ResponsiveContainer {...RESPONSIVE_CONTAINER_PROPS}>{child}</ResponsiveContainer>
		</BasaltChartFrame>
	);
}

export function ChartShell(props: ChartShellProps) {
	return <ChartFrame {...props} />;
}
