import { Button } from "@nocoo/basalt/components/button";
import { FileDropzone } from "@nocoo/basalt/components/file-dropzone";
import { useEffect, useState } from "react";

export default function CoverImageIntake() {
	const [file, setFile] = useState<File | null>(null);
	const [preview, setPreview] = useState<string>();
	useEffect(() => {
		if (!file) {
			setPreview(undefined);
			return;
		}
		const url = URL.createObjectURL(file);
		setPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [file]);
	return (
		<div className="w-full space-y-4">
			<FileDropzone
				label="Choose a cover image"
				description="One PNG, JPEG or WebP · up to 4 MB"
				accept="image/png,image/jpeg,image/webp"
				multiple={false}
				maxSize={4 * 1024 * 1024}
				onFilesAccepted={([image]) => setFile(image)}
			/>
			{file && (
				<div className="flex items-center gap-4 rounded-basalt-lg border border-basalt-border p-3">
					{preview && (
						<img
							src={preview}
							alt={`Preview of ${file.name}`}
							className="size-20 rounded-basalt-md object-cover"
						/>
					)}
					<div className="min-w-0 flex-1">
						<p className="break-words text-sm">{file.name}</p>
						<Button size="sm" variant="ghost" onClick={() => setFile(null)}>
							Remove cover
						</Button>
					</div>
				</div>
			)}
			<p className="text-xs text-basalt-muted-foreground">
				The page releases each preview when replaced, removed, or unmounted.
			</p>
		</div>
	);
}
