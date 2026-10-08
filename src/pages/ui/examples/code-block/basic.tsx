import { CodeBlock } from "@nocoo/basalt/components/code";
import { Terminal } from "lucide-react";

export default function CodeBlockBasic() {
	return (
		<div className="w-full space-y-basalt-space-lg">
			<CodeBlock title="install.sh" icon={<Terminal />} lineNumbers>
				{"bun add @nocoo/basalt\n\n# Start the catalog\nbun run dev"}
			</CodeBlock>
			<CodeBlock copyable={false} icon={null}>
				{"Plain output without a header"}
			</CodeBlock>
		</div>
	);
}
