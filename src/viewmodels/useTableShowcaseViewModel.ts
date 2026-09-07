import { useMemo, useState } from "react";

export type TableShowcaseTab = "companies" | "deals" | "forecast";

export const COMPANY_ROWS = [
	{
		id: "atlas",
		name: "Atlas",
		tags: ["Enterprise", "Upsell"],
		owner: "Sarah Nguyen",
		initials: "SN",
		deals: 7,
		pipeline: 420000,
		win: 70,
		trend: [12, 18, 16, 24, 22, 28, 31],
		lastDate: "Feb 21",
		lastKind: "QBR Call",
		stage: "Upsell",
	},
	{
		id: "northstar",
		name: "Northstar",
		tags: ["Enterprise", "New Logo"],
		owner: "James Taylor",
		initials: "JT",
		deals: 4,
		pipeline: 311242,
		win: 51,
		trend: [8, 12, 10, 16, 18, 17, 22],
		lastDate: "Feb 22",
		lastKind: "Demo",
		stage: "New Logo",
	},
	{
		id: "harbor",
		name: "Harbor",
		tags: ["Enterprise"],
		owner: "Maria Keller",
		initials: "MK",
		deals: 5,
		pipeline: 124232,
		win: 22,
		trend: [22, 18, 14, 12, 9, 11, 8],
		lastDate: "Mar 12",
		lastKind: "Security",
		stage: "Enterprise",
	},
	{
		id: "meridian",
		name: "Meridian",
		tags: ["Renewal"],
		owner: "Nia Jameson",
		initials: "NJ",
		deals: 2,
		pipeline: 221231,
		win: 77,
		trend: [14, 16, 18, 21, 24, 22, 26],
		lastDate: "Mar 17",
		lastKind: "Legal",
		stage: "Renewal",
	},
	{
		id: "orbit",
		name: "Orbit",
		tags: ["Pilot"],
		owner: "Alex Santos",
		initials: "AS",
		deals: 6,
		pipeline: 530111,
		win: 82,
		trend: [20, 24, 22, 28, 32, 30, 36],
		lastDate: "Mar 12",
		lastKind: "Exec",
		stage: "Pilot",
	},
	{
		id: "summit",
		name: "Summit",
		tags: ["Strategic", "Expansion"],
		owner: "Mark Darnalds",
		initials: "MD",
		deals: 8,
		pipeline: 320222,
		win: 86,
		trend: [18, 22, 26, 24, 30, 34, 38],
		lastDate: "Mar 15",
		lastKind: "Pilot",
		stage: "Expansion",
	},
	{
		id: "cedar",
		name: "Cedar",
		tags: ["Upsell", "Expansion"],
		owner: "Drew Nash",
		initials: "DN",
		deals: 3,
		pipeline: 122230,
		win: 51,
		trend: [10, 12, 11, 16, 14, 18, 17],
		lastDate: "Mar 18",
		lastKind: "Pricing",
		stage: "Upsell",
	},
	{
		id: "lumen",
		name: "Lumen",
		tags: ["Enterprise", "Mid-Market"],
		owner: "Lina Wong",
		initials: "LW",
		deals: 5,
		pipeline: 230112,
		win: 61,
		trend: [16, 14, 18, 20, 19, 22, 24],
		lastDate: "Mar 28",
		lastKind: "Product",
		stage: "Enterprise",
	},
	{
		id: "ridge",
		name: "Ridge",
		tags: ["Mid-Market", "Upsell"],
		owner: "Jamie Fox",
		initials: "JF",
		deals: 2,
		pipeline: 420222,
		win: 38,
		trend: [28, 24, 20, 18, 16, 14, 15],
		lastDate: "Jun 14",
		lastKind: "Pricing",
		stage: "Upsell",
	},
	{
		id: "vale",
		name: "Vale",
		tags: ["SMB", "Enterprise"],
		owner: "Kate Chen",
		initials: "KC",
		deals: 8,
		pipeline: 112277,
		win: 24,
		trend: [6, 8, 7, 10, 9, 12, 11],
		lastDate: "Jun 7",
		lastKind: "Renewal",
		stage: "Enterprise",
	},
	{
		id: "forge",
		name: "Forge",
		tags: ["Mid-Market"],
		owner: "Ricky Brown",
		initials: "RB",
		deals: 3,
		pipeline: 221221,
		win: 72,
		trend: [12, 14, 18, 16, 20, 22, 21],
		lastDate: "Jun 18",
		lastKind: "Pilot",
		stage: "Mid-Market",
	},
	{
		id: "beacon",
		name: "Beacon",
		tags: ["Land & Expand"],
		owner: "Hannah Mills",
		initials: "HM",
		deals: 5,
		pipeline: 170991,
		win: 55,
		trend: [9, 12, 14, 13, 16, 18, 20],
		lastDate: "Jul 1",
		lastKind: "Expansion",
		stage: "Expansion",
	},
] as const;

export type CompanyRow = (typeof COMPANY_ROWS)[number];

