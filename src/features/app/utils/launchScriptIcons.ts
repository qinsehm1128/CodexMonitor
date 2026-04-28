import type { LucideIcon } from "lucide-react";
import type { LaunchScriptIconId } from "../../../types";
export type { LaunchScriptIconId } from "../../../types";
import Play from "lucide-react/dist/esm/icons/play";
import Hammer from "lucide-react/dist/esm/icons/hammer";
import Bug from "lucide-react/dist/esm/icons/bug";
import Wrench from "lucide-react/dist/esm/icons/wrench";
import TerminalSquare from "lucide-react/dist/esm/icons/terminal-square";
import Code2 from "lucide-react/dist/esm/icons/code-2";
import Server from "lucide-react/dist/esm/icons/server";
import Database from "lucide-react/dist/esm/icons/database";
import Package from "lucide-react/dist/esm/icons/package";
import TestTube2 from "lucide-react/dist/esm/icons/test-tube-2";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import GitBranch from "lucide-react/dist/esm/icons/git-branch";
import Settings from "lucide-react/dist/esm/icons/settings";
import Search from "lucide-react/dist/esm/icons/search";
import { i18n } from "@/i18n/config";

export const DEFAULT_LAUNCH_SCRIPT_ICON: LaunchScriptIconId = "play";

const ICON_MAP: Record<LaunchScriptIconId, LucideIcon> = {
  play: Play,
  build: Hammer,
  debug: Bug,
  wrench: Wrench,
  terminal: TerminalSquare,
  code: Code2,
  server: Server,
  database: Database,
  package: Package,
  test: TestTube2,
  lint: RefreshCw,
  dev: Play,
  git: GitBranch,
  config: Settings,
  logs: Search,
};

const ICON_LABEL_KEYS: Record<LaunchScriptIconId, string> = {
  play: "app.launchScripts.icons.play",
  build: "app.launchScripts.icons.build",
  debug: "app.launchScripts.icons.debug",
  wrench: "app.launchScripts.icons.wrench",
  terminal: "app.launchScripts.icons.terminal",
  code: "app.launchScripts.icons.code",
  server: "app.launchScripts.icons.server",
  database: "app.launchScripts.icons.database",
  package: "app.launchScripts.icons.package",
  test: "app.launchScripts.icons.test",
  lint: "app.launchScripts.icons.lint",
  dev: "app.launchScripts.icons.dev",
  git: "app.launchScripts.icons.git",
  config: "app.launchScripts.icons.config",
  logs: "app.launchScripts.icons.logs",
};

function isLaunchScriptIconId(value: string): value is LaunchScriptIconId {
  return value in ICON_MAP;
}

export function coerceLaunchScriptIconId(value?: string | null): LaunchScriptIconId {
  if (!value) {
    return DEFAULT_LAUNCH_SCRIPT_ICON;
  }
  return isLaunchScriptIconId(value) ? value : DEFAULT_LAUNCH_SCRIPT_ICON;
}

export function getLaunchScriptIconOptions() {
  return Object.keys(ICON_MAP).map((id) => {
    const iconId = coerceLaunchScriptIconId(id);
    return {
      id: iconId,
      label: i18n.t(ICON_LABEL_KEYS[iconId]),
    };
  });
}

export function getLaunchScriptIcon(id?: string | null): LucideIcon {
  const iconId = coerceLaunchScriptIconId(id);
  return ICON_MAP[iconId];
}

export function getLaunchScriptIconLabel(id?: string | null): string {
  const iconId = coerceLaunchScriptIconId(id);
  return i18n.t(ICON_LABEL_KEYS[iconId]);
}
