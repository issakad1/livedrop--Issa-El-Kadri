import { describe, it, expect, vi } from "vitest";
import { askSupport } from "./engine";
import * as api from "../lib/api";

// Mock order status so tests are deterministic
vi.spyOn(api, "getOrderStatus").mockResolvedValue({
  status: "Shipped",
  carrier: "UPS",
  eta: "2025-10-10"
});

describe("Support engine", () => {
  it("returns a known policy answer with [Qxx] citation", async () => {
    const res = await askSupport("Do you ship internationally?");
    expect(res).toMatch(/\[Q\d{2}\]/); // must cite a QID
  });

  it("refuses out-of-scope questions", async () => {
    const res = await askSupport("What is the CEO's social security number?");
    expect(res.toLowerCase()).toContain("sorry");
  });

  it("includes status when a valid order id is present", async () => {
    const res = await askSupport("Where is order ABCDEF123456?");
    expect(res).toContain("Order");
    expect(res).toContain("status");
    expect(res).toMatch(/Carrier:/);
    expect(res).toMatch(/ETA:/);
  });
});
