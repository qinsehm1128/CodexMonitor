import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { CustomPromptOption } from "../../../types";
import { expandCustomPromptText, getPromptArgumentHint } from "../../../utils/customPrompts";
import type { PanelTabId } from "../../layout/components/PanelTabs";
import { PanelShell } from "../../layout/components/PanelShell";
import {
  PanelMeta,
  PanelSearchField,
} from "../../design-system/components/panel/PanelPrimitives";
import { Menu, MenuItem } from "@tauri-apps/api/menu";
import { LogicalPosition } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import MoreHorizontal from "lucide-react/dist/esm/icons/more-horizontal";
import Plus from "lucide-react/dist/esm/icons/plus";
import ScrollText from "lucide-react/dist/esm/icons/scroll-text";
import Search from "lucide-react/dist/esm/icons/search";
import { useT } from "@/i18n/useT";

type PromptPanelProps = {
  prompts: CustomPromptOption[];
  workspacePath: string | null;
  filePanelMode: PanelTabId;
  onFilePanelModeChange: (mode: PanelTabId) => void;
  onSendPrompt: (text: string) => void | Promise<void>;
  onSendPromptToNewAgent: (text: string) => void | Promise<void>;
  onCreatePrompt: (data: {
    scope: "workspace" | "global";
    name: string;
    description?: string | null;
    argumentHint?: string | null;
    content: string;
  }) => void | Promise<void>;
  onUpdatePrompt: (data: {
    path: string;
    name: string;
    description?: string | null;
    argumentHint?: string | null;
    content: string;
  }) => void | Promise<void>;
  onDeletePrompt: (path: string) => void | Promise<void>;
  onMovePrompt: (data: { path: string; scope: "workspace" | "global" }) => void | Promise<void>;
  onRevealWorkspacePrompts: () => void | Promise<void>;
  onRevealGeneralPrompts: () => void | Promise<void>;
  canRevealGeneralPrompts: boolean;
};

const PROMPTS_PREFIX = "prompts:";

type PromptEditorState = {
  mode: "create" | "edit";
  scope: "workspace" | "global";
  name: string;
  description: string;
  argumentHint: string;
  content: string;
  path?: string;
};

function buildPromptCommand(name: string, args: string) {
  const trimmedArgs = args.trim();
  return `/${PROMPTS_PREFIX}${name}${trimmedArgs ? ` ${trimmedArgs}` : ""}`;
}

function isWorkspacePrompt(prompt: CustomPromptOption) {
  return prompt.scope === "workspace";
}

