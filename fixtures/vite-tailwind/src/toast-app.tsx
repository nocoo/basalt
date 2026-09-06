import { Toaster, type ToasterProps, toast } from "@nocoo/basalt/components/toast";
import React, { useState } from "react";

declare global {
	interface Window {
		toastAudit?: {
			toast: typeof toast;
			ref: HTMLElement | null;
			setOptions?: (options: ToasterProps) => void;
		};
	}
}

window.toastAudit = { toast, ref: null };

export function ToastApp() {
	const [options, setOptions] = useState<ToasterProps>({});

	React.useEffect(() => {
		if (window.toastAudit) {
			window.toastAudit.setOptions = setOptions;
		}
	}, []);

	return (
		<>
			<button
				id="no-icon"
				type="button"
				onClick={() => toast.success("No icon", { icon: false, duration: Infinity })}
			>
				No icon
			</button>
			<Toaster
				{...options}
				ref={(node) => {
					if (window.toastAudit) {
						window.toastAudit.ref = node;
					}
				}}
			/>
		</>
	);
}
