import type { AppSettings } from "@/types";
import {
  SettingsSection,
  SettingsToggleRow,
  SettingsToggleSwitch,
} from "@/features/design-system/components/settings/SettingsPrimitives";
import { useT } from "@/i18n/useT";

type ComposerPreset = AppSettings["composerEditorPreset"];

type SettingsComposerSectionProps = {
  appSettings: AppSettings;
  optionKeyLabel: string;
  followUpShortcutLabel: string;
  composerPresetLabels: Record<ComposerPreset, string>;
  onComposerPresetChange: (preset: ComposerPreset) => void;
  onUpdateAppSettings: (next: AppSettings) => Promise<void>;
};

export function SettingsComposerSection({
  appSettings,
  optionKeyLabel,
  followUpShortcutLabel,
  composerPresetLabels,
  onComposerPresetChange,
  onUpdateAppSettings,
}: SettingsComposerSectionProps) {
  const { t } = useT();
  const steerUnavailable = !appSettings.steerEnabled;
  return (
    <SettingsSection
      title={t("settings.composer.title")}
      subtitle={t("settings.composer.subtitle")}
    >
      <div className="settings-field">
        <div className="settings-field-label">{t("settings.composer.followUpBehavior")}</div>
        <div className={`settings-segmented${appSettings.followUpMessageBehavior === "steer" ? " is-second-active" : ""}`} aria-label={t("settings.composer.followUpBehaviorLabel")}>
          <label
            className={`settings-segmented-option${
              appSettings.followUpMessageBehavior === "queue" ? " is-active" : ""
            }`}
          >
            <input
              className="settings-segmented-input"
              type="radio"
              name="follow-up-behavior"
              value="queue"
              checked={appSettings.followUpMessageBehavior === "queue"}
              onChange={() =>
                void onUpdateAppSettings({
                  ...appSettings,
                  followUpMessageBehavior: "queue",
                })
              }
            />
            <span className="settings-segmented-option-label">{t("settings.composer.queue")}</span>
          </label>
          <label
            className={`settings-segmented-option${
              appSettings.followUpMessageBehavior === "steer" ? " is-active" : ""
            }${steerUnavailable ? " is-disabled" : ""}`}
            title={steerUnavailable ? t("settings.composer.steerUnavailable") : ""}
          >
            <input
              className="settings-segmented-input"
              type="radio"
              name="follow-up-behavior"
              value="steer"
              checked={appSettings.followUpMessageBehavior === "steer"}
              disabled={steerUnavailable}
              onChange={() => {
                if (steerUnavailable) {
                  return;
                }
                void onUpdateAppSettings({
                  ...appSettings,
                  followUpMessageBehavior: "steer",
                });
              }}
            />
            <span className="settings-segmented-option-label">{t("settings.composer.steer")}</span>
          </label>
        </div>
        <div className="settings-help">
          {t("settings.composer.followUpHelp", { shortcut: followUpShortcutLabel })}
        </div>
        <SettingsToggleRow
          title={t("settings.composer.showFollowUpHintTitle")}
          subtitle={t("settings.composer.showFollowUpHintSubtitle")}
        >
          <SettingsToggleSwitch
            pressed={appSettings.composerFollowUpHintEnabled}
            onClick={() =>
              void onUpdateAppSettings({
                ...appSettings,
                composerFollowUpHintEnabled: !appSettings.composerFollowUpHintEnabled,
              })
            }
          />
        </SettingsToggleRow>
        {steerUnavailable && (
          <div className="settings-help">
            {t("settings.composer.steerUnavailableHelp")}
          </div>
        )}
      </div>
      <div className="settings-divider" />
      <div className="settings-subsection-title">{t("settings.composer.presetsTitle")}</div>
      <div className="settings-subsection-subtitle">
        {t("settings.composer.presetsSubtitle")}
      </div>
      <div className="settings-field">
        <label className="settings-field-label" htmlFor="composer-preset">
          {t("settings.composer.preset")}
        </label>
        <select
          id="composer-preset"
          className="settings-select"
          value={appSettings.composerEditorPreset}
          onChange={(event) =>
            onComposerPresetChange(event.target.value as ComposerPreset)
          }
        >
          {Object.entries(composerPresetLabels).map(([preset, label]) => (
            <option key={preset} value={preset}>
              {label}
            </option>
          ))}
        </select>
        <div className="settings-help">
          {t("settings.composer.presetHelp")}
        </div>
      </div>
      <div className="settings-divider" />
      <div className="settings-subsection-title">{t("settings.composer.codeFences")}</div>
      <SettingsToggleRow
        title={t("settings.composer.expandSpaceTitle")}
        subtitle={t("settings.composer.expandSpaceSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceExpandOnSpace}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceExpandOnSpace: !appSettings.composerFenceExpandOnSpace,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.composer.expandEnterTitle")}
        subtitle={t("settings.composer.expandEnterSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceExpandOnEnter}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceExpandOnEnter: !appSettings.composerFenceExpandOnEnter,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.composer.supportLanguageTagsTitle")}
        subtitle={t("settings.composer.supportLanguageTagsSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceLanguageTags}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceLanguageTags: !appSettings.composerFenceLanguageTags,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.composer.wrapSelectionTitle")}
        subtitle={t("settings.composer.wrapSelectionSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceWrapSelection}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceWrapSelection: !appSettings.composerFenceWrapSelection,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.composer.copyWithoutFencesTitle")}
        subtitle={t("settings.composer.copyWithoutFencesSubtitle", { key: optionKeyLabel })}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerCodeBlockCopyUseModifier}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerCodeBlockCopyUseModifier:
                !appSettings.composerCodeBlockCopyUseModifier,
            })
          }
        />
      </SettingsToggleRow>
      <div className="settings-divider" />
      <div className="settings-subsection-title">{t("settings.composer.pasting")}</div>
      <SettingsToggleRow
        title={t("settings.composer.autoWrapMultilineTitle")}
        subtitle={t("settings.composer.autoWrapMultilineSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceAutoWrapPasteMultiline}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceAutoWrapPasteMultiline:
                !appSettings.composerFenceAutoWrapPasteMultiline,
            })
          }
        />
      </SettingsToggleRow>
      <SettingsToggleRow
        title={t("settings.composer.autoWrapCodeLikeTitle")}
        subtitle={t("settings.composer.autoWrapCodeLikeSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerFenceAutoWrapPasteCodeLike}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerFenceAutoWrapPasteCodeLike:
                !appSettings.composerFenceAutoWrapPasteCodeLike,
            })
          }
        />
      </SettingsToggleRow>
      <div className="settings-divider" />
      <div className="settings-subsection-title">{t("settings.composer.lists")}</div>
      <SettingsToggleRow
        title={t("settings.composer.continueListsTitle")}
        subtitle={t("settings.composer.continueListsSubtitle")}
      >
        <SettingsToggleSwitch
          pressed={appSettings.composerListContinuation}
          onClick={() =>
            void onUpdateAppSettings({
              ...appSettings,
              composerListContinuation: !appSettings.composerListContinuation,
            })
          }
        />
      </SettingsToggleRow>
    </SettingsSection>
  );
}
