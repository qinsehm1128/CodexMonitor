import { useCallback } from "react";
import { i18n } from "@/i18n/config";

type DictationState = "idle" | "listening" | "processing";

type UseComposerDictationControlsArgs = {
  disabled: boolean;
  dictationEnabled: boolean;
  dictationState: DictationState;
  onToggleDictation?: () => void;
  onCancelDictation?: () => void;
  onOpenDictationSettings?: () => void;
};

export function useComposerDictationControls({
  disabled,
  dictationEnabled,
  dictationState,
  onToggleDictation,
  onCancelDictation,
  onOpenDictationSettings,
}: UseComposerDictationControlsArgs) {
  const isDictating = dictationState === "listening";
  const isDictationProcessing = dictationState === "processing";
  const isDictationBusy = dictationState !== "idle";
  const allowOpenDictationSettings = Boolean(
    onOpenDictationSettings && !dictationEnabled && !disabled && !isDictationProcessing,
  );
  const micDisabled =
    disabled ||
    (!allowOpenDictationSettings &&
      (isDictationProcessing ? !onCancelDictation : !dictationEnabled || !onToggleDictation));
  const micAriaLabel = allowOpenDictationSettings
    ? i18n.t("composer.dictationControls.openSettings")
    : isDictationProcessing
      ? i18n.t("composer.dictationControls.cancelTranscription")
      : isDictating
        ? i18n.t("composer.dictationControls.stopDictation")
        : i18n.t("composer.dictationControls.startDictation");
  const micTitle = allowOpenDictationSettings
    ? i18n.t("composer.dictationControls.dictationDisabledOpenSettings")
    : isDictationProcessing
      ? i18n.t("composer.dictationControls.cancelTranscription")
      : isDictating
        ? i18n.t("composer.dictationControls.stopDictation")
        : i18n.t("composer.dictationControls.startDictation");

  const handleMicClick = useCallback(() => {
    if (isDictationProcessing) {
      if (disabled || !onCancelDictation) {
        return;
      }
      onCancelDictation();
      return;
    }
    if (allowOpenDictationSettings) {
      onOpenDictationSettings?.();
      return;
    }
    if (!onToggleDictation || micDisabled) {
      return;
    }
    onToggleDictation();
  }, [
    allowOpenDictationSettings,
    disabled,
    isDictationProcessing,
    micDisabled,
    onCancelDictation,
    onOpenDictationSettings,
    onToggleDictation,
  ]);

  return {
    allowOpenDictationSettings,
    handleMicClick,
    isDictating,
    isDictationBusy,
    isDictationProcessing,
    micAriaLabel,
    micDisabled,
    micTitle,
  };
}