export const DEAL_ROWS = [
	{
		id: "d-atlas-1",
		name: "Atlas platform",
		company: "Atlas",
		stage: "Upsell",
		value: 180000,
		close: "Mar 4",
		owner: "Sarah Nguyen",
	},
	{
		id: "d-orbit-1",
		name: "Orbit seat expansion",
		company: "Orbit",
		stage: "Pilot",
		value: 240000,
		close: "Mar 18",
		owner: "Alex Santos",
	},
	{
		id: "d-summit-1",
		name: "Summit enterprise",
		company: "Summit",
		stage: "Expansion",
		value: 210000,
		close: "Apr 2",
		owner: "Mark Darnalds",
	},
	{
		id: "d-meridian-1",
		name: "Meridian renewal",
		company: "Meridian",
		stage: "Renewal",
		value: 96000,
		close: "Apr 11",
		owner: "Nia Jameson",
	},
	{
		id: "d-ridge-1",
		name: "Ridge mid-market",
		company: "Ridge",
		stage: "Upsell",
		value: 132000,
		close: "May 9",
		owner: "Jamie Fox",
	},
	{
		id: "d-forge-1",
		name: "Forge analytics",
		company: "Forge",
		stage: "Mid-Market",
		value: 88000,
		close: "May 22",
		owner: "Ricky Brown",
	},
] as const;

export type DealRow = (typeof DEAL_ROWS)[number];

export const INVOICE_ROWS = [
	{ id: "INV-2041", customer: "Nova Labs", status: "Paid", amount: 12400, date: "2026-02-01" },
	{ id: "INV-2042", customer: "Violet Corp", status: "Pending", amount: 5950, date: "2026-02-03" },
	{ id: "INV-2043", customer: "Atlas Works", status: "Paid", amount: 8100, date: "2026-02-05" },
	{ id: "INV-2044", customer: "Echo Systems", status: "Overdue", amount: 3250, date: "2026-02-07" },
	{ id: "INV-2045", customer: "Harbor Line", status: "Paid", amount: 16400, date: "2026-02-12" },
	{ id: "INV-2046", customer: "Cedar North", status: "Pending", amount: 4420, date: "2026-02-18" },
] as const;

export const DEVICE_ROWS = [
	{
		id: "edge-01",
		name: "Atlas gateway",
		region: "US East",
		status: "Online",
		battery: 94,
		requests: 4820,
	},
	{
		id: "edge-02",
		name: "Northstar relay",
		region: "EU West",
		status: "Online",
		battery: 67,
		requests: 3612,
	},
	{
		id: "edge-03",
		name: "Meridian sensor",
		region: "AP South",
		status: "Warning",
		battery: 14,
		requests: 920,
	},
	{
		id: "edge-04",
		name: "Orbit bridge",
		region: "US West",
		status: "Offline",
		battery: 0,
		requests: 0,
	},
	{
		id: "edge-05",
		name: "Summit beacon",
		region: "EU Central",
		status: "Online",
		battery: 42,
		requests: 2841,
	},
] as const;

export type DeviceRow = (typeof DEVICE_ROWS)[number];

function unique(values: readonly string[]) {
	return [...new Set(values)];
}

export function useTableShowcaseViewModel() {
	const [tab, setTab] = useState<TableShowcaseTab>("companies");
	const [owner, setOwner] = useState("all");
	const [stage, setStage] = useState("all");
	const [selected, setSelected] = useState<string[]>(["summit"]);
	const [invoiceQuery, setInvoiceQuery] = useState("");
	const [deviceStatus, setDeviceStatus] = useState("all");

	const companies = useMemo(
		() =>
			COMPANY_ROWS.filter(
				(row) =>
					(owner === "all" || row.owner === owner) && (stage === "all" || row.stage === stage),
			),
		[owner, stage],
	);
	const deals = useMemo(
		() =>
			DEAL_ROWS.filter(
				(row) =>
					(owner === "all" || row.owner === owner) && (stage === "all" || row.stage === stage),
			),
		[owner, stage],
	);
	const forecast = useMemo(() => {
		const groups = new Map<
			string,
			{ stage: string; count: number; pipeline: number; win: number }
		>();
		for (const row of companies) {
			const current = groups.get(row.stage) ?? { stage: row.stage, count: 0, pipeline: 0, win: 0 };
			current.count += 1;
			current.pipeline += row.pipeline;
			current.win += row.win;
			groups.set(row.stage, current);
		}
		return [...groups.values()].map((row) => ({
			...row,
			win: row.count ? Math.round(row.win / row.count) : 0,
		}));
	}, [companies]);
	const devices = useMemo(
		() => DEVICE_ROWS.filter((row) => deviceStatus === "all" || row.status === deviceStatus),
		[deviceStatus],
	);

	const pipelineSum = companies.reduce((sum, row) => sum + row.pipeline, 0);
	const winAvg = companies.length
		? Math.round(companies.reduce((sum, row) => sum + row.win, 0) / companies.length)
		: 0;

	return {
		tab,
		setTab,
		owner,
		setOwner,
		stage,
		setStage,
		selected,
		setSelected,
		invoiceQuery,
		setInvoiceQuery,
		deviceStatus,
		setDeviceStatus,
		companies,
		deals,
		forecast,
		invoices: INVOICE_ROWS,
		devices,
		owners: unique(COMPANY_ROWS.map((row) => row.owner)),
		stages: unique(COMPANY_ROWS.map((row) => row.stage)),
		deviceStates: unique(DEVICE_ROWS.map((row) => row.status)),
		pipelineSum,
		winAvg,
		companyCount: companies.length,
		dealCount: deals.length,
	};
}
