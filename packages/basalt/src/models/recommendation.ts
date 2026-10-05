export type RecommendationConfidence = "high" | "review" | "none";

export type RecommendationOption = {
	id: string;
	label: string;
	description: string;
	confidence: RecommendationConfidence;
	actionLabel?: string;
	disabled?: boolean;
};

export const RECOMMENDATION_CONFIDENCE = {
	high: { label: "High confidence", bars: 3, className: "text-basalt-info" },
	review: { label: "Needs review", bars: 2, className: "text-basalt-warning" },
	none: { label: "No signal", bars: 0, className: "text-basalt-muted-foreground" },
} as const;
