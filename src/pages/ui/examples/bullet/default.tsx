import { BulletChart } from "@nocoo/basalt/charts/bullet";

export default function BulletDefault() {
	return <BulletChart data={[{ name: "Revenue", value: 68, target: 80 }]} />;
}
