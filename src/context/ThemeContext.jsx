import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("ph_theme") || "system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const resolved = theme === "system" ? (media.matches ? "dark" : "light") : theme;
    document.documentElement.setAttribute("data-theme", resolved);
    localStorage.setItem("ph_theme", theme);

    const onChange = () => {
      if (theme === "system") {
        document.documentElement.setAttribute("data-theme", media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const value = useMemo(() => {
    const attr = document.documentElement.getAttribute("data-theme") || "light";
    return {
      theme,
      toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      isDark: attr === "dark"
    };
  }, [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}
