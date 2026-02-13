import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LifeAiPage from "@/pages/LifeAiPage";

// Mock recharts to avoid DOM rendering issues in jsdom
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Line: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Pie: () => null,
  Sector: () => null,
  Legend: () => null,
  ReferenceLine: () => null,
  Rectangle: () => null,
}));

describe("LifeAiPage", () => {
  it("renders all four stat cards", () => {
    render(<LifeAiPage />);
    expect(screen.getByText("Insight Score")).toBeInTheDocument();
    expect(screen.getByText("Risk Alerts")).toBeInTheDocument();
    expect(screen.getByText("Automation")).toBeInTheDocument();
    expect(screen.getByText("Data Freshness")).toBeInTheDocument();
  });

  it("renders stat values", () => {
    render(<LifeAiPage />);
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("68%")).toBeInTheDocument();
    expect(screen.getByText("2h")).toBeInTheDocument();
  });

  it("renders chart section headers", () => {
    render(<LifeAiPage />);
    expect(screen.getByText("AI readiness trend")).toBeInTheDocument();
    expect(screen.getByText("Recommendation impact")).toBeInTheDocument();
  });

  it("renders prompt and recommendations sections", () => {
    render(<LifeAiPage />);
    expect(screen.getByText("Prompt studio")).toBeInTheDocument();
    expect(screen.getByText("Recommended actions")).toBeInTheDocument();
    expect(screen.getByText("Insight timeline")).toBeInTheDocument();
  });
});
