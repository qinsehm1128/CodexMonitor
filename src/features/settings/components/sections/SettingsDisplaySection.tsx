import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import type { AppSettings } from "@/types";
import {
  CODE_FONT_SIZE_MAX,
  CODE_FONT_SIZE_MIN,
  CODE_FONT_SIZE_DEFAULT,
  DEFAULT_CODE_FONT_FAMILY,
  DEFAULT_UI_FONT_FAMILY,
} from "@utils/fonts";

import {
  CHAT_SCROLLBACK_DEFAULT,
  CHAT_SCROLLBACK_MAX,
  CHAT_SCROLLBACK_MIN,
  CHAT_SCROLLBACK_PRESETS,
  clampChatScrollbackItems,
  isChatScrollbackPreset,
} from "@utils/chatScrollback";
import {
  SettingsSection,
  SettingsToggleRow,
  SettingsToggleSwitch,
} from "@/features/design-system/components/settings/SettingsPrimitives";
import { UI_LANGUAGES } from "@/i18n/constants";
import { useT } from "@/i18n/useT";

type SettingsDisplaySectionProps = {
  appSettings: AppSettings;
  reduceTransparency: boolean;
  scaleShortcutTitle: string;
  scaleShortcutText: string;
  scaleDraft: string;
  uiFontDraft: string;
  codeFontDraft: string;
  codeFontSizeDraft: number;
  onUpdateAppSettings: (next: AppSettings) => Promise<void>;
  onToggleTransparency: (value: boolean) => void;
  onSetScaleDraft: Dispatch<SetStateAction<string>>;
  onCommitScale: () => Promise<void>;
  onResetScale: () => Promise<void>;
  onSetUiFontDraft: Dispatch<SetStateAction<string>>;
  onCommitUiFont: () => Promise<void>;
  onSetCodeFontDraft: Dispatch<SetStateAction<string>>;
  onCommitCodeFont: () => Promise<void>;
  onSetCodeFontSizeDraft: Dispatch<SetStateAction<number>>;
  onCommitCodeFontSize: (nextSize: number) => Promise<void>;
  onTestNotificationSound: () => void;
  onTestSystemNotification: () => void;
};

