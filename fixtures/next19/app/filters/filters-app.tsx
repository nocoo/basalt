"use client";

import { Button } from "@nocoo/basalt/components/button";
import { FileDropzone } from "@nocoo/basalt/components/file-dropzone";
import { FilterBar, FilterChip } from "@nocoo/basalt/components/filter-bar";
import { Input } from "@nocoo/basalt/components/input";
import { MultiSelect } from "@nocoo/basalt/components/multi-select";
import { type UploadFile, UploadQueue } from "@nocoo/basalt/components/upload-queue";
import { useState } from "react";

const options = [
	{ value: "a", label: "Atlas", description: "Research" },
	{ value: "locked", label: "Archive", disabled: true },
	{ value: "b", label: "Boreal" },
	{ value: "c", label: "Cedar" },
];
export default function FiltersApp() {
	const [value, setValue] = useState(["a"]);
	const [query, setQuery] = useState("");
	const [files, setFiles] = useState<UploadFile[]>([]);
	const [cancelReset, setCancelReset] = useState(true);
	const [submitted, setSubmitted] = useState("");
	return (
		<main style={{ padding: 16, maxWidth: 720, margin: "auto" }}>
			<h1 className="mb-4 text-xl font-semibold">Filters and uploads</h1>
			<FilterBar
				label="Search filters"
				active={value.length > 0 || !!query}
				onClear={() => {
					setValue([]);
					setQuery("");
				}}
				chips={value.map((id) => (
					<FilterChip
						key={id}
						label="Model"
						value={id}
						removeLabel={`Remove filter ${id}`}
						onRemove={() => setValue(value.filter((item) => item !== id))}
					/>
				))}
			>
				<Input
					aria-label="Search resources"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
				<div className="w-full">
					<MultiSelect
						showChips={false}
						label="Models"
						value={value}
						onValueChange={setValue}
						options={options}
					/>
				</div>
			</FilterBar>
			<p data-testid="filters-result" className="my-4">
				Selected: {value.join(",")} · Query: {query}
			</p>
			<form
				id="filter-native-form"
				aria-label="Native filter form"
				onReset={(event) => {
					if (cancelReset) event.preventDefault();
				}}
				onSubmit={(event) => {
					event.preventDefault();
					setSubmitted(new FormData(event.currentTarget).getAll("folders").join(","));
				}}
			>
				<Button type="reset" variant="outline">
					Reset native selection
				</Button>
				<Button type="submit">Read form</Button>
			</form>
			<div className="my-4">
				<MultiSelect
					label="Native folders"
					options={options}
					defaultValue={["a"]}
					name="folders"
					form="filter-native-form"
				/>
			</div>
			<Button variant="outline" onClick={() => setCancelReset(false)}>
				Allow reset
			</Button>
			<p data-testid="native-result">{submitted}</p>
			<div className="my-6 space-y-4">
				<FileDropzone
					label="Evidence"
					description="PDF or images · 2 files · 10 bytes each"
					accept=".pdf,image/*"
					maxFiles={2}
					fileCount={files.length}
					maxSize={10}
					onFilesAccepted={(incoming) =>
						setFiles((current) => [
							...current,
							...incoming.map((file) => ({
								id: crypto.randomUUID(),
								name: file.name,
								size: file.size,
								status: "uploading" as const,
								progress: 40,
							})),
						])
					}
				/>
				<UploadQueue
					label="Evidence queue"
					files={files}
					onCancel={(id) =>
						setFiles(
							files.map((file) => (file.id === id ? { ...file, status: "cancelled" } : file)),
						)
					}
					onRetry={(id) =>
						setFiles(files.map((file) => (file.id === id ? { ...file, status: "success" } : file)))
					}
					onRemove={(id) => setFiles(files.filter((file) => file.id !== id))}
				/>
			</div>
		</main>
	);
}
