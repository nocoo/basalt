import { type UploadFile, UploadItem } from "@nocoo/basalt/components/upload-queue";
import { Music2 } from "lucide-react";
import { useState } from "react";

export default function AudioReview() {
	const [files, setFiles] = useState<UploadFile[]>([
		{ id: "brief", name: "Product brief.wav", size: 2481000, status: "success" },
		{
			id: "interview",
			name: "Interview take 02.mp3",
			size: 4128000,
			status: "error",
			error: "The connection ended before transfer completed.",
		},
		{ id: "notes", name: "Voice notes.m4a", status: "cancelled" },
	]);
	return (
		<div className="w-full space-y-3">
			<h3 className="font-medium">Recording imports</h3>
			{files.map((file) => (
				<UploadItem
					key={file.id}
					file={{
						...file,
						preview: <Music2 className="size-5 text-basalt-info" aria-hidden="true" />,
					}}
					labels={{ success: "Ready for transcription", retry: "Import again", remove: "Dismiss" }}
					onRetry={(id) =>
						setFiles(
							files.map((item) =>
								item.id === id ? { ...item, status: "success", error: undefined } : item,
							),
						)
					}
					onRemove={(id) => setFiles(files.filter((item) => item.id !== id))}
				/>
			))}
			<p role="status" className="text-xs text-basalt-muted-foreground">
				{files.length} recordings in this local review. Transcription belongs to your application.
			</p>
		</div>
	);
}
