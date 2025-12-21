import type { AuthModalType } from "../context/authContext";

type AuthModalListener = (modal: AuthModalType) => void;

let authModalListener: AuthModalListener | null = null;

export const setAuthModalListener = (listener: AuthModalListener | null) => {
  authModalListener = listener;
};

export const openAuthModal = (modal: AuthModalType = "login") => {
  authModalListener?.(modal);
};