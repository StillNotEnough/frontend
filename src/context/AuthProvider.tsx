import authService, { type CurrentUserResponse } from "../services/authService";
import { useCallback, useEffect, useState } from "react";
import userService from "../services/userService";

import { AuthContext, type AuthModalType } from "./authContext";
import { setAuthModalListener } from "../services/authModalController";
import { setLogoutHandler } from "../services/authSessionController";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );
  const [username, setUsername] = useState(authService.getUsername());
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalType | null>(null);

  const openAuthModal = useCallback((modal: AuthModalType) => {
    setAuthModal(modal);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModal(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null);
      setUsername(null);
      return;
    }

    try {
      setUserLoading(true);
      const userData = await userService.getCurrentUser();
      setUser(userData);
      setUsername(userData.username);
      console.log("✅ User data loaded from /me:", userData);
    } catch (error) {
      console.error("❌ Failed to load user data:", error);
      setUsername(authService.getUsername());
    } finally {
      setUserLoading(false);
    }
  }, [isAuthenticated]);

  const logout = useCallback(async () => {
    await authService.logoutOnBackend();
    authService.logout();
    setIsAuthenticated(false);
    setUsername(null);
    setUser(null);
  }, []);

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = authService.getRefreshToken();

      if (!refreshToken) {
        setIsAuthenticated(false);
        setUsername(null);
        setUser(null);
        return;
      }

      if (authService.isRefreshTokenExpired()) {
        console.log("🔴 Refresh token expired on load");
        logout();
        return;
      }

      if (
        authService.isAccessTokenExpired() ||
        authService.willAccessTokenExpireSoon()
      ) {
        console.log(
          "🔄 Access token expired/expiring on page load, refreshing..."
        );

        try {
          await authService.refreshTokens();
          console.log("✅ Tokens refreshed on page load");

          setIsAuthenticated(true);
          setUsername(authService.getUsername());
          await refreshUser();
        } catch (error) {
          console.error("❌ Failed to refresh on load:", error);
          logout();
        }
      } else {
        setIsAuthenticated(true);
        setUsername(authService.getUsername());
        await refreshUser();
      }
    };

    checkAuth();
  }, [logout, refreshUser]);

  // Автообновление токенов
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      if (authService.willAccessTokenExpireSoon()) {
        console.log("🔄 Access token expiring soon, refreshing...");

        try {
          await authService.refreshTokens();
          console.log("✅ Tokens refreshed in background");
        } catch (error) {
          console.error("❌ Failed to refresh tokens:", error);
          logout();
        }
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  // Проверка истечения refresh token
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      if (authService.isRefreshTokenExpired()) {
        console.log("🔴 Refresh token expired, logging out...");
        alert("Your session has expired. Please log in again.");
        logout();
      }
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout]);

  useEffect(() => {
    setAuthModalListener(openAuthModal);
    return () => setAuthModalListener(null);
  }, [openAuthModal]);

  useEffect(() => {
    setLogoutHandler(logout);
    return () => setLogoutHandler(null);
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        user,
        userLoading,
        authModal,
        openAuthModal,
        closeAuthModal,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
