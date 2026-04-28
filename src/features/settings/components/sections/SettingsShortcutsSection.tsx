import { useMemo, useState, type KeyboardEvent } from "react";
import {
  SettingsSection,
  SettingsSubsection,
} from "@/features/design-system/components/settings/SettingsPrimitives";
import { formatShortcut, getDefaultInterruptShortcut } from "@utils/shortcuts";
import { isMacPlatform } from "@utils/platformPaths";
import { useT } from "@/i18n/useT";
import type {
  ShortcutDraftKey,
  ShortcutDrafts,
  ShortcutSettingKey,
} from "@settings/components/settingsTypes";

type ShortcutItem = {
  label: string;
  draftKey: ShortcutDraftKey;
  settingKey: ShortcutSettingKey;
  help: string;
};

type ShortcutGroup = {
  title: string;
  subtitle: string;
  items: ShortcutItem[];
};

type SettingsShortcutsSectionProps = {
  shortcutDrafts: ShortcutDrafts;
  onShortcutKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    key: ShortcutSettingKey,
  ) => void;
  onClearShortcut: (key: ShortcutSettingKey) => void;
};

function ShortcutField({
  item,
  shortcutDrafts,
  onShortcutKeyDown,
  onClearShortcut,
}: {
  item: ShortcutItem;
  shortcutDrafts: ShortcutDrafts;
  onShortcutKeyDown: (
    event: KeyboardEvent<HTMLInputElement>,
    key: ShortcutSettingKey,
  ) => void;
  onClearShortcut: (key: ShortcutSettingKey) => void;
}) {
  const { t } = useT();
  return (
    <div className="settings-field">
      <div className="settings-field-label">{item.label}</div>
      <div className="settings-field-row">
        <input
          className="settings-input settings-input--shortcut"
          value={formatShortcut(shortcutDrafts[item.draftKey])}
          onKeyDown={(event) => onShortcutKeyDown(event, item.settingKey)}
          placeholder={t("settings.shortcuts.typeShortcut")}
          readOnly
        />
        <button
          type="button"
          className="ghost settings-button-compact"
          onClick={() => onClearShortcut(item.settingKey)}
        >
          {t("settings.shortcuts.clear")}
        </button>
      </div>
      <div className="settings-help">{item.help}</div>
    </div>
  );
}

