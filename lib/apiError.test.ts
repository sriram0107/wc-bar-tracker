import { afterEach, describe, expect, it, vi } from "vitest";
import { getClientErrorMessage } from "@/lib/apiError";

describe("getClientErrorMessage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the error message in development", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(getClientErrorMessage(new Error("Secret details"))).toBe(
      "Secret details"
    );
  });

  it("returns a generic message in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(getClientErrorMessage(new Error("Secret details"))).toBe(
      "Internal server error"
    );
  });
});
