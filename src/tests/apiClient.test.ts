import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { fetchWithAuth } from "../services/apiClient";
import authService, { type TokenPairResponse } from "../services/authService";
import { openAuthModal } from "../services/authModalController";
import { requestLogout } from "../services/authSessionController";

vi.mock("../services/authService", () => ({
  default: {
    getValidAccessToken: vi.fn(),
    refreshTokens: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

vi.mock("../services/authModalController", () => ({
  openAuthModal: vi.fn(),
}));

vi.mock("../services/authSessionController", () => ({
  requestLogout: vi.fn(),
}));

describe("fetchWithAuth", () => {
  const fetchMock = vi.fn();
  const tokenPair: TokenPairResponse = {
    accessToken: "new-token",
    accessTokenExpiresIn: 3600,
    refreshToken: "refresh-token",
    refreshTokenExpiresIn: 7200,
    username: "test-user",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as typeof fetch;
    (authService.getValidAccessToken as Mock).mockResolvedValue("valid-token");
    (authService.getAccessToken as Mock).mockReturnValue("new-token");
    (authService.refreshTokens as Mock).mockResolvedValue(tokenPair);
    (requestLogout as Mock).mockResolvedValue(undefined);
  });

  it("returns response for successful request", async () => {
    const response = new Response(null, { status: 200 });
    fetchMock.mockResolvedValue(response);

    const result = await fetchWithAuth("/api/data", { method: "GET" });

    expect(result).toBe(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/data$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer valid-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("refreshes token on 401 and retries request", async () => {
    const unauthorizedResponse = new Response(null, { status: 401 });
    const successResponse = new Response(null, { status: 200 });

    fetchMock
      .mockResolvedValueOnce(unauthorizedResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await fetchWithAuth("/api/data", { method: "GET" });

    expect(result).toBe(successResponse);
    expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(/\/api\/data$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer new-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("logs out when refresh fails", async () => {
    const unauthorizedResponse = new Response(null, { status: 401 });
    fetchMock.mockResolvedValueOnce(unauthorizedResponse);
    (authService.refreshTokens as Mock).mockRejectedValue(
      new Error("refresh failed")
    );

    await expect(fetchWithAuth("/api/data", { method: "GET" })).rejects.toThrow(
      "refresh failed"
    );

    expect(requestLogout).toHaveBeenCalledTimes(1);
    expect(openAuthModal).toHaveBeenCalledWith("login");
  });
});
