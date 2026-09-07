import { Button } from "@nocoo/basalt/components/button";
import { Checkbox } from "@nocoo/basalt/components/checkbox";
import { FileDropzone } from "@nocoo/basalt/components/file-dropzone";
import { type UploadFile, UploadQueue } from "@nocoo/basalt/components/upload-queue";
import { useEffect, useId, useState } from "react";

export default function LocalUploadQueue() {
	const [files, setFiles] = useState<UploadFile[]>([]);
	const [fail, setFail] = useState(false);
	const id = useId();
	useEffect(() => {
		if (!files.some((file) => file.status === "uploading")) return;
		const timer = setTimeout(
			() =>
				setFiles((current) =>
					current.map((file) => {
						if (file.status !== "uploading") return file;
						const progress = (file.progress ?? 0) + 10;
						if (fail && progress >= 50)
							return {
								...file,
								progress,
								status: "error",
								error: "Connection interrupted. Turn off failure and retry.",
							};
						return { ...file, progress, status: progress >= 100 ? "success" : "uploading" };
					}),
				),
			200,
		);
		return () => clearTimeout(timer);
	}, [files, fail]);
	function add(names: { name: string; size: number }[]) {
		setFiles((current) => [
			...current,
			...names.map((file) => ({
				...file,
				id: crypto.randomUUID(),
				status: "queued" as const,
				progress: 0,
			})),
		]);
	}
	return (
		<div className="w-full space-y-4">
			<FileDropzone
				label="Upload project files"
				description="Local demonstration · files are never sent"
				maxFiles={5}
				fileCount={files.length}
				onFilesAccepted={add}
			/>
			<div className="flex flex-wrap items-center gap-3">
				<Button
					variant="outline"
					disabled={files.length >= 5}
					onClick={() => add([{ name: `Project-notes-${files.length + 1}.pdf`, size: 184320 }])}
				>
					Add sample file
				</Button>
				<Button
					disabled={!files.some((file) => file.status === "queued")}
					onClick={() =>
						setFiles(
							files.map((file) =>
								file.status === "queued" ? { ...file, status: "uploading" } : file,
							),
						)
					}
				>
					Start uploads
				</Button>
				<span className="flex items-center gap-2">
					<Checkbox id={id} checked={fail} onCheckedChange={(value) => setFail(value === true)} />
					<label htmlFor={id} className="text-xs">
						Simulate failure
					</label>
				</span>
			</div>
			<UploadQueue
				label="Project upload queue"
				files={files}
				onCancel={(id) =>
					setFiles(files.map((file) => (file.id === id ? { ...file, status: "cancelled" } : file)))
				}
				onRetry={(id) =>
					setFiles(
						files.map((file) =>
							file.id === id
								? { ...file, status: "uploading", progress: 0, error: undefined }
								: file,
						),
					)
				}
				onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
			/>
			<p role="status" className="text-xs text-basalt-muted-foreground">
				{files.filter((file) => file.status === "success").length} completed · {files.length} total
			</p>
		</div>
	);
}
