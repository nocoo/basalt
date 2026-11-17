import { useMemo, useState } from "react";
import {
	DEFAULT_CUSTOM_SPECIMEN,
	isSpecimenMode,
	resolveTierSpecimen,
	type SpecimenMode,
	TYPE_SCALE_TIERS,
	type TypeScaleRow,
} from "@/models/typeface";

export function useTypefaceShowcaseViewModel(initialMode: SpecimenMode = "roles") {
	const [specimenMode, setSpecimenMode] = useState<SpecimenMode>(initialMode);
	const [customText, setCustomText] = useState<string>(DEFAULT_CUSTOM_SPECIMEN);

	const selectSpecimenMode = (value: string) => {
		if (isSpecimenMode(value)) {
			setSpecimenMode(value);
		}
	};

	const resetCustomText = () => {
		setCustomText(DEFAULT_CUSTOM_SPECIMEN);
	};

	const scaleRows: readonly TypeScaleRow[] = useMemo(
		() =>
			TYPE_SCALE_TIERS.map((tier) => ({
				...tier,
				specimen: resolveTierSpecimen(tier, specimenMode, customText),
			})),
		[specimenMode, customText],
	);

	return {
		specimenMode,
		customText,
		scaleRows,
		selectSpecimenMode,
		setCustomText,
		resetCustomText,
	};
}
