import { readGlobalCodexConfigToml, writeGlobalCodexConfigToml } from "@services/tauri";
import { useFileEditor } from "@/features/shared/hooks/useFileEditor";
import { i18n } from "@/i18n/config";

export function useGlobalCodexConfigToml() {
  return useFileEditor({
    key: "global-config",
    read: readGlobalCodexConfigToml,
    write: writeGlobalCodexConfigToml,
    readErrorTitle: i18n.t("settings.sharedEditor.loadGlobalConfigError"),
    writeErrorTitle: i18n.t("settings.sharedEditor.saveGlobalConfigError"),
  });
}
