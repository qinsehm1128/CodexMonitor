import type { AppSettings } from "@/types";
import type { CodexSection, ShortcutDraftKey, ShortcutSettingKey } from "./settingsTypes";
import { i18n } from "@/i18n/config";

export const getDictationModels = () => [
  {
    id: "tiny",
    label: i18n.t("settings.dictation.models.tiny.label"),
    size: "75 MB",
    note: i18n.t("settings.dictation.models.tiny.note"),
  },
  {
    id: "base",
    label: i18n.t("settings.dictation.models.base.label"),
    size: "142 MB",
    note: i18n.t("settings.dictation.models.base.note"),
  },
  {
    id: "small",
    label: i18n.t("settings.dictation.models.small.label"),
    size: "466 MB",
    note: i18n.t("settings.dictation.models.small.note"),
  },
  {
    id: "medium",
    label: i18n.t("settings.dictation.models.medium.label"),
    size: "1.5 GB",
    note: i18n.t("settings.dictation.models.medium.note"),
  },
  {
    id: "large-v3",
    label: i18n.t("settings.dictation.models.large-v3.label"),
    size: "3.0 GB",
    note: i18n.t("settings.dictation.models.large-v3.note"),
  },
];

type ComposerPreset = AppSettings["composerEditorPreset"];

type ComposerPresetSettings = Pick<
  AppSettings,
  | "composerFenceExpandOnSpace"
  | "composerFenceExpandOnEnter"
  | "composerFenceLanguageTags"
  | "composerFenceWrapSelection"
  | "composerFenceAutoWrapPasteMultiline"
  | "composerFenceAutoWrapPasteCodeLike"
  | "composerListContinuation"
  | "composerCodeBlockCopyUseModifier"
>;

export const getComposerPresetLabels = (): Record<ComposerPreset, string> => ({
  default: i18n.t("settings.composer.presetLabels.default"),
  helpful: i18n.t("settings.composer.presetLabels.helpful"),
  smart: i18n.t("settings.composer.presetLabels.smart"),
});

export const COMPOSER_PRESET_CONFIGS: Record<
  ComposerPreset,
  ComposerPresetSettings
> = {
  default: {
    composerFenceExpandOnSpace: false,
    composerFenceExpandOnEnter: false,
    composerFenceLanguageTags: false,
    composerFenceWrapSelection: false,
    composerFenceAutoWrapPasteMultiline: false,
    composerFenceAutoWrapPasteCodeLike: false,
    composerListContinuation: false,
    composerCodeBlockCopyUseModifier: false,
  },
  helpful: {
    composerFenceExpandOnSpace: true,
    composerFenceExpandOnEnter: false,
    composerFenceLanguageTags: true,
    composerFenceWrapSelection: true,
    composerFenceAutoWrapPasteMultiline: true,
    composerFenceAutoWrapPasteCodeLike: false,
    composerListContinuation: true,
    composerCodeBlockCopyUseModifier: false,
  },
  smart: {
    composerFenceExpandOnSpace: true,
    composerFenceExpandOnEnter: false,
    composerFenceLanguageTags: true,
    composerFenceWrapSelection: true,
    composerFenceAutoWrapPasteMultiline: true,
    composerFenceAutoWrapPasteCodeLike: true,
    composerListContinuation: true,
    composerCodeBlockCopyUseModifier: false,
  },
};

export const SETTINGS_MOBILE_BREAKPOINT_PX = 720;
export const DEFAULT_REMOTE_HOST = "127.0.0.1:4732";

export const SETTINGS_SECTION_LABELS: Record<CodexSection, string> = {
  projects: "Projects",
  environments: "Environments",
  display: "Display & Sound",
  about: "About",
  composer: "Composer",
  dictation: "Dictation",
  shortcuts: "Shortcuts",
  "open-apps": "Open in",
  git: "Git",
  server: "Server",
  agents: "Agents",
  codex: "Codex",
  features: "Features",
};

export const SHORTCUT_DRAFT_KEY_BY_SETTING: Record<
  ShortcutSettingKey,
  ShortcutDraftKey
> = {
  composerModelShortcut: "model",
  composerAccessShortcut: "access",
  composerReasoningShortcut: "reasoning",
  composerCollaborationShortcut: "collaboration",
  interruptShortcut: "interrupt",
  newAgentShortcut: "newAgent",
  newWorktreeAgentShortcut: "newWorktreeAgent",
  newCloneAgentShortcut: "newCloneAgent",
  archiveThreadShortcut: "archiveThread",
  toggleProjectsSidebarShortcut: "projectsSidebar",
  toggleGitSidebarShortcut: "gitSidebar",
  branchSwitcherShortcut: "branchSwitcher",
  toggleDebugPanelShortcut: "debugPanel",
  toggleTerminalShortcut: "terminal",
  cycleAgentNextShortcut: "cycleAgentNext",
  cycleAgentPrevShortcut: "cycleAgentPrev",
  cycleWorkspaceNextShortcut: "cycleWorkspaceNext",
  cycleWorkspacePrevShortcut: "cycleWorkspacePrev",
};