export function SettingsShortcutsSection({
  shortcutDrafts,
  onShortcutKeyDown,
  onClearShortcut,
}: SettingsShortcutsSectionProps) {
  const { t } = useT();
  const isMac = isMacPlatform();
  const [searchQuery, setSearchQuery] = useState("");

  const groups = useMemo<ShortcutGroup[]>(
    () => [
      {
        title: t("settings.shortcuts.groups.file.title"),
        subtitle: t("settings.shortcuts.groups.file.subtitle"),
        items: [
          {
            label: t("settings.shortcuts.labels.newAgent"),
            draftKey: "newAgent",
            settingKey: "newAgentShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+n"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.newWorktreeAgent"),
            draftKey: "newWorktreeAgent",
            settingKey: "newWorktreeAgentShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+n"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.newCloneAgent"),
            draftKey: "newCloneAgent",
            settingKey: "newCloneAgentShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+alt+n"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.archiveThread"),
            draftKey: "archiveThread",
            settingKey: "archiveThreadShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(isMac ? "cmd+ctrl+a" : "ctrl+alt+a"),
            }),
          },
        ],
      },
      {
        title: t("settings.shortcuts.groups.composer.title"),
        subtitle: t("settings.shortcuts.groups.composer.subtitle"),
        items: [
          {
            label: t("settings.shortcuts.labels.cycleModel"),
            draftKey: "model",
            settingKey: "composerModelShortcut",
            help: t("settings.shortcuts.help.cycleModel", {
              shortcut: formatShortcut("cmd+shift+m"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.cycleAccess"),
            draftKey: "access",
            settingKey: "composerAccessShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+a"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.cycleReasoning"),
            draftKey: "reasoning",
            settingKey: "composerReasoningShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+r"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.cycleCollaboration"),
            draftKey: "collaboration",
            settingKey: "composerCollaborationShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("shift+tab"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.interrupt"),
            draftKey: "interrupt",
            settingKey: "interruptShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(getDefaultInterruptShortcut()),
            }),
          },
        ],
      },
      {
        title: t("settings.shortcuts.groups.panels.title"),
        subtitle: t("settings.shortcuts.groups.panels.subtitle"),
        items: [
          {
            label: t("settings.shortcuts.labels.projectsSidebar"),
            draftKey: "projectsSidebar",
            settingKey: "toggleProjectsSidebarShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+p"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.gitSidebar"),
            draftKey: "gitSidebar",
            settingKey: "toggleGitSidebarShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+g"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.branchSwitcher"),
            draftKey: "branchSwitcher",
            settingKey: "branchSwitcherShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+b"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.debugPanel"),
            draftKey: "debugPanel",
            settingKey: "toggleDebugPanelShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+d"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.terminal"),
            draftKey: "terminal",
            settingKey: "toggleTerminalShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut("cmd+shift+t"),
            }),
          },
        ],
      },
      {
        title: t("settings.shortcuts.groups.navigation.title"),
        subtitle: t("settings.shortcuts.groups.navigation.subtitle"),
        items: [
          {
            label: t("settings.shortcuts.labels.nextAgent"),
            draftKey: "cycleAgentNext",
            settingKey: "cycleAgentNextShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(isMac ? "cmd+ctrl+down" : "ctrl+alt+down"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.previousAgent"),
            draftKey: "cycleAgentPrev",
            settingKey: "cycleAgentPrevShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(isMac ? "cmd+ctrl+up" : "ctrl+alt+up"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.nextWorkspace"),
            draftKey: "cycleWorkspaceNext",
            settingKey: "cycleWorkspaceNextShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(isMac ? "cmd+shift+down" : "ctrl+alt+shift+down"),
            }),
          },
          {
            label: t("settings.shortcuts.labels.previousWorkspace"),
            draftKey: "cycleWorkspacePrev",
            settingKey: "cycleWorkspacePrevShortcut",
            help: t("settings.shortcuts.help.default", {
              shortcut: formatShortcut(isMac ? "cmd+shift+up" : "ctrl+alt+shift+up"),
            }),
          },
        ],
      },
    ],
    [isMac, t],
  );

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!normalizedSearchQuery) {
      return groups;
    }
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          const searchValue = `${group.title} ${group.subtitle} ${item.label} ${item.help}`.toLowerCase();
          return searchValue.includes(normalizedSearchQuery);
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, normalizedSearchQuery]);

  return (
    <SettingsSection
      title={t("settings.shortcuts.title")}
      subtitle={t("settings.shortcuts.subtitle")}
    >
      <div className="settings-field settings-shortcuts-search">
        <label className="settings-field-label" htmlFor="settings-shortcuts-search">
          {t("settings.shortcuts.searchLabel")}
        </label>
        <div className="settings-field-row">
          <input
            id="settings-shortcuts-search"
            className="settings-input"
            placeholder={t("settings.shortcuts.searchPlaceholder")}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="ghost settings-button-compact"
              onClick={() => setSearchQuery("")}
            >
              {t("settings.shortcuts.clear")}
            </button>
          )}
        </div>
        <div className="settings-help">{t("settings.shortcuts.searchHelp")}</div>
      </div>
      {filteredGroups.map((group, index) => (
        <div key={group.title}>
          {index > 0 && <div className="settings-divider" />}
          <SettingsSubsection title={group.title} subtitle={group.subtitle} />
          {group.items.map((item) => (
            <ShortcutField
              key={item.settingKey}
              item={item}
              shortcutDrafts={shortcutDrafts}
              onShortcutKeyDown={onShortcutKeyDown}
              onClearShortcut={onClearShortcut}
            />
          ))}
        </div>
      ))}
      {filteredGroups.length === 0 && (
        <div className="settings-empty">
          {normalizedSearchQuery
            ? t("settings.shortcuts.noResults", { query: searchQuery.trim() })
            : t("settings.shortcuts.noResultsFallback")}
        </div>
      )}
    </SettingsSection>
  );
}
