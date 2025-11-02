// src/context/UIContext.tsx
import { createContext, useState, useEffect, useContext } from "react";

export interface UIContextType {
  subject: string;
  setSubject: (subject: string) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  sidebarExtended: boolean;
  setSidebarExtended: (extended: boolean) => void;
}

export const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [subject, setSubject] = useState("general");
  
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const savedTheme = localStorage.getItem("theme");
    return (savedTheme as "light" | "dark") || "light";
  });

  const [sidebarExtended, setSidebarExtended] = useState(true);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <UIContext.Provider
      value={{
        subject,
        setSubject,
        theme,
        toggleTheme,
        sidebarExtended,
        setSidebarExtended,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within UIProvider");
  }
  return context;
};