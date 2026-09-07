import { IconPicker } from "@nocoo/basalt/components/icon-picker";
import { FileAudio, FileImage, FileText, Lock } from "lucide-react";
import { useState } from "react";

export default function ResourceIconSelection() {
	const [message, setMessage] = useState("Choose a resource icon.");
	return (
		<div className="space-y-3">
			<h3 className="font-medium">Resource classification</h3>
			<IconPicker
				label="Resource icon"
				defaultValue="document"
				onValueChange={(value) => setMessage(`Using the ${value} icon.`)}
				options={[
					{ value: "document", label: "Document", icon: <FileText /> },
					{ value: "image", label: "Image", icon: <FileImage /> },
					{ value: "audio", label: "Audio", icon: <FileAudio /> },
					{ value: "locked", label: "Private vault", icon: <Lock />, disabled: true },
				]}
			/>
			<p role="status" className="text-sm text-basalt-muted-foreground">
				{message}
			</p>
		</div>
	);
}
