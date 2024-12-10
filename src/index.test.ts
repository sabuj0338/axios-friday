import { describe, expect, it } from "vitest";
import { Friday } from "./friday";

describe("GET /", () => {
  const baseURL = "https://sabuj0338.github.io/portfolio";

  const friday = new Friday({ baseURL: baseURL });

  it("should return a Hello World! message", async () => {
    const response = await friday.get(new URL(baseURL));
    expect(response?.status).toBe(200);
  });
});
