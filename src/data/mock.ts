// Centralized mock data for all pages.
// Type definitions live in @/models/types.ts — edit those to match your domain.

import type {
	Account,
	ActivityItem,
	Budget,
	CreditCard,
	Goal,
	MonthlyBudget,
	PortfolioItem,
	ShowcaseDialog,
	ShowcaseToast,
	Transaction,
} from "@/models/types";

// ── Wallet ──
export const accounts: Account[] = [
	{ name: "Primary Care", balance: 12450.8, currency: "USD", change: "+2.4%" },
	{ name: "Care Plan", balance: 8200.0, currency: "USD", change: "+5.1%" },
	{ name: "Wellness Reserve", balance: 23100.5, currency: "USD", change: "+8.7%" },
];

export const walletActivity: ActivityItem[] = [
	{ desc: "Referral to Care Plan", amount: -500, date: "Today" },
	{ desc: "Reimbursement received", amount: 250, date: "Yesterday" },
	{ desc: "Pharmacy pickup", amount: -200, date: "Feb 9" },
	{ desc: "Insurance reimbursement", amount: 45.99, date: "Feb 8" },
];

// ── Cards ──
export const creditCards: CreditCard[] = [
	{
		name: "Care Team Card",
		bank: "North Clinic",
		network: "visa",
		number: "4532 •••• •••• 7890",
		expiry: "09/28",
		balance: 3250.0,
		limit: 10000,
		color: "from-blue-600 to-blue-800",
	},
	{
		name: "Wellness Card",
		bank: "South Clinic",
		network: "mastercard",
		number: "5412 •••• •••• 3456",
		expiry: "03/27",
		balance: 1820.5,
		limit: 5000,
		color: "from-purple-600 to-purple-800",
	},
	{
		name: "Emergency Care Card",
		bank: "Central Hospital",
		network: "amex",
		number: "3742 •••• •••• 1234",
		expiry: "12/29",
		balance: 8400.0,
		limit: 25000,
		color: "from-neutral-800 to-neutral-950",
	},
];

// ── Transactions ──
export const transactions: Transaction[] = [
	{
		id: 1,
		name: "Sleep coaching",
		category: "Sleep & recovery",
		amount: -15.99,
		date: "Feb 11, 2026",
		status: "Completed",
	},
	{
		id: 2,
		name: "Employer wellness benefit",
		category: "Care reimbursements",
		amount: 5200.0,
		date: "Feb 10, 2026",
		status: "Completed",
	},
	{
		id: 3,
		name: "Nutrition consult",
		category: "Nutrition",
		amount: -82.4,
		date: "Feb 10, 2026",
		status: "Completed",
	},
	{
		id: 4,
		name: "Therapy reimbursement",
		category: "Care reimbursements",
		amount: 1200.0,
		date: "Feb 8, 2026",
		status: "Completed",
	},
	{
		id: 5,
		name: "Lab testing",
		category: "Lab services",
		amount: -145.0,
		date: "Feb 7, 2026",
		status: "Completed",
	},
	{
		id: 6,
		name: "Dietitian visit",
		category: "Nutrition",
		amount: -56.8,
		date: "Feb 6, 2026",
		status: "Completed",
	},
	{
		id: 7,
		name: "Physical therapy",
		category: "Mobility",
		amount: -42.0,
		date: "Feb 5, 2026",
		status: "Pending",
	},
	{
		id: 8,
		name: "Specialist referral",
		category: "Referral",
		amount: -300.0,
		date: "Feb 4, 2026",
		status: "Completed",
	},
	{
		id: 9,
		name: "Fitness program",
		category: "Health",
		amount: -49.99,
		date: "Feb 3, 2026",
		status: "Completed",
	},
	{
		id: 10,
		name: "Health incentive",
		category: "Care reimbursements",
		amount: 85.5,
		date: "Feb 2, 2026",
		status: "Completed",
	},
];

// ── Budget ──
export const budgets: Budget[] = [
	{ category: "Nutrition & Dining", spent: 420, limit: 600 },
	{ category: "Mobility & exercise", spent: 180, limit: 300 },
	{ category: "Sleep & recovery", spent: 95, limit: 150 },
	{ category: "Medical supplies", spent: 310, limit: 400 },
	{ category: "Lab services", spent: 245, limit: 250 },
];

