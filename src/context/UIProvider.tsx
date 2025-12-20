import { useEffect, useState } from "react";
import { UIContext } from "./uiContext";

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
