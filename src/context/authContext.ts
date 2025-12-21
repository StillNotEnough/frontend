import { createContext, useContext } from "react";
import type { CurrentUserResponse } from "../services/authService";

export interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  user: CurrentUserResponse | null;
  userLoading: boolean;
  authModal: AuthModalType | null;
  openAuthModal: (modal: AuthModalType) => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

export type AuthModalType = "login" | "signup";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
