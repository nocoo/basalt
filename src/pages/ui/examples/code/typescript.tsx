import { CodeHighlighted } from "@nocoo/basalt/components/code";

export default function CodeTypescript() {
	return (
		<CodeHighlighted
			code={`export async function fetchUser(id: string, retries = 3) {
  const response = await fetch("/api/users/" + id);
  if (!response.ok) {
    throw new Error("User not found");
  }
  const user = await response.json();
  return {
    id: user.id,
    name: user.firstName + " " + user.lastName,
  };
}`}
		/>
	);
}
