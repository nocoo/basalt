import { Button } from "@nocoo/basalt/components/button";
import { DeleteResource } from "@nocoo/basalt/components/delete-resource";
import { useRef, useState } from "react";

export default function DeleteResourceDefault() {
	const [status, setStatus] = useState<string>("Ready");
	const attemptsRef = useRef(0);

	const resetDemo = () => {
		attemptsRef.current = 0;
		setStatus("Ready (next attempt will fail, retry will succeed)");
	};

	return (
		<div className="flex flex-col items-start gap-3">
			<div className="flex items-center gap-3">
				<DeleteResource
					name="Atlas"
					errorMessage={(error) =>
						error instanceof Error
							? `Deletion failed: ${error.message}`
							: "Failed to delete resource."
					}
					onDelete={async () => {
						attemptsRef.current += 1;
						if (attemptsRef.current === 1) {
							setStatus("First attempt failed with retryable alert");
							throw new Error("Network timeout while deleting resource. Please retry.");
						}
						setStatus("Resource Atlas deleted successfully on retry");
					}}
				/>
				<Button variant="outline" size="sm" onClick={resetDemo}>
					Reset demo
				</Button>
			</div>
			<p className="text-xs text-basalt-muted">{status}</p>
		</div>
	);
}
