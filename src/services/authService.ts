import { API_BASE_URL } from "./apiConfig";

const AUTH_API_URL = `${API_BASE_URL}/api/v1/auth`;
const USERS_API_URL = `${API_BASE_URL}/api/v1/users`;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
}

export interface TokenPairResponse {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresIn: number;
  username: string;
}

// интерфейс для данных пользователя из /me
export interface CurrentUserResponse {
  id: number;
  username: string;
  email: string;
  role: "USER" | "ADMIN";
  profilePictureUrl: string | null;
  oauthProvider: string | null;
  createdAt: string;
  subscriptionPlan: string; // "FREE", "PRO", "ENTERPRISE"
  subscriptionExpiresAt: string | null;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
}

class AuthService {
  private refreshPromise: Promise<TokenPairResponse> | null = null;

  // ========================================
  // 🔐 AUTHENTICATION METHODS
  // ========================================

  async login(credentials: LoginRequest): Promise<TokenPairResponse> {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error: ErrorResponse = await response.json();
          throw new Error(error.message || "Login failed");
        } else {
          const text = await response.text();
          console.error("Non-JSON response:", text.substring(0, 200));
          throw new Error(
            "Server returned non-JSON response. Check if backend is running."
          );
        }
      }

      return response.json();
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check if backend is running.");
    }
  }

  async signUp(userData: SignUpRequest): Promise<TokenPairResponse> {
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const error: ErrorResponse = await response.json();
          throw new Error(error.message || "Sign up failed");
        } else {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error(
            "Server returned non-JSON response. Check if backend is running correctly."
          );
        }
      }

      return response.json();
    } catch (error) {
      console.error("Sign up error:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error. Please check if backend is running.");
    }
  }

  // ========================================
  // USER INFO METHODS
  // ========================================

  /**
   * Получить информацию о текущем пользователе из /me
   * Возвращает актуальные данные из БД, НЕ парсит JWT!
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const accessToken = await this.getValidAccessToken();

    if (!accessToken) {
      throw new Error("No valid access token available");
    }

    try {
      const response = await fetch(`${USERS_API_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to fetch user info");
      }

      const userData: CurrentUserResponse = await response.json();

      // Сохраняем username локально для быстрого доступа в UI
      this.saveUsername(userData.username);

      console.log("✅ User info fetched from /me endpoint");
      return userData;
    } catch (error) {
      console.error("Get current user error:", error);
      throw error;
    }
  }

  /**
   * Обновить информацию текущего пользователя
   */
  async updateCurrentUser(updates: {
    email?: string;
    profilePictureUrl?: string;
  }): Promise<CurrentUserResponse> {
    const accessToken = await this.getValidAccessToken();

    if (!accessToken) {
      throw new Error("No valid access token available");
    }

    try {
      const response = await fetch(`${USERS_API_URL}/me`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Unauthorized. Please login again.");
        }
        throw new Error("Failed to update user info");
      }

      const userData: CurrentUserResponse = await response.json();
      console.log("✅ User info updated");
      return userData;
    } catch (error) {
      console.error("Update current user error:", error);
      throw error;
    }
  }

  // ========================================
  // 🔄 TOKEN MANAGEMENT
  // ========================================

  async refreshTokens(): Promise<TokenPairResponse> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<TokenPairResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data: TokenPairResponse = await response.json();
      this.saveTokens(data);

      console.log("✅ Tokens refreshed successfully");
      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.logout();
      throw error;
    }
  }

  async logoutOnBackend(): Promise<void> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) return;

    try {
      await fetch(`${AUTH_API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      console.log("✅ Logged out on backend");
    } catch (error) {
      console.error("Logout on backend failed:", error);
    }
  }

  // ========================================
  // 💾 LOCAL STORAGE METHODS
  // ========================================

  saveTokens(data: TokenPairResponse) {
    localStorage.setItem("access_token", data.accessToken);
    const accessExpiration = Date.now() + data.accessTokenExpiresIn * 1000;
    localStorage.setItem(
      "access_token_expiration",
      accessExpiration.toString()
    );

    localStorage.setItem("refresh_token", data.refreshToken);
    const refreshExpiration = Date.now() + data.refreshTokenExpiresIn * 1000;
    localStorage.setItem(
      "refresh_token_expiration",
      refreshExpiration.toString()
    );

    localStorage.setItem("username", data.username);

    console.log("✅ Tokens saved:", {
      accessExpiresIn: `${Math.floor(data.accessTokenExpiresIn / 60)} minutes`,
      refreshExpiresIn: `${Math.floor(
        data.refreshTokenExpiresIn / 86400
      )} days`,
    });
  }

  saveUsername(username: string) {
    localStorage.setItem("username", username);
  }

  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  }

  /**
   * Получить username из localStorage
   * ВНИМАНИЕ: Это для быстрого доступа в UI
   * Для получения полных данных используйте getCurrentUser()
   */
  getUsername(): string | null {
    return localStorage.getItem("username");
  }

  // ========================================
  // ✅ TOKEN VALIDATION
  // ========================================

  isAccessTokenExpired(): boolean {
    const expiration = localStorage.getItem("access_token_expiration");
    if (!expiration) {
      console.log("❌ No access token expiration found");
      return true;
    }

    const isExpired = Date.now() > parseInt(expiration);
    const secondsLeft = Math.floor((parseInt(expiration) - Date.now()) / 1000);

    if (isExpired) {
      console.log("❌ Access token expired");
    } else {
      console.log(
        `✅ Access token valid for ${secondsLeft} seconds (${Math.floor(
          secondsLeft / 60
        )} min)`
      );
    }

    return isExpired;
  }

  isRefreshTokenExpired(): boolean {
    const expiration = localStorage.getItem("refresh_token_expiration");
    if (!expiration) {
      console.log("❌ No refresh token expiration found");
      return true;
    }

    const isExpired = Date.now() > parseInt(expiration);
    const secondsLeft = Math.floor((parseInt(expiration) - Date.now()) / 1000);

    if (isExpired) {
      console.log("❌ Refresh token expired");
    } else {
      console.log(
        `✅ Refresh token valid for ${secondsLeft} seconds (${Math.floor(
          secondsLeft / 3600
        )} hours)`
      );
    }

    return isExpired;
  }

  willAccessTokenExpireSoon(): boolean {
    const expiration = localStorage.getItem("access_token_expiration");
    if (!expiration) return true;

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() > parseInt(expiration) - fiveMinutes;
  }

  isAuthenticated(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    if (!accessToken || !refreshToken) return false;

    if (this.isRefreshTokenExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("access_token_expiration");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("refresh_token_expiration");
    localStorage.removeItem("username");
    console.log("✅ Logged out locally");
  }

  async getValidAccessToken(): Promise<string | null> {
    if (this.isAccessTokenExpired() || this.willAccessTokenExpireSoon()) {
      console.log("🔄 Access token expired or expiring soon, refreshing...");

      try {
        await this.refreshTokens();
        return this.getAccessToken();
      } catch (error) {
        console.error("Failed to refresh token:", error);
        return null;
      }
    }

    return this.getAccessToken();
  }
}

export default new AuthService();