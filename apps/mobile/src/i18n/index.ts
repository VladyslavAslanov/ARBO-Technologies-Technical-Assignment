import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import csCommon from "./locales/cs/common.json";
import csScreens from "./locales/cs/screens.json";
import csDefects from "./locales/cs/defects.json";

const resources = {
  cs: {
    common: csCommon,
    screens: csScreens,
    defects: csDefects,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: "cs",
  fallbackLng: "cs",
  defaultNS: "common",
  ns: ["common", "screens", "defects"],
  interpolation: { escapeValue: false },
});

export default i18n;
