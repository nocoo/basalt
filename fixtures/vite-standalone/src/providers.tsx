import {
	AccentProvider,
	type AccentProviderProps,
	useAccent,
} from "@nocoo/basalt/providers/accent";
import {
	type BasaltTheme,
	ThemeProvider,
	type ThemeProviderProps,
	useTheme,
} from "@nocoo/basalt/providers/theme";
import "@nocoo/basalt/styles/standalone";
import { useState } from "react";
import { createRoot } from "react-dom/client";

export type ProviderAuditMountConfig = {
	themeProps?: Partial<ThemeProviderProps>;
	accentProps?: Partial<AccentProviderProps>;
	twins?: boolean;
	secondThemeProps?: Partial<ThemeProviderProps>;
	secondAccentProps?: Partial<AccentProviderProps>;
	controlled?: boolean;
};

export type HostControlledApi = {
	theme: BasaltTheme;
	accent: string;
	setTheme: (t: BasaltTheme) => void;
	setAccent: (a: string) => void;
	requests: Array<[string, string]>;
	setAccept: (accept: boolean) => void;
};

declare global {
	interface Window {
		providerAudit?: {
			ready: boolean;
			mounted: boolean;
			mount: (config?: ProviderAuditMountConfig) => void;
			unmount: () => void;
			hostApi?: HostControlledApi;
		};
	}
}

function Controls({ name }: { name: string }) {
	const { theme, setTheme } = useTheme();
	const { accent, setAccent } = useAccent();

	return (
		<section id={`${name}-section`} aria-label={`${name} preferences`}>
			<output id={`${name}-value`}>{`${theme}/${accent}`}</output>
			<button type="button" id={`${name}-light`} onClick={() => setTheme("light")}>
				light
			</button>
			<button type="button" id={`${name}-dark`} onClick={() => setTheme("dark")}>
				dark
			</button>
			<button type="button" id={`${name}-system`} onClick={() => setTheme("system")}>
				system
			</button>
			<button type="button" id={`${name}-primary`} onClick={() => setAccent("primary")}>
				primary
			</button>
			<button type="button" id={`${name}-rose`} onClick={() => setAccent("rose")}>
				rose
			</button>
		</section>
	);
}

function PreferencePair({
	name,
	themeProps,
	accentProps,
}: {
	name: string;
	themeProps?: Partial<ThemeProviderProps>;
	accentProps?: Partial<AccentProviderProps>;
}) {
	return (
		<ThemeProvider {...themeProps}>
			<AccentProvider {...accentProps}>
				<Controls name={name} />
			</AccentProvider>
		</ThemeProvider>
	);
}

function ControlledHostPair({
	themeProps,
	accentProps,
}: {
	themeProps?: Partial<ThemeProviderProps>;
	accentProps?: Partial<AccentProviderProps>;
}) {
	const [theme, setThemeState] = useState<BasaltTheme>(
		(themeProps?.theme as BasaltTheme) ?? (themeProps?.defaultTheme as BasaltTheme) ?? "light",
	);
	const [accent, setAccentState] = useState<string>(
		accentProps?.accent ?? accentProps?.defaultAccent ?? "primary",
	);
	const [acceptRequests, setAcceptRequests] = useState(false);
	const [requests, setRequests] = useState<Array<[string, string]>>([]);

	const onThemeChange = (next: BasaltTheme) => {
		setRequests((r) => [...r, ["theme", next]]);
		if (acceptRequests) {
			setThemeState(next);
		}
	};

	const onAccentChange = (next: string) => {
		setRequests((r) => [...r, ["accent", next]]);
		if (acceptRequests) {
			setAccentState(next);
		}
	};

	if (window.providerAudit) {
		window.providerAudit.hostApi = {
			theme,
			accent,
			setTheme: (t) => setThemeState(t),
			setAccent: (a) => setAccentState(a),
			requests,
			setAccept: (v) => setAcceptRequests(v),
		};
	}

	return (
		<ThemeProvider {...themeProps} theme={theme} onThemeChange={onThemeChange}>
			<AccentProvider {...accentProps} accent={accent} onAccentChange={onAccentChange}>
				<Controls name="one" />
			</AccentProvider>
		</ThemeProvider>
	);
}

const container = document.getElementById("providers-root");
if (!container) {
	throw new Error("providers-root missing");
}
const reactRoot = createRoot(container);

function renderTree(config: ProviderAuditMountConfig = {}) {
	if (config.controlled) {
		reactRoot.render(
			<ControlledHostPair themeProps={config.themeProps} accentProps={config.accentProps} />,
		);
	} else {
		reactRoot.render(
			<div>
				<PreferencePair
					name="one"
					themeProps={config.themeProps}
					accentProps={config.accentProps}
				/>
				{config.twins ? (
					<PreferencePair
						name="two"
						themeProps={config.secondThemeProps ?? config.themeProps}
						accentProps={config.secondAccentProps ?? config.accentProps}
					/>
				) : null}
			</div>,
		);
	}
	if (window.providerAudit) {
		window.providerAudit.mounted = true;
	}
}

function unmountTree() {
	reactRoot.render(<div id="unmounted">unmounted</div>);
	if (window.providerAudit) {
		window.providerAudit.mounted = false;
		window.providerAudit.hostApi = undefined;
	}
}

window.providerAudit = {
	ready: true,
	mounted: false,
	mount: renderTree,
	unmount: unmountTree,
};

// Initial state: ready only, Provider not mounted yet to allow pre-mount Storage mocking
reactRoot.render(<div id="ready-indicator">ready</div>);
