import { describe, expect, it } from "vitest";
import BorakApiClient from "./borak";

describe('GET /', () => {

  const baseURL = "https://hundred-api.vercel.app";

  const borak = new BorakApiClient({
    baseURL: baseURL,
    accessTokenKey: "accessToken",
    refreshTokenKey: "refreshToken",
    refreshTokenAPI: "/api/refresh",
    enableRefreshToken: false,
  });

  it('should return a Hello World! message', async () => {
    const response = await borak.get(new URL(baseURL));
    expect(response).toBe("Hello World!");
  });
});