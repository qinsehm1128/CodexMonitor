# Deep Interview Spec

## Metadata
- Profile: standard
- Rounds: 6
- Final ambiguity: `19.6%`
- Threshold: `20%`
- Context type: brownfield
- Context snapshot: `.omx/context/codexmonitor-i18n-settings-20260409T063655Z.md`
- Transcript: `.omx/interviews/codexmonitor-i18n-settings-20260409T063655Z.md`

## Clarity Breakdown
| Dimension | Score |
| --- | --- |
| Intent | 0.72 |
| Outcome | 0.87 |
| Scope | 0.86 |
| Constraints | 0.75 |
| Success | 0.88 |
| Context | 0.78 |

## Intent
在不破坏现有英文体验的前提下，为 `CodexMonitor` 增加完整的中文界面能力，并把语言切换纳入现有设置体系统一管理。

## Desired Outcome
- 应用默认保持英文。
- 用户可在设置中切换为中文。
- 切换后前端 UI 与应用内固定提示即时生效。
- 重启应用后保持用户上次选择。
- 中文模式下固定 UI 文案完整中文化。

## In Scope
- React 前端界面的固定 UI 文案。
- 应用内固定提示、空态、按钮、标题、标签、说明文字。
- 设置页中的语言选择入口。
- 语言设置的前端状态、Tauri IPC、Rust 设置持久化对齐。
- 中英文两套 locale 资源与其组织方式。

## Out-of-Scope / Non-goals
- Agent / 模型回复内容。
- 终端输出、Git diff 原文、文件内容预览。
- 用户自行输入的消息内容。
- 系统通知的强制双语化要求。
- Tauri 原生弹窗、Rust 原生错误消息、后端返回给用户的非前端固定 UI 文本的强制双语化要求。
- “允许少量英文回退”的宽松验收方式。

## Decision Boundaries
- 可自行决定是否引入新的 i18n 依赖。
- 可自行决定翻译资源组织方式。
- 可自行决定文案抽取与迁移的具体工程策略。
- 前提是不得突破本规格定义的范围、默认行为与验收标准。

## Constraints
- 默认语言必须是英文，而不是跟随系统。
- 语言切换入口必须放在设置中。
- 切换必须即时生效，不接受“下次重启再切换”作为最终行为。
- 设置需持久化，重启后仍保持用户所选语言。
- 当前仓库前后端设置结构需要保持一致：`src/types.ts`、`src-tauri/src/types.rs`、`src-tauri/src/storage.rs` 需要同步扩展。
- 当前阶段是需求与规格产出，不在此文档内直接实施。

## Testable Acceptance Criteria
1. 首次启动时应用默认显示英文 UI。
2. 在设置中存在明确的语言切换入口，可在 English / 中文 之间切换。
3. 用户切换语言后，当前窗口中所有纳入范围的固定 UI 文案即时切换，无需重启应用。
4. 关闭并重新打开应用后，仍保持用户上次选择的语言。
5. 中文模式下，纳入范围的固定 UI 文案全部为中文。
6. 中文模式下不得出现 translation key、占位符、空白文案或英文回退。
7. 运行时动态内容保持原样，不因 i18n 改造而被翻译或包装。

## Assumptions Exposed And Resolutions
- Assumption: “全量 UI”意味着所有用户可见文本都要双语化。
  - Resolution: 否。实际限定为前端 UI 与应用内固定提示，不强制覆盖系统通知、Tauri 原生文本、Rust 原生错误消息。
- Assumption: i18n 改造可能需要跟随系统 locale。
  - Resolution: 否。默认必须保持英文。
- Assumption: 为降低工作量，可以允许中文模式下个别漏译回退英文。
  - Resolution: 否。中文模式下固定 UI 文案必须完整中文化。

## Pressure-pass Findings
- Pressure target: Round 1 的 “全量 UI”
- Challenge mode: contrarian
- What changed: 从抽象范围词压缩为具备工程边界的“前端 UI + 应用内提示”
- Impact: 明确排除了系统层与动态内容，显著降低误改范围

## Brownfield Evidence Vs Inference
### Evidence
- `package.json` 当前未包含现成通用 i18n 库。
- `src/features/settings/hooks/useAppSettings.ts` 当前默认设置中未有通用 UI 语言字段。
- `src/types.ts` 与 `src-tauri/src/types.rs` 仅有 `dictationPreferredLanguage` 等功能性语言字段。
- `src/features/settings/components/sections/SettingsDisplaySection.tsx` 已是设置页展示层切入点之一，且当前存在大量英文固定文案。

### Inference
- 语言配置预计需要跨越前端设置模型、Tauri IPC 与 Rust 持久化链路。
- 该仓库若做完整 i18n，需引入统一文案访问层，避免继续散落硬编码字符串。

## Technical Context Findings
- Frontend settings model anchor: `src/types.ts`
- Frontend settings state hook: `src/features/settings/hooks/useAppSettings.ts`
- Settings display UI anchor: `src/features/settings/components/sections/SettingsDisplaySection.tsx`
- Tauri bridge touchpoint: `src/services/tauri.ts`
- Rust settings model: `src-tauri/src/types.rs`
- Rust settings persistence: `src-tauri/src/storage.rs`

## Condensed Transcript
1. Scope: 首期不是只铺基础设施，而是面向全量固定 UI 目标。
2. Boundary: 真正落地层级限定为前端 UI 与应用内固定提示。
3. Non-goals: 动态内容全部排除。
4. Autonomy: 技术方案可自行决定。
5. Default behavior: 默认英文，切换后即时生效并持久化。
6. Acceptance: 中文模式下固定 UI 文案必须完整中文化。

## Recommended Handoff
- Recommended: `$ralplan .omx/specs/deep-interview-codexmonitor-i18n-settings.md`
- Reason: 需求已经清楚，但该仓库是 brownfield，且牵涉前端状态、设置持久化、批量文案迁移与测试策略，先做 feasibility + architecture gate 更稳。