export function SettingsDisplaySection({
  appSettings,
  reduceTransparency,
  scaleShortcutTitle,
  scaleShortcutText,
  scaleDraft,
  uiFontDraft,
  codeFontDraft,
  codeFontSizeDraft,
  onUpdateAppSettings,
  onToggleTransparency,
  onSetScaleDraft,
  onCommitScale,
  onResetScale,
  onSetUiFontDraft,
  onCommitUiFont,
  onSetCodeFontDraft,
  onCommitCodeFont,
  onSetCodeFontSizeDraft,
  onCommitCodeFontSize,
  onTestNotificationSound,
  onTestSystemNotification,
}: SettingsDisplaySectionProps) {
  const { t } = useT();
  const scrollbackUnlimited = appSettings.chatHistoryScrollbackItems === null;
  const [scrollbackDraft, setScrollbackDraft] = useState(() => {
    const value = appSettings.chatHistoryScrollbackItems;
    return typeof value === "number" && Number.isFinite(value)
      ? String(value)
      : String(CHAT_SCROLLBACK_DEFAULT);
  });

  useEffect(() => {
    const value = appSettings.chatHistoryScrollbackItems;
    if (typeof value === "number" && Number.isFinite(value)) {
      setScrollbackDraft(String(value));
    }
  }, [appSettings.chatHistoryScrollbackItems]);

  const scrollbackPresetValue = (() => {
    const value = appSettings.chatHistoryScrollbackItems;
    if (typeof value === "number" && isChatScrollbackPreset(value)) {
      return String(value);
    }
    return "custom";
  })();

  const commitScrollback = () => {
    if (scrollbackUnlimited) {
      return;
    }
    const trimmed = scrollbackDraft.trim();
    const parsed = trimmed ? Number(trimmed) : Number.NaN;
    if (!Number.isFinite(parsed)) {
      const current = appSettings.chatHistoryScrollbackItems;
      const fallback =
        typeof current === "number" && Number.isFinite(current)
          ? current
          : CHAT_SCROLLBACK_DEFAULT;
      setScrollbackDraft(String(fallback));
      return;
    }
    const nextValue = clampChatScrollbackItems(parsed);
    setScrollbackDraft(String(nextValue));
    if (appSettings.chatHistoryScrollbackItems === nextValue) {
      return;
    }
    void onUpdateAppSettings({
      ...appSettings,
      chatHistoryScrollbackItems: nextValue,
    });
  };

  const toggleUnlimitedScrollback = () => {
    const nextUnlimited = !scrollbackUnlimited;
    if (nextUnlimited) {
      void onUpdateAppSettings({
        ...appSettings,
        chatHistoryScrollbackItems: null,
      });
      return;
    }
    const trimmed = scrollbackDraft.trim();
    const parsed = trimmed ? Number(trimmed) : Number.NaN;
    const nextValue = Number.isFinite(parsed)
      ? clampChatScrollbackItems(parsed)
      : CHAT_SCROLLBACK_DEFAULT;
    setScrollbackDraft(String(nextValue));
    void onUpdateAppSettings({
      ...appSettings,
      chatHistoryScrollbackItems: nextValue,
    });
  };

  const selectScrollbackPreset = (rawValue: string) => {
    if (scrollbackUnlimited) {
      return;
    }
    if (rawValue === "custom") {
      return;
    }
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      return;
    }
    const nextValue = clampChatScrollbackItems(parsed);
    setScrollbackDraft(String(nextValue));
    void onUpdateAppSettings({
      ...appSettings,
      chatHistoryScrollbackItems: nextValue,
    });
  };

  return (
    <SettingsSection
      title={t("settings.display.title")}
      subtitle={t("settings.display.subtitle")}
    >
      <div className="settings-subsection-title">
        {t("settings.display.groups.display.title")}
      </div>
      <div className="settings-subsection-subtitle">
        {t("settings.display.groups.display.subtitle")}
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="ui-language-select">
          {t("settings.display.language.label")}
        </label>
        <select
          id="ui-language-select"
          className="settings-select"
          value={appSettings.uiLanguage ?? "en"}
          onChange={(event) =>
            void onUpdateAppSettings({
              ...appSettings,
              uiLanguage: event.target.value as AppSettings["uiLanguage"],
            })
          }
        >
          {UI_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {t(`common.languages.${language}`)}
            </option>
          ))}
        </select>
        <div className="settings-help">{t("settings.display.language.help")}</div>
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="theme-select">
          {t("settings.display.fields.theme")}
        </label>
        <select
          id="theme-select"
          className="settings-select"
          value={appSettings.theme}
          onChange={(event) =>
            void onUpdateAppSettings({
              ...appSettings,
              theme: event.target.value as AppSettings["theme"],
            })
          }
        >
          <option value="system">{t("settings.display.themes.system")}</option>
          <option value="light">{t("settings.display.themes.light")}</option>
          <option value="dark">{t("settings.display.themes.dark")}</option>
          <option value="dim">{t("settings.display.themes.dim")}</option>
        </select>
      </div>
      <SettingsToggleRow
        title={t("settings.display.toggles.usageShowRemaining.title")}
        subtitle={t("settings.display.toggles.usageShowRemaining.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.usageShowRemaining}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              usageShowRemaining: !appSettings.usageShowRemaining,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.display.toggles.showMessageFilePath.title")}
        subtitle={t("settings.display.toggles.showMessageFilePath.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.showMessageFilePath}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              showMessageFilePath: !appSettings.showMessageFilePath,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.display.toggles.splitChatDiffView.title")}
        subtitle={t("settings.display.toggles.splitChatDiffView.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.splitChatDiffView}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              splitChatDiffView: !appSettings.splitChatDiffView,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.display.toggles.threadTitleAutogenerationEnabled.title")}
        subtitle={t("settings.display.toggles.threadTitleAutogenerationEnabled.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.threadTitleAutogenerationEnabled}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              threadTitleAutogenerationEnabled:
                !appSettings.threadTitleAutogenerationEnabled,
            })
          }
        />
      </SettingsToggleRow>
      <div className="settings-subsection-title">
        {t("settings.display.groups.chat.title")}
      </div>
      <div className="settings-subsection-subtitle">
        {t("settings.display.chat.help.preset")}
      </div>
      <SettingsToggleRow
        title={t("settings.display.toggles.unlimitedChatHistory.title")}
        subtitle={t("settings.display.toggles.unlimitedChatHistory.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={scrollbackUnlimited}
          onClick={toggleUnlimitedScrollback}
          data-scrollback-control="true"
        />
      </SettingsToggleRow>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="chat-scrollback-preset">
          {t("settings.display.chat.scrollbackPreset")}
        </label>
        <select
          id="chat-scrollback-preset"
          className="settings-select"
          value={scrollbackPresetValue}
          onChange={(event) => selectScrollbackPreset(event.target.value)}
          data-scrollback-control="true"
          disabled={scrollbackUnlimited}
        >
          <option value="custom">{t("settings.display.chat.presets.custom")}</option>
          {CHAT_SCROLLBACK_PRESETS.map((value) => (
            <option key={value} value={value}>
              {value === CHAT_SCROLLBACK_DEFAULT
                ? `${value} (${t("settings.display.chat.presets.default")})`
                : value}
            </option>
          ))}
        </select>
        <div className="settings-help">{t("settings.display.chat.help.preset")}</div>
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="chat-scrollback-items">
          {t("settings.display.chat.maxItems")}
        </label>
        <div className="settings-field-row">
          <input
            id="chat-scrollback-items"
            type="text"
            inputMode="numeric"
            className="settings-input"
            value={scrollbackDraft}
            disabled={scrollbackUnlimited}
            onChange={(event) => setScrollbackDraft(event.target.value)}
            onBlur={(event) => {
              const nextTarget = event.relatedTarget;
              if (
                nextTarget instanceof HTMLElement &&
                nextTarget.dataset.scrollbackControl === "true"
              ) {
                return;
              }
              commitScrollback();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commitScrollback();
              }
            }}
          />
          <button
            type="button"
            className="ghost settings-button-compact"
            data-scrollback-control="true"
            disabled={scrollbackUnlimited}
            onClick={() => {
              setScrollbackDraft(String(CHAT_SCROLLBACK_DEFAULT));
              void onUpdateAppSettings({
                ...appSettings,
                chatHistoryScrollbackItems: CHAT_SCROLLBACK_DEFAULT,
              });
            }}
          >
            {t("common.actions.reset")}
          </button>
        </div>
        <div className="settings-help">
          {t("settings.display.chat.help.maxItemsRange", {
            min: CHAT_SCROLLBACK_MIN,
            max: CHAT_SCROLLBACK_MAX,
          })}
        </div>
      </div>
      <SettingsToggleRow
        title={t("settings.display.toggles.reduceTransparency.title")}
        subtitle={t("settings.display.toggles.reduceTransparency.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={reduceTransparency}
          onClick={() => onToggleTransparency(!reduceTransparency)}
        />
      </SettingsToggleRow>
      <div className="settings-toggle-row settings-scale-row">
        <div>
          <div className="settings-toggle-title">
            {t("settings.display.fields.interfaceScale")}
          </div>
          <div className="settings-toggle-subtitle" title={scaleShortcutTitle}>
            {scaleShortcutText}
          </div>
        </div>
        <div className="settings-scale-controls">
          <input
            id="ui-scale"
            type="text"
            inputMode="decimal"
            className="settings-input settings-input--scale"
            value={scaleDraft}
            aria-label={t("settings.display.fields.interfaceScale")}
            onChange={(event) => onSetScaleDraft(event.target.value)}
            onBlur={() => {
              void onCommitScale();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onCommitScale();
              }
            }}
          />
          <button
            type="button"
            className="ghost settings-scale-reset"
            onClick={() => {
              void onResetScale();
            }}
          >
            {t("common.actions.reset")}
          </button>
        </div>
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="ui-font-family">
          {t("settings.display.fields.uiFontFamily")}
        </label>
        <div className="settings-field-row">
          <input
            id="ui-font-family"
            type="text"
            className="settings-input"
            value={uiFontDraft}
            onChange={(event) => onSetUiFontDraft(event.target.value)}
            onBlur={() => {
              void onCommitUiFont();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onCommitUiFont();
              }
            }}
          />
          <button
            type="button"
            className="ghost settings-button-compact"
            onClick={() => {
              onSetUiFontDraft(DEFAULT_UI_FONT_FAMILY);
              void onUpdateAppSettings({
                ...appSettings,
                uiFontFamily: DEFAULT_UI_FONT_FAMILY,
              });
            }}
          >
            {t("common.actions.reset")}
          </button>
        </div>
        <div className="settings-help">{t("settings.display.help.uiFontFamily")}</div>
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="code-font-family">
          {t("settings.display.fields.codeFontFamily")}
        </label>
        <div className="settings-field-row">
          <input
            id="code-font-family"
            type="text"
            className="settings-input"
            value={codeFontDraft}
            onChange={(event) => onSetCodeFontDraft(event.target.value)}
            onBlur={() => {
              void onCommitCodeFont();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onCommitCodeFont();
              }
            }}
          />
          <button
            type="button"
            className="ghost settings-button-compact"
            onClick={() => {
              onSetCodeFontDraft(DEFAULT_CODE_FONT_FAMILY);
              void onUpdateAppSettings({
                ...appSettings,
                codeFontFamily: DEFAULT_CODE_FONT_FAMILY,
              });
            }}
          >
            {t("common.actions.reset")}
          </button>
        </div>
        <div className="settings-help">{t("settings.display.help.codeFontFamily")}</div>
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="code-font-size">
          {t("settings.display.fields.codeFontSize")}
        </label>
        <div className="settings-field-row">
          <input
            id="code-font-size"
            type="range"
            min={CODE_FONT_SIZE_MIN}
            max={CODE_FONT_SIZE_MAX}
            step={1}
            className="settings-input settings-input--range"
            value={codeFontSizeDraft}
            onChange={(event) => {
              const nextValue = Number(event.target.value);
              onSetCodeFontSizeDraft(nextValue);
              void onCommitCodeFontSize(nextValue);
            }}
          />
          <div className="settings-scale-value">{codeFontSizeDraft}px</div>
          <button
            type="button"
            className="ghost settings-button-compact"
            onClick={() => {
              onSetCodeFontSizeDraft(CODE_FONT_SIZE_DEFAULT);
              void onCommitCodeFontSize(CODE_FONT_SIZE_DEFAULT);
            }}
          >
            {t("common.actions.reset")}
          </button>
        </div>
        <div className="settings-help">{t("settings.display.help.codeFontSize")}</div>
      </div>
      <div className="settings-subsection-title">
        {t("settings.display.groups.sounds.title")}
      </div>
      <div className="settings-subsection-subtitle">
        {t("settings.display.groups.sounds.subtitle")}
      </div>
      <SettingsToggleRow
        title={t("settings.display.toggles.notificationSoundsEnabled.title")}
        subtitle={t("settings.display.toggles.notificationSoundsEnabled.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.notificationSoundsEnabled}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              notificationSoundsEnabled: !appSettings.notificationSoundsEnabled,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.display.toggles.systemNotificationsEnabled.title")}
        subtitle={t("settings.display.toggles.systemNotificationsEnabled.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.systemNotificationsEnabled}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              systemNotificationsEnabled: !appSettings.systemNotificationsEnabled,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.display.toggles.subagentSystemNotificationsEnabled.title")}
        subtitle={t("settings.display.toggles.subagentSystemNotificationsEnabled.subtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.subagentSystemNotificationsEnabled}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              subagentSystemNotificationsEnabled:
                !appSettings.subagentSystemNotificationsEnabled,
            })
          }
        />
      </SettingsToggleRow>
      <div className="settings-sound-actions">
        <button
          type="button"
          className="ghost settings-button-compact"
          onClick={onTestNotificationSound}
        >
          {t("settings.display.testActions.sound")}
        </button>
        <button
          type="button"
          className="ghost settings-button-compact"
          onClick={onTestSystemNotification}
        >
          {t("settings.display.testActions.notification")}
        </button>
      </div>
    </SettingsSection>
  );
}
