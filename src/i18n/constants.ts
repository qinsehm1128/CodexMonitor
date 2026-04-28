import type { UiLanguage } from "@/types";

export const UI_LANGUAGE_DEFAULT: UiLanguage = "en";
export const UI_LANGUAGES: UiLanguage[] = ["en", "zh-CN"];

export function normalizeUiLanguage(value: unknown): UiLanguage {
  return value === "zh-CN" ? "zh-CN" : UI_LANGUAGE_DEFAULT;
}
