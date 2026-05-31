import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests under the limit", () => {
    const id = `test-${Date.now()}-a`;
    const r = rateLimit(id, 5, 60_000);
    expect(r.success).toBe(true);
    expect(r.remaining).toBe(4);
  });

  it("blocks requests over the limit", () => {
    const id = `test-${Date.now()}-b`;
    for (let i = 0; i < 3; i++) {
      rateLimit(id, 2, 60_000);
    }
    const blocked = rateLimit(id, 2, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });
});
