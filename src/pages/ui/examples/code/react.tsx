import { CodeHighlighted } from "@nocoo/basalt/components/code";

export default function CodeReact() {
	return (
		<CodeHighlighted
			code={`import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((n) => n + 1)}>
      Count: {count}
    </button>
  );
}`}
		/>
	);
}
