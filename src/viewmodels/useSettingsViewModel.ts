import { useState } from "react";
import { useDemoSubmission } from "./useDemoSubmission";

const INITIAL_PROFILE = {
	firstName: "Alex",
	lastName: "Johnson",
	email: "alex@basalt.app",
	phone: "+1 (555) 123-4567",
	bio: "Product designer and financial enthusiast.",
};
const INITIAL_SESSIONS = [
	{ device: "MacBook Pro — Chrome", location: "San Francisco, US", current: true },
	{ device: "iPhone 15 — Safari", location: "San Francisco, US", current: false },
	{ device: "Windows PC — Firefox", location: "New York, US", current: false },
];

export function useSettingsViewModel() {
	const [activeSection, setActiveSection] = useState("profile");
	const profileSave = useDemoSubmission<typeof INITIAL_PROFILE>();
	const [draft, setDraft] = useState(INITIAL_PROFILE);
	const profile = profileSave.result ?? INITIAL_PROFILE;
	const [photo, setPhoto] = useState("");
	const [notifications, setNotifications] = useState<Record<string, boolean>>({
		email: true,
		push: true,
		marketing: false,
		weekly: true,
		security: true,
	});
	const [securityPreferences, setSecurityPreferences] = useState({
		authenticator: false,
		sms: true,
	});
	const passwordSave = useDemoSubmission<{ changed: true }>();
	const [passwordError, setPasswordError] = useState(false);
	const [sessions, setSessions] = useState(INITIAL_SESSIONS);
	const [notice, setNotice] = useState<"preferences" | "revoked" | null>(null);
	const [currency, setCurrency] = useState("USD");
	const [compact, setCompact] = useState(false);

	return {
		activeSection,
		setActiveSection,
		profile,
		draft,
		profileSave,
		photo,
		setPhoto,
		notifications,
		securityPreferences,
		passwordSave,
		passwordError,
		sessions,
		notice,
		currency,
		setCurrency,
		compact,
		setCompact,
		changeField: (key: keyof typeof INITIAL_PROFILE, value: string) =>
			setDraft((current) => ({ ...current, [key]: value })),
		saveProfile: () => profileSave.submit({ ...draft }),
		cancelProfile: () => {
			profileSave.cancel();
			setDraft(profile);
		},
		setNotification: (key: string, value: boolean) => {
			setNotifications((current) => ({ ...current, [key]: value }));
			setNotice("preferences");
		},
		setSecurityPreference: (key: keyof typeof securityPreferences, value: boolean) => {
			setSecurityPreferences((current) => ({ ...current, [key]: value }));
			setNotice("preferences");
		},
		updatePassword: (current: string, password: string, confirmation: string) => {
			const valid = current.length > 0 && password.length >= 8 && password === confirmation;
			setPasswordError(!valid);
			if (valid) passwordSave.submit({ changed: true });
		},
		revoke: (device: string) => {
			setSessions((current) =>
				current.filter((session) => session.current || session.device !== device),
			);
			setNotice("revoked");
		},
	};
}
