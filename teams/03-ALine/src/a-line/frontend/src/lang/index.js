import { createI18n } from "vue-i18n";
import { changeDayJsLocale } from "../utils/time/dateUtils";
import en from "./en/index";
import zh from "./zh/index";

const messages = {
  en: {
    ...en,
  },
  zh: {
    ...zh,
  },
};

const currentLocale = window.localStorage.getItem("language") || "en";
changeDayJsLocale(currentLocale);
const i18n = new createI18n({
  globalInjection: true,
  locale: currentLocale,
  messages,
  legacy: false,
});

export default i18n;
