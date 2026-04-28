import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { UI_LANGUAGE_DEFAULT } from "./constants";
import { resources } from "./resources.ts";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: UI_LANGUAGE_DEFAULT,
    fallbackLng: false,
    supportedLngs: Object.keys(resources),
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
    returnEmptyString: false,
  });
}

export { i18n };
