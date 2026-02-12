import { describe, it, expect } from "vitest";
import { filterFAQs, faqCount } from "@/models/help";
import type { FAQ } from "@/models/types";

const sample: FAQ[] = [
  { q: "How do I reset my password?", a: "Go to Settings > Security > Reset Password." },
  { q: "Can I export data?", a: "Yes, use the Export CSV button on the Transactions page." },
  { q: "What payment methods are supported?", a: "Visa, Mastercard, and bank transfers." },
];

describe("filterFAQs", () => {
  it("returns all items when query is empty", () => {
    expect(filterFAQs(sample, "")).toEqual(sample);
    expect(filterFAQs(sample, "   ")).toEqual(sample);
  });

  it("filters by question text (case-insensitive)", () => {
    const result = filterFAQs(sample, "export");
    expect(result).toHaveLength(1);
    expect(result[0].q).toContain("export");
  });

  it("filters by answer text", () => {
    const result = filterFAQs(sample, "Visa");
    expect(result).toHaveLength(1);
    expect(result[0].a).toContain("Visa");
  });

  it("returns empty array when no match", () => {
    expect(filterFAQs(sample, "cryptocurrency")).toHaveLength(0);
  });
});

describe("faqCount", () => {
  it("returns correct count", () => {
    expect(faqCount(sample)).toBe(3);
  });

  it("returns 0 for empty array", () => {
    expect(faqCount([])).toBe(0);
  });
});
