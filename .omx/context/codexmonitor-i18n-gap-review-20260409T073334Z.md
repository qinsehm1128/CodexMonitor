# Deep Interview Context Snapshot

## Task Statement
对已经完成的 `CodexMonitor` i18n 变更做 review，识别缺失内容与未完成任务，并明确下一轮继续推进的完成边界。

## Desired Outcome
形成一份针对“当前已完成什么、还缺什么、本轮接下来要补到哪里”的可执行澄清结果，避免继续推进时在“补剩余 UI 文案”与“补验证闭环”之间来回摇摆。

## Stated Solution
先 review 已完成的 i18n 改造，再比较缺失项和未完成任务，然后继续推进。

## Probable Intent Hypothesis
用户不是重新做规划，而是希望在现有实现基础上判定“还差什么才算这轮完成”，并把下一步聚焦到最重要的 gap 上。

## Known Facts / Evidence
- `uiLanguage` 设置合同已接入前后端，默认 `en`：`src/types.ts`、`src/features/settings/hooks/useAppSettings.ts`、`src-tauri/src/types.rs`
- `i18next/react-i18next` 已接入，provider 已挂到 `src/main.tsx`
- `MainApp` 已根据 `appSettings.uiLanguage` 同步语言，并有 loading gate：`src/features/app/components/MainApp.tsx`
- 设置中的语言切换入口已落到 `Display & Sound`：`src/features/settings/components/sections/SettingsDisplaySection.tsx`
- 现有自动化验证结果：
  - `npm run typecheck` 通过
  - `npm run build` 通过
  - `npm run test` 通过（`138` 个测试文件，`1000` 个测试）
  - `npm run lint` 无 error，但有 5 条既有 warning，不在本轮改动文件里
- `cargo check` 当前被本机环境阻塞：`whisper-rs-sys` 缺 `libclang`，而不是本次 i18n 代码本身报 Rust 类型错误
- 仍可见的固定 UI 英文热点示例：
  - `src/features/about/components/AboutView.tsx`
  - `src/features/debug/components/DebugPanel.tsx`
  - `src/features/app/utils/usageLabels.ts`

## Constraints
- 继续遵守既有 i18n spec：默认英文、设置切换、即时生效、持久化
- 动态内容仍不纳入翻译范围
- 当前阶段是 `deep-interview`，只澄清边界，不直接实施

## Unknowns / Open Questions
- 本轮“继续推进”优先是补剩余固定 UI 文案，还是优先补验证闭环
- `cargo check` 的环境阻塞是否应算进本轮完成标准
- 是否需要先产出完整 gap 审计，再继续改代码

## Decision-Boundary Unknowns
- 可以自行继续改剩余固定 UI 文案，还是要先停在 review 结论
- 环境问题是否与功能 gap 分开处理，尚未明确

## Likely Codebase Touchpoints
- `src/features/about/components/AboutView.tsx`
- `src/features/debug/components/DebugPanel.tsx`
- `src/features/app/utils/usageLabels.ts`
- `src/i18n/*`
- `src/features/app/components/*`
- `src/features/home/components/*`
