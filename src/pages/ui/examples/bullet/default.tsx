import { BulletChart } from "@nocoo/basalt/charts/bullet";

const data = [
	{ name: "Revenue", value: 68, target: 80 },
	{ name: "Retention", value: 72, target: 85 },
	{ name: "Adoption", value: 58, target: 70 },
];

export default function BulletDefault() {
	return <BulletChart data={data} />;
}
