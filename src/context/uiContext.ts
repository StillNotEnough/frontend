import { createContext, useContext } from "react";

export interface UIContextType {
  subject: string;
  setSubject: (subject: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarExtended: boolean;
  setSidebarExtended: (extended: boolean) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};