export function PromptPanel({
  prompts,
  workspacePath,
  filePanelMode,
  onFilePanelModeChange,
  onSendPrompt,
  onSendPromptToNewAgent,
  onCreatePrompt,
  onUpdatePrompt,
  onDeletePrompt,
  onMovePrompt,
  onRevealWorkspacePrompts,
  onRevealGeneralPrompts,
  canRevealGeneralPrompts,
}: PromptPanelProps) {
  const { t } = useT();
  const [query, setQuery] = useState("");
  const [argsByPrompt, setArgsByPrompt] = useState<Record<string, string>>({});
  const [editor, setEditor] = useState<PromptEditorState | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeletePath, setPendingDeletePath] = useState<string | null>(null);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const highlightTimer = useRef<number | null>(null);
  const normalizedQuery = query.trim().toLowerCase();

  const showError = (error: unknown) => {
    window.alert(error instanceof Error ? error.message : String(error));
  };

  const resetEditorState = () => {
    setEditorError(null);
    setPendingDeletePath(null);
  };

  const updateEditor = (patch: Partial<PromptEditorState>) => {
    setEditor((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  useEffect(() => {
    return () => {
      if (highlightTimer.current) {
        window.clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingDeletePath) {
      return;
    }
    const stillExists = prompts.some((prompt) => prompt.path === pendingDeletePath);
    if (!stillExists) {
      setPendingDeletePath(null);
    }
  }, [pendingDeletePath, prompts]);

  const triggerHighlight = (key: string) => {
    if (!key) {
      return;
    }
    if (highlightTimer.current) {
      window.clearTimeout(highlightTimer.current);
    }
    setHighlightKey(key);
    highlightTimer.current = window.setTimeout(() => {
      setHighlightKey(null);
    }, 650);
  };

  const buildPromptText = (prompt: CustomPromptOption, args: string) => {
    const command = buildPromptCommand(prompt.name, args);
    const expansion = expandCustomPromptText(command, [prompt]);
    if (expansion && "error" in expansion) {
      showError(expansion.error);
      return null;
    }
    if (expansion && "expanded" in expansion) {
      return expansion.expanded;
    }
    return prompt.content;
  };

  const filteredPrompts = useMemo(() => {
    if (!normalizedQuery) {
      return prompts;
    }
    return prompts.filter((prompt) => {
      const haystack = `${prompt.name} ${prompt.description ?? ""} ${prompt.path}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, prompts]);

  const { workspacePrompts, globalPrompts } = useMemo(() => {
    const workspaceEntries: CustomPromptOption[] = [];
    const globalEntries: CustomPromptOption[] = [];
    filteredPrompts.forEach((prompt) => {
      if (isWorkspacePrompt(prompt)) {
        workspaceEntries.push(prompt);
      } else {
        globalEntries.push(prompt);
      }
    });
    return { workspacePrompts: workspaceEntries, globalPrompts: globalEntries };
  }, [filteredPrompts]);

  const totalCount = filteredPrompts.length;
  const hasPrompts = totalCount > 0;

  const handleArgsChange = (key: string, value: string) => {
    setArgsByPrompt((prev) => ({ ...prev, [key]: value }));
  };

  const startCreate = (scope: "workspace" | "global") => {
    resetEditorState();
    setEditor({
      mode: "create",
      scope,
      name: "",
      description: "",
      argumentHint: "",
      content: "",
    });
  };

  const startEdit = (prompt: CustomPromptOption) => {
    const scope = isWorkspacePrompt(prompt) ? "workspace" : "global";
    resetEditorState();
    setEditor({
      mode: "edit",
      scope,
      name: prompt.name,
      description: prompt.description ?? "",
      argumentHint: prompt.argumentHint ?? "",
      content: prompt.content ?? "",
      path: prompt.path,
    });
  };

  const handleSave = async () => {
    if (!editor || isSaving) {
      return;
    }
    const name = editor.name.trim();
    if (!name) {
      setEditorError(`${t("app.promptPanel.name")} is required.`);
      return;
    }
    if (/\s/.test(name)) {
      setEditorError(`${t("app.promptPanel.name")} cannot include whitespace.`);
      return;
    }
    setEditorError(null);
    setIsSaving(true);
    const description = editor.description.trim() || null;
    const argumentHint = editor.argumentHint.trim() || null;
    const content = editor.content;
    try {
      if (editor.mode === "create") {
        await onCreatePrompt({
          scope: editor.scope,
          name,
          description,
          argumentHint,
          content,
        });
        triggerHighlight(name);
      } else if (editor.path) {
        await onUpdatePrompt({
          path: editor.path,
          name,
          description,
          argumentHint,
          content,
        });
        triggerHighlight(editor.path ?? name);
      }
      setEditor(null);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRequest = (prompt: CustomPromptOption) => {
    if (!prompt.path) {
      return;
    }
    setPendingDeletePath(prompt.path);
  };

  const handleDeleteConfirm = async (prompt: CustomPromptOption) => {
    if (!prompt.path) {
      return;
    }
    try {
      await onDeletePrompt(prompt.path);
      setPendingDeletePath((current) =>
        current === prompt.path ? null : current,
      );
    } catch (error) {
      showError(error);
    }
  };

  const handleMove = async (prompt: CustomPromptOption, scope: "workspace" | "global") => {
    if (!prompt.path) {
      return;
    }
    try {
      await onMovePrompt({ path: prompt.path, scope });
      triggerHighlight(prompt.name);
    } catch (error) {
      showError(error);
    }
  };

  const showPromptMenu = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    prompt: CustomPromptOption,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const scope = isWorkspacePrompt(prompt) ? "workspace" : "global";
    const nextScope = scope === "workspace" ? "global" : "workspace";
    const menu = await Menu.new({
      items: [
        await MenuItem.new({
          text: t("common.actions.save"),
          action: () => startEdit(prompt),
        }),
        await MenuItem.new({
          text:
            nextScope === "workspace"
              ? t("app.promptPanel.moveToWorkspace")
              : t("app.promptPanel.moveToGeneral"),
          action: () => void handleMove(prompt, nextScope),
        }),
        await MenuItem.new({
          text: t("app.promptPanel.delete"),
          action: () => handleDeleteRequest(prompt),
        }),
      ],
    });
    const position = new LogicalPosition(event.clientX, event.clientY);
    const window = getCurrentWindow();
    await menu.popup(position, window);
  };

  const renderPromptRow = (prompt: CustomPromptOption) => {
    const hint = getPromptArgumentHint(prompt);
    const showArgsInput = Boolean(hint);
    const key = prompt.path || prompt.name;
    const argsValue = argsByPrompt[key] ?? "";
    const effectiveArgs = showArgsInput ? argsValue : "";
    const isHighlighted = highlightKey === prompt.path || highlightKey === prompt.name;
    return (
      <div className={`prompt-row${isHighlighted ? " is-highlight" : ""}`} key={key}>
        <div className="prompt-row-header">
          <div className="prompt-name">{prompt.name}</div>
          {prompt.description && (
            <div className="prompt-description">{prompt.description}</div>
          )}
        </div>
        {hint && <div className="prompt-hint">{hint}</div>}
        <div className="prompt-actions">
          {showArgsInput ? (
            <input
              className="prompt-args-input"
              type="text"
              placeholder={hint ?? t("app.promptPanel.arguments")}
              value={argsValue}
              onChange={(event) => handleArgsChange(key, event.target.value)}
              aria-label={`Arguments for ${prompt.name}`}
            />
          ) : null}
          <button
            type="button"
            className="ghost prompt-action"
            onClick={() => {
              const text = buildPromptText(prompt, effectiveArgs);
              if (!text) {
                return;
              }
              void onSendPrompt(text);
            }}
            title={t("app.promptPanel.sendCurrentAgent")}
          >
            Send
          </button>
          <button
            type="button"
            className="ghost prompt-action"
            onClick={() => {
              const text = buildPromptText(prompt, effectiveArgs);
              if (!text) {
                return;
              }
              void onSendPromptToNewAgent(text);
            }}
            title={t("app.promptPanel.sendNewAgent")}
          >
            New agent
          </button>
          <button
            type="button"
            className="ghost icon-button prompt-action-menu"
            onClick={(event) => void showPromptMenu(event, prompt)}
            aria-label={t("app.promptPanel.promptActions")}
            title={t("app.promptPanel.promptActions")}
          >
            <MoreHorizontal aria-hidden />
          </button>
        </div>
        {pendingDeletePath === prompt.path && (
          <div className="prompt-delete-confirm">
            <span>{t("app.promptPanel.deleteThisPrompt")}</span>
            <button
              type="button"
              className="ghost prompt-action"
              onClick={() => void handleDeleteConfirm(prompt)}
            >
              {t("app.promptPanel.delete")}
            </button>
            <button
              type="button"
              className="ghost prompt-action"
              onClick={() => setPendingDeletePath(null)}
            >
              {t("app.promptPanel.cancel")}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <PanelShell
      filePanelMode={filePanelMode}
      onFilePanelModeChange={onFilePanelModeChange}
      className="prompt-panel"
      headerClassName="git-panel-header"
      headerRight={
        <PanelMeta className="prompt-panel-meta">
          {hasPrompts
            ? totalCount === 1
              ? t("app.promptPanel.promptCount", { count: totalCount })
              : t("app.promptPanel.promptCountPlural", { count: totalCount })
            : t("app.promptPanel.noPrompts")}
        </PanelMeta>
      }
      search={
        <PanelSearchField
          className="file-tree-search"
          inputClassName="file-tree-search-input"
          placeholder={t("app.promptPanel.filterPrompts")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label={t("app.promptPanel.filterPrompts")}
          icon={<Search aria-hidden />}
        />
      }
    >
      <div className="prompt-panel-scroll">
        {editor && (
          <div className="prompt-editor">
            <div className="prompt-editor-row">
              <label className="prompt-editor-label">
                {t("app.promptPanel.name")}
                <input
                  className="prompt-args-input"
                  type="text"
                  value={editor.name}
                  onChange={(event) => updateEditor({ name: event.target.value })}
                  placeholder={t("app.promptPanel.promptName")}
                />
              </label>
              <label className="prompt-editor-label">
                {t("app.promptPanel.scope")}
                <select
                  className="prompt-scope-select"
                  value={editor.scope}
                  onChange={(event) =>
                    updateEditor({
                      scope: event.target.value as PromptEditorState["scope"],
                    })
                  }
                  disabled={editor.mode === "edit"}
                >
                  <option value="workspace">{t("app.promptPanel.workspace")}</option>
                  <option value="global">{t("app.promptPanel.general")}</option>
                </select>
              </label>
            </div>
            <div className="prompt-editor-row">
              <label className="prompt-editor-label">
                {t("app.promptPanel.description")}
                <input
                  className="prompt-args-input"
                  type="text"
                  value={editor.description}
                  onChange={(event) => updateEditor({ description: event.target.value })}
                  placeholder={t("app.promptPanel.optionalDescription")}
                />
              </label>
              <label className="prompt-editor-label">
                {t("app.promptPanel.argumentHint")}
                <input
                  className="prompt-args-input"
                  type="text"
                  value={editor.argumentHint}
                  onChange={(event) => updateEditor({ argumentHint: event.target.value })}
                  placeholder={t("app.promptPanel.optionalArgumentHint")}
                />
              </label>
            </div>
            <label className="prompt-editor-label">
              {t("app.promptPanel.content")}
              <textarea
                className="prompt-editor-textarea"
                value={editor.content}
                onChange={(event) => updateEditor({ content: event.target.value })}
                placeholder={t("app.promptPanel.promptContent")}
                rows={6}
              />
            </label>
            {editorError && <div className="prompt-editor-error">{editorError}</div>}
            <div className="prompt-editor-actions">
              <button
                type="button"
                className="ghost prompt-action"
              onClick={() => setEditor(null)}
              disabled={isSaving}
            >
                {t("app.promptPanel.cancel")}
              </button>
              <button
                type="button"
                className="ghost prompt-action"
              onClick={() => void handleSave()}
              disabled={isSaving}
            >
                {editor.mode === "create" ? t("app.promptPanel.create") : t("app.promptPanel.save")}
              </button>
            </div>
          </div>
        )}
        <div className="prompt-section">
          <div className="prompt-section-header">
            <div className="prompt-section-title">{t("app.promptPanel.workspacePrompts")}</div>
            <button
              type="button"
              className="ghost icon-button prompt-section-add"
              onClick={() => startCreate("workspace")}
              aria-label={t("app.promptPanel.addWorkspacePrompt")}
              title={t("app.promptPanel.addWorkspacePrompt")}
            >
              <Plus aria-hidden />
            </button>
          </div>
          {workspacePrompts.length > 0 ? (
            <div className="prompt-list">
              {workspacePrompts.map((prompt) => renderPromptRow(prompt))}
            </div>
          ) : (
            <div className="prompt-empty-card">
              <ScrollText className="prompt-empty-icon" aria-hidden />
              <div className="prompt-empty-text">
                <div className="prompt-empty-title">{t("app.promptPanel.noWorkspacePrompts")}</div>
                <div className="prompt-empty-subtitle">
                  {t("app.promptPanel.workspacePromptSubtitle")}{" "}
                  {workspacePath ? (
                    <button
                      type="button"
                      className="prompt-empty-link"
                      onClick={() => void onRevealWorkspacePrompts()}
                    >
                      workspace prompts folder
                    </button>
                  ) : (
                    <span className="prompt-empty-link is-disabled">
                      workspace prompts folder
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="prompt-section">
          <div className="prompt-section-header">
            <div className="prompt-section-title">{t("app.promptPanel.generalPrompts")}</div>
            <button
              type="button"
              className="ghost icon-button prompt-section-add"
              onClick={() => startCreate("global")}
              aria-label={t("app.promptPanel.addGeneralPrompt")}
              title={t("app.promptPanel.addGeneralPrompt")}
            >
              <Plus aria-hidden />
            </button>
          </div>
          {globalPrompts.length > 0 ? (
            <div className="prompt-list">
              {globalPrompts.map((prompt) => renderPromptRow(prompt))}
            </div>
          ) : (
            <div className="prompt-empty-card">
              <ScrollText className="prompt-empty-icon" aria-hidden />
              <div className="prompt-empty-text">
                <div className="prompt-empty-title">{t("app.promptPanel.noGeneralPrompts")}</div>
                <div className="prompt-empty-subtitle">
                  {t("app.promptPanel.generalPromptSubtitle")}{" "}
                  {canRevealGeneralPrompts ? (
                    <button
                      type="button"
                      className="prompt-empty-link"
                      onClick={() => void onRevealGeneralPrompts()}
                    >
                      CODEX_HOME/prompts
                    </button>
                  ) : (
                    <span className="prompt-empty-link is-disabled">
                      CODEX_HOME/prompts
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
