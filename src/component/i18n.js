import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en.json";
import es from "../locales/es.json";
import guj from "../locales/guj.json";
import hi from "../locales/hi.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      hi: { translation: hi },
      guj: { translation: guj },
    },
    lng: localStorage.getItem("language") || "en", 
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
