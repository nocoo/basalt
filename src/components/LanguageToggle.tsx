import { ToggleGroup, ToggleGroupItem } from "@nocoo/basalt/components/toggle-group";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
	{ value: "en", label: "EN" },
	{ value: "zh", label: "中文" },
] as const;

function languageValue(language: string): (typeof LANGUAGES)[number]["value"] {
	return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function LanguageToggle() {
	const { i18n, t } = useTranslation();
	const value = languageValue(i18n.language);

	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={(next) => {
				if (next === "en" || next === "zh") {
					void i18n.changeLanguage(next);
				}
			}}
			aria-label={t("language.label")}
		>
			{LANGUAGES.map((lang) => (
				<ToggleGroupItem key={lang.value} value={lang.value}>
					{lang.label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
