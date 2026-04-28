import { appResources } from "./appResources";
import { settingsResources } from "./settingsResources";

export const resources = {
  en: {
    translation: {
      ...settingsResources.en,
      ...appResources.en,
    },
  },
  "zh-CN": {
    translation: {
      ...settingsResources["zh-CN"],
      ...appResources["zh-CN"],
    },
  },
} as const;
