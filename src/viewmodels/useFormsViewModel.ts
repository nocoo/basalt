import { useState } from "react";
import { useDemoSubmission } from "./useDemoSubmission";

export function useFormsViewModel() {
	const profile = useDemoSubmission<Record<string, string>>();
	const security = useDemoSubmission<{ twoFactor: boolean }>();
	const newsletter = useDemoSubmission<{ email: string }>();
	const [passwordError, setPasswordError] = useState(false);
	const [files, setFiles] = useState<{ name: string; size: number }[]>([]);
	const [detailsOpen, setDetailsOpen] = useState(false);
	function updateSecurity(password: string, confirmation: string, twoFactor: boolean) {
		const valid = password.length >= 8 && password === confirmation;
		setPasswordError(!valid);
		if (valid) security.submit({ twoFactor });
	}
	return {
		profile,
		security,
		newsletter,
		passwordError,
		updateSecurity,
		files,
		setFiles,
		detailsOpen,
		setDetailsOpen,
	};
}
