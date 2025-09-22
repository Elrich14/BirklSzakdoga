import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import huTranslation from "./locales/hu/translation.json";

const resources = {
  en: { translation: enTranslation },
  hu: { translation: huTranslation },
};

const getInitialLang = (): string => {
  if (typeof document !== "undefined") {
    const cookieLang = document.cookie
      .split("; ")
      .find((row) => row.startsWith("i18nextLng="))
      ?.split("=")[1];
    const stored = localStorage.getItem("i18nextLng");
    return cookieLang || stored || "en";
  }
  return "en";
};

const initialLang = getInitialLang();

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
