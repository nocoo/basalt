import { FileDropzone } from "@nocoo/basalt/components/file-dropzone";
import { type UploadFile, UploadQueue } from "@nocoo/basalt/components/upload-queue";
import { useState } from "react";

export default function DocumentIntake() {
	const [files, setFiles] = useState<UploadFile[]>([]);
	return (
		<div className="w-full space-y-4">
			<FileDropzone
				label="Add reference documents"
				description="PDF or text · up to 3 files · 2 MB each"
				accept=".pdf,text/plain"
				maxSize={2 * 1024 * 1024}
				maxFiles={3}
				fileCount={files.length}
				onFilesAccepted={(incoming) =>
					setFiles((current) => [
						...current,
						...incoming.map((file) => ({
							id: crypto.randomUUID(),
							name: file.name,
							size: file.size,
							status: "queued" as const,
						})),
					])
				}
			/>
			<UploadQueue
				label="Reference documents"
				files={files}
				emptyLabel="Your selected documents will appear here."
				onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
			/>
			<p className="text-xs text-basalt-muted-foreground">
				Files stay on your device in this demonstration.
			</p>
		</div>
	);
}
