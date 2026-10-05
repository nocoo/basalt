import { ChatComposer, type ChatComposerProps } from "./chat-composer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Toggle } from "./toggle";

export type PromptModel = { id: string; label: string; disabled?: boolean };
export interface PromptBarProps extends Omit<ChatComposerProps, "toolbar"> {
	models: readonly PromptModel[];
	model: string;
	onModelChange: (model: string) => void;
	reasoning?: boolean;
	onReasoningChange?: (value: boolean) => void;
	webSearch?: boolean;
	onWebSearchChange?: (value: boolean) => void;
}

export function PromptBar({
	models,
	model,
	onModelChange,
	reasoning,
	onReasoningChange,
	webSearch,
	onWebSearchChange,
	...props
}: PromptBarProps) {
	const disabled = props.disabled || props.streaming;
	return (
		<ChatComposer
			{...props}
			toolbar={
				<>
					<Select value={model} onValueChange={onModelChange} disabled={disabled}>
						<SelectTrigger
							size="sm"
							aria-label="Model"
							className="w-auto min-w-0 max-w-full border-0 bg-transparent shadow-none"
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{models.map((item) => (
								<SelectItem key={item.id} value={item.id} disabled={item.disabled}>
									{item.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{onReasoningChange && (
						<Toggle
							size="sm"
							pressed={reasoning}
							onPressedChange={onReasoningChange}
							disabled={disabled}
							aria-label="Reasoning"
						>
							Think
						</Toggle>
					)}
					{onWebSearchChange && (
						<Toggle
							size="sm"
							pressed={webSearch}
							onPressedChange={onWebSearchChange}
							disabled={disabled}
							aria-label="Web search"
						>
							Search
						</Toggle>
					)}
				</>
			}
		/>
	);
}
