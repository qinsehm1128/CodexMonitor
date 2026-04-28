import { readGlobalAgentsMd, writeGlobalAgentsMd } from "@services/tauri";
import { useFileEditor } from "@/features/shared/hooks/useFileEditor";
import { i18n } from "@/i18n/config";

export function useGlobalAgentsMd() {
  return useFileEditor({
    key: "global-agents",
    read: readGlobalAgentsMd,
    write: writeGlobalAgentsMd,
    readErrorTitle: i18n.t("settings.sharedEditor.loadGlobalAgentsError"),
    writeErrorTitle: i18n.t("settings.sharedEditor.saveGlobalAgentsError"),
  });
}
