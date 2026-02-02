import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import csCommon from "./locales/cs/common.json";
import csScreens from "./locales/cs/screens.json";
import csDefects from "./locales/cs/defects.json";

import enCommon from "./locales/en/common.json";
import enScreens from "./locales/en/screens.json";
import enDefects from "./locales/en/defects.json";

export type AppLanguage = "cs" | "en";

const resources = {
  cs: {
    common: csCommon,
    screens: csScreens,
    defects: csDefects,
  },
  en: {
    common: enCommon,
    screens: enScreens,
    defects: enDefects,
  },
} as const;

const deviceLang = Localization.getLocales()[0]?.languageCode;
const initialLang: AppLanguage = deviceLang === "en" ? "en" : "cs";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: "en",
  supportedLngs: ["cs", "en"],
  defaultNS: "common",
  ns: ["common", "screens", "defects"],
  interpolation: { escapeValue: false },
});

export default i18n;