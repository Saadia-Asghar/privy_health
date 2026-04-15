import { createContext, useContext, useEffect, useState } from "react";
import en from "./en.js";
import ur from "./ur.js";

const ctx = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("ph_lang") || "en");

  useEffect(() => {
    localStorage.setItem("ph_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key) => {
    const dict = lang === "ur" ? ur : en;
    return dict[key] || key;
  };

  const toggle = () => setLang((l) => (l === "en" ? "ur" : "en"));

  return <ctx.Provider value={{ lang, toggle, t, isUrdu: lang === "ur" }}>{children}</ctx.Provider>;
}

export const useT = () => useContext(ctx);
