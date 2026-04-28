# Deep Interview Context Snapshot

## Task Statement
对 `CodexMonitor` 做 i18n 改造：在现有英文基础上新增中文，多语言切换入口放在设置中。

## Desired Outcome
形成可执行的需求边界，明确 i18n 改造覆盖范围、切换行为、默认语言策略、持久化位置，以及本次是否仅分析还是后续直接进入实施。

## Stated Solution
在项目中引入中英文多语言能力，并在设置页提供语言切换。

## Probable Intent Hypothesis
用户希望在不破坏现有英文体验的前提下，为中文用户提供完整或分阶段可落地的中文界面支持，并希望语言切换纳入现有设置体系统一管理。

## Known Facts / Evidence
- 这是 brownfield 项目：React + Vite 前端，Tauri Rust 后端。
- 当前 `package.json` 未见 `i18next`、`react-intl` 等通用 i18n 依赖。
- `src/features/settings/hooks/useAppSettings.ts` 的默认设置中未见通用 UI 语言字段。
- `src/types.ts` 与 `src-tauri/src/types.rs` 现有语言相关字段是 `dictationPreferredLanguage`，属于功能性语言偏好，不是通用 UI locale。
- `src/features/settings/components/sections/SettingsDisplaySection.tsx` 当前仍是英文 UI 文案，设置页可作为语言切换入口候选位置。

## Constraints
- 需遵守仓库架构：前端设置模型、Tauri IPC、Rust 持久化需要保持一致。
- 语言切换入口已被用户限定在设置中。
- 当前阶段是 `deep-interview`，不得直接进入实现。

## Unknowns / Open Questions
- 本次 i18n 覆盖范围是全应用，还是仅设置页与核心壳层。
- 是否要求一次性把全部用户可见文案都双语化，还是允许分阶段推进。
- 默认语言策略是跟随系统、保持英文默认，还是首次按系统 locale 决定。
- 切换是否需要即时生效，是否需要重启应用。
- 是否包含后端返回的用户可见字符串、通知、错误提示、命令状态文案。

## Decision-Boundary Unknowns
- OMX 可以自行决定的 i18n 技术方案边界尚未明确。
- 是否允许先建立基础设施与设置项，再逐步迁移各页面文案尚未明确。
- 是否允许只覆盖前端 UI，不处理 Rust 侧用户可见文本尚未明确。

## Likely Codebase Touchpoints
- `src/types.ts`
- `src/features/settings/hooks/useAppSettings.ts`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx`
- `src/services/tauri.ts`
- `src-tauri/src/types.rs`
- `src-tauri/src/storage.rs`
- 其余存在硬编码英文文案的前端组件
