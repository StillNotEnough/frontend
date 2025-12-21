import authService, { type CurrentUserResponse } from "./authService";
import { apiClient } from "./apiClient";

const USERS_API_URL = "/api/v1/users";

class UserService {
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get(`${USERS_API_URL}/me`);

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error("Failed to fetch user info");
    }

    const userData: CurrentUserResponse = await response.json();
    authService.saveUsername(userData.username);
    console.log("✅ User info fetched from /me endpoint");
    return userData;
  }

  async updateCurrentUser(updates: {
    email?: string;
    profilePictureUrl?: string;
  }): Promise<CurrentUserResponse> {
    const response = await apiClient.put(`${USERS_API_URL}/me`, updates);

    if (!response.ok) {
      if (response.status === 401) {
        authService.logout();
        throw new Error("Unauthorized. Please login again.");
      }
      throw new Error("Failed to update user info");
    }

    const userData: CurrentUserResponse = await response.json();
    console.log("✅ User info updated");
    return userData;
  }
}

export default new UserService();