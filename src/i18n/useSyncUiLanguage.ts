import { useEffect, useState } from "react";
import type { UiLanguage } from "@/types";
import { normalizeUiLanguage } from "./constants";
import { i18n } from "./config";

function resolvedUiLanguage(): UiLanguage {
  return normalizeUiLanguage(i18n.resolvedLanguage ?? i18n.language);
}

export function useSyncUiLanguage(uiLanguage: UiLanguage, isLoading: boolean) {
  const normalizedUiLanguage = normalizeUiLanguage(uiLanguage);
  const [isReady, setIsReady] = useState(() => {
    return !isLoading && resolvedUiLanguage() === normalizedUiLanguage;
  });

  useEffect(() => {
    if (isLoading) {
      setIsReady(false);
      return;
    }
    if (resolvedUiLanguage() === normalizedUiLanguage) {
      setIsReady(true);
      return;
    }

    let active = true;
    setIsReady(false);
    void i18n.changeLanguage(normalizedUiLanguage).finally(() => {
      if (active) {
        setIsReady(true);
      }
    });

    return () => {
      active = false;
    };
  }, [isLoading, normalizedUiLanguage]);

  return isReady;
}
