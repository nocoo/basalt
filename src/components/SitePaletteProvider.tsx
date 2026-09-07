import { AccentProvider } from "@nocoo/basalt/providers/accent";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import {
	type CustomPaletteColors,
	loadPalettePreference,
	PALETTE_STORAGE_KEY,
	type PalettePreference,
	paletteOverrides,
	parsePalettePreference,
	savePalettePreference,
} from "@/lib/custom-palette";

const SitePaletteContext = createContext<{
	preference: PalettePreference;
	apply: (colors: CustomPaletteColors) => boolean;
	restoreClassic: () => boolean;
} | null>(null);

export function SitePaletteProvider({ children }: { children: ReactNode }) {
	const [preference, setPreference] = useState(loadPalettePreference);
	useEffect(() => {
		const sync = (event: StorageEvent) => {
			if (event.key !== PALETTE_STORAGE_KEY && event.key !== null) return;
			try {
				if (event.storageArea && event.storageArea !== window.localStorage) return;
			} catch {
				return;
			}
			setPreference(
				parsePalettePreference(event.newValue) ?? { ...loadPalettePreference(), mode: "classic" },
			);
		};
		window.addEventListener("storage", sync);
		return () => window.removeEventListener("storage", sync);
	}, []);
	const overrides = useMemo(
		() => (preference.mode === "custom" ? paletteOverrides(preference.colors) : undefined),
		[preference],
	);
	const update = (next: PalettePreference) => {
		setPreference(next);
		return savePalettePreference(next);
	};
	return (
		<SitePaletteContext.Provider
			value={{
				preference,
				apply: (colors) => update({ version: 1, mode: "custom", colors }),
				restoreClassic: () => update({ ...preference, mode: "classic" }),
			}}
		>
			<AccentProvider paletteOverrides={overrides}>{children}</AccentProvider>
		</SitePaletteContext.Provider>
	);
}

export function useSitePalette() {
	const context = useContext(SitePaletteContext);
	if (!context) throw new Error("useSitePalette requires SitePaletteProvider");
	return context;
}
