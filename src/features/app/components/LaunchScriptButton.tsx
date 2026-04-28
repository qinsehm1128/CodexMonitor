import Play from "lucide-react/dist/esm/icons/play";
import type { LaunchScriptIconId } from "../../../types";
import { PopoverSurface } from "../../design-system/components/popover/PopoverPrimitives";
import { useMenuController } from "../hooks/useMenuController";
import { LaunchScriptIconPicker } from "./LaunchScriptIconPicker";
import { DEFAULT_LAUNCH_SCRIPT_ICON } from "../utils/launchScriptIcons";
import { useT } from "@/i18n/useT";

type LaunchScriptButtonProps = {
  launchScript: string | null;
  editorOpen: boolean;
  draftScript: string;
  isSaving: boolean;
  error: string | null;
  onRun: () => void;
  onOpenEditor: () => void;
  onCloseEditor: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
  showNew?: boolean;
  newEditorOpen?: boolean;
  newDraftScript?: string;
  newDraftIcon?: LaunchScriptIconId;
  newDraftLabel?: string;
  newError?: string | null;
  onOpenNew?: () => void;
  onCloseNew?: () => void;
  onNewDraftChange?: (value: string) => void;
  onNewDraftIconChange?: (value: LaunchScriptIconId) => void;
  onNewDraftLabelChange?: (value: string) => void;
  onCreateNew?: () => void;
};

export function LaunchScriptButton({
  launchScript,
  editorOpen,
  draftScript,
  isSaving,
  error,
  onRun,
  onOpenEditor,
  onCloseEditor,
  onDraftChange,
  onSave,
  showNew = false,
  newEditorOpen = false,
  newDraftScript = "",
  newDraftIcon = DEFAULT_LAUNCH_SCRIPT_ICON,
  newDraftLabel = "",
  newError = null,
  onOpenNew,
  onCloseNew,
  onNewDraftChange,
  onNewDraftIconChange,
  onNewDraftLabelChange,
  onCreateNew,
}: LaunchScriptButtonProps) {
  const { t } = useT();
  const editorMenu = useMenuController({
    open: editorOpen,
    onDismiss: () => {
      onCloseEditor();
      onCloseNew?.();
    },
  });
  const { containerRef: popoverRef } = editorMenu;
  const hasLaunchScript = Boolean(launchScript?.trim());

  return (
    <div className="launch-script-menu" ref={popoverRef}>
      <div className="launch-script-buttons">
        <button
          type="button"
          className="ghost main-header-action launch-script-run ds-tooltip-trigger"
          onClick={onRun}
          onContextMenu={(event) => {
            event.preventDefault();
            onOpenEditor();
          }}
          data-tauri-drag-region="false"
          aria-label={hasLaunchScript ? t("app.launchScripts.runLaunchScript") : t("app.launchScripts.setLaunchScript")}
          title={hasLaunchScript ? t("app.launchScripts.runLaunchScript") : t("app.launchScripts.setLaunchScript")}
          data-tooltip={hasLaunchScript ? t("app.launchScripts.runLaunchScript") : t("app.launchScripts.setLaunchScript")}
          data-tooltip-placement="bottom"
        >
          <Play size={14} aria-hidden />
        </button>
      </div>
      {editorOpen && (
        <PopoverSurface className="launch-script-popover" role="dialog">
          <div className="launch-script-title">{t("app.launchScripts.launchScript")}</div>
          <textarea
            className="launch-script-textarea"
            placeholder={t("app.launchScripts.placeholderScript")}
            value={draftScript}
            onChange={(event) => onDraftChange(event.target.value)}
            rows={6}
            data-tauri-drag-region="false"
          />
          {error && <div className="launch-script-error">{error}</div>}
          <div className="launch-script-actions">
            <button
              type="button"
              className="ghost"
              onClick={() => {
                onCloseEditor();
                onCloseNew?.();
              }}
              data-tauri-drag-region="false"
            >
              {t("app.launchScripts.cancel")}
            </button>
            {showNew && onOpenNew && (
              <button
                type="button"
                className="ghost"
                onClick={onOpenNew}
                data-tauri-drag-region="false"
              >
                {t("app.launchScripts.new")}
              </button>
            )}
            <button
              type="button"
              className="primary"
              onClick={onSave}
              disabled={isSaving}
              data-tauri-drag-region="false"
            >
              {isSaving ? t("app.launchScripts.saving") : t("app.launchScripts.save")}
            </button>
          </div>
          {showNew && newEditorOpen && onNewDraftChange && onNewDraftIconChange && onCreateNew && (
            <div className="launch-script-new">
              <div className="launch-script-title">{t("app.launchScripts.newLaunchScript")}</div>
              <LaunchScriptIconPicker
                value={newDraftIcon}
                onChange={onNewDraftIconChange}
              />
              <input
                className="launch-script-input"
                type="text"
                placeholder={t("app.launchScripts.optionalLabel")}
                value={newDraftLabel}
                onChange={(event) => onNewDraftLabelChange?.(event.target.value)}
                data-tauri-drag-region="false"
              />
              <textarea
                className="launch-script-textarea"
                placeholder={t("app.launchScripts.placeholderScript")}
                value={newDraftScript}
                onChange={(event) => onNewDraftChange(event.target.value)}
                rows={5}
                data-tauri-drag-region="false"
              />
              {newError && <div className="launch-script-error">{newError}</div>}
              <div className="launch-script-actions">
                <button
                  type="button"
                  className="ghost"
                  onClick={onCloseNew}
                  data-tauri-drag-region="false"
                >
                  {t("app.launchScripts.cancel")}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={onCreateNew}
                  disabled={isSaving}
                  data-tauri-drag-region="false"
                >
                  {isSaving ? t("app.launchScripts.saving") : t("app.launchScripts.create")}
                </button>
              </div>
            </div>
          )}
        </PopoverSurface>
      )}
    </div>
  );
}
