"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from "react";
import i18n from "@/i18n";

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  changeLanguage: () => {},
});

const readLangSync = (): string => {
  if (typeof document !== "undefined") {
    const cookieLang = document.cookie
      .split("; ")
      .find((r) => r.startsWith("i18nextLng="))
      ?.split("=")[1];
    const stored = localStorage.getItem("i18nextLng");
    return cookieLang || stored || "en";
  }
  return "en";
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<string>(readLangSync());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
    setReady(true);
  }, [language]);

  const changeLanguage = (lang: string): void => {
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
    localStorage.setItem("i18nextLng", lang);
    document.cookie = `i18nextLng=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    setLanguage(lang);
  };

  const value = useMemo(() => ({ language, changeLanguage }), [language]);

  if (!ready) return null;

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType =>
  useContext(LanguageContext);