export const monthlyBudgetData: MonthlyBudget[] = [
	{ month: "Jul", budget: 1500, actual: 1200 },
	{ month: "Aug", budget: 1500, actual: 1400 },
	{ month: "Sep", budget: 1600, actual: 1550 },
	{ month: "Oct", budget: 1600, actual: 1300 },
	{ month: "Nov", budget: 1700, actual: 1800 },
	{ month: "Dec", budget: 1700, actual: 1650 },
];

// ── Goals ──
export const goals: Goal[] = [
	{ name: "Emergency care", target: 10000, saved: 7500, icon: "shield" },
	{ name: "Rest and recovery", target: 5000, saved: 2200, icon: "plane" },
	{ name: "Mobility goal", target: 30000, saved: 12000, icon: "car" },
	{ name: "Long-term wellness", target: 60000, saved: 18000, icon: "home" },
];

// ── Analytics ──
export const analyticsStats = [
	{ label: "Avg. daily care spend", value: "$142", change: "-3.2%" },
	{ label: "Care touchpoints/day", value: "8.4", change: "+1.5%" },
	{ label: "Care Plan Rate", value: "24%", change: "+2.1%" },
	{ label: "Top health focus", value: "Nutrition", change: "35%" },
];

// ── Care Funding Flow ──
export const monthlyFlow = [
	{ month: "Jul", inflow: 6200, outflow: 4800 },
	{ month: "Aug", inflow: 5800, outflow: 5200 },
	{ month: "Sep", inflow: 7100, outflow: 4900 },
	{ month: "Oct", inflow: 6500, outflow: 5500 },
	{ month: "Nov", inflow: 8200, outflow: 6100 },
	{ month: "Dec", inflow: 7400, outflow: 5800 },
	{ month: "Jan", inflow: 6800, outflow: 5300 },
	{ month: "Feb", inflow: 7900, outflow: 5100 },
];

// ── Care Funds ──
export const portfolio: PortfolioItem[] = [
	{ name: "Primary care fund", value: 45000, allocation: 45, change: "+12.4%", up: true },
	{ name: "Therapy fund", value: 20000, allocation: 20, change: "+3.2%", up: true },
	{ name: "Recovery fund", value: 15000, allocation: 15, change: "+7.8%", up: true },
	{ name: "Medication fund", value: 10000, allocation: 10, change: "-5.1%", up: false },
	{ name: "Emergency reserve", value: 10000, allocation: 10, change: "+0.5%", up: true },
];

export const performanceData = [
	{ month: "Jan", value: 82000 },
	{ month: "Feb", value: 84800 },
	{ month: "Mar", value: 87100 },
	{ month: "Apr", value: 85900 },
	{ month: "May", value: 90300 },
	{ month: "Jun", value: 92800 },
	{ month: "Jul", value: 94100 },
	{ month: "Aug", value: 96600 },
	{ month: "Sep", value: 95200 },
	{ month: "Oct", value: 98700 },
	{ month: "Nov", value: 101200 },
	{ month: "Dec", value: 104800 },
];

// ── Interaction Showcase ──
export const showcaseToasts: ShowcaseToast[] = [
	{
		id: "t1",
		title: "Changes saved",
		description: "Your wellness profile has been updated successfully.",
		variant: "success",
	},
	{
		id: "t2",
		title: "New message",
		description: "Your care team sent a new appointment reminder.",
		variant: "default",
	},
	{
		id: "t3",
		title: "Payment failed",
		description: "Your card was declined. Please try another method.",
		variant: "error",
	},
	{
		id: "t4",
		title: "Storage almost full",
		description: "You have used 90% of your available storage.",
		variant: "warning",
	},
	{
		id: "t5",
		title: "Update available",
		description: "A new version of the app is ready to install.",
		variant: "info",
	},
];

export const showcaseDialogs: ShowcaseDialog[] = [
	{
		id: "d1",
		title: "About Basalt",
		description:
			"This health management demo brings wellness records, appointments, care plans, and care funding together.",
		style: "info",
	},
	{
		id: "d2",
		title: "Send Feedback",
		description: "Let us know how we can improve your experience.",
		style: "form",
	},
	{
		id: "d3",
		title: "Delete Account",
		description:
			"This action cannot be undone. All your data will be permanently removed from our servers.",
		style: "confirm",
	},
];
