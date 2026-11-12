import { existsSync } from "node:fs";
import { join } from "node:path";
import { checkBun, checkNode, type ToolCheck, verifyLockfile } from "./tools";

export async function preflight(root: string, needs: Set<string>): Promise<ToolCheck[]> {
	const checks: ToolCheck[] = [await checkBun(root), await checkNode()];
	for (const directory of ["", "packages/basalt"]) {
		const target = join(root, directory);
		if (!existsSync(join(target, "node_modules"))) {
			checks.push({
				name: `node_modules ${directory || "root"}`,
				ok: false,
				detail: `${join(directory, "node_modules")} is missing; run bun install`,
			});
		} else {
			checks.push({
				name: `node_modules ${directory || "root"}`,
				ok: true,
				detail: "installed",
			});
		}
	}
	checks.push(await verifyLockfile(root));
	void needs;
	return checks;
}
