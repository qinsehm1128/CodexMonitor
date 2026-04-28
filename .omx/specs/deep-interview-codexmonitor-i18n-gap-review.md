# Deep Interview Spec

## Metadata
- Profile: standard
- Rounds: 3
- Final ambiguity: `18.4%`
- Threshold: `20%`
- Context type: brownfield
- Context snapshot: `.omx/context/codexmonitor-i18n-gap-review-20260409T073334Z.md`
- Transcript: `.omx/interviews/codexmonitor-i18n-gap-review-20260409T073334Z.md`

## Clarity Breakdown
| Dimension | Score |
| --- | --- |
| Intent | 0.82 |
| Outcome | 0.80 |
| Scope | 0.90 |
| Constraints | 0.80 |
| Success | 0.78 |
| Context | 0.92 |

## Intent
在当前 i18n 主线已经跑通的基础上，明确“还缺什么”和“这轮继续推进要补到哪里为止”，避免把功能 gap、环境阻塞和流程收口混在一起。

## Desired Outcome
- 继续推进时，以补齐剩余固定 UI 文案为主目标。
- 范围覆盖所有用户可见且非动态的固定文本，不只限主界面。
- `cargo check` 的 `libclang` 环境阻塞单独记录，不阻塞本轮 i18n 收尾。
- 形成可直接交给下一轮执行的 gap 清单和完成标准。

## In Scope
- 所有用户可见且非动态的固定 UI 文案补齐。
- 包括主界面、常见弹窗、边缘层固定提示、辅助描述、metadata 文本、可见 label / aria 文本。
- 对已完成改动做 gap review，并据此继续推进。
- 保持既有 i18n 主线能力：默认英文、设置切换、即时生效、持久化。

## Out-of-Scope / Non-goals
- 动态内容翻译：Agent 回复、终端输出、Git diff 原文、文件预览、用户输入。
- 把 `cargo/libclang` 环境问题当成本轮 i18n 功能收尾的硬阻塞。
- 仅做“差距审计后停止”，不继续执行。

## Decision Boundaries
- 可以直接继续补剩余固定 UI 文案，不需要重新规划主方案。
- `cargo check` 的 `libclang` 缺失明确视为独立环境阻塞项。
- 该环境问题需要保留在交付结论中，但不阻塞本轮 i18n 功能完成判定。

## Constraints
- 不破坏既有已通过的前端验证面：`typecheck`、`build`、全量 `test`。
- 继续遵守原始 i18n spec：默认英文、设置切换、即时生效、持久化。
- 动态内容仍保持原样，不纳入翻译。

## Testable Acceptance Criteria
1. 当前仍残留的用户可见固定 UI 文案被补齐为中英双语。
2. “剩余固定 UI”范围覆盖边缘层固定文本，而不只是主界面与常见弹窗。
3. 前端验证面保持绿色：`npm run typecheck`、`npm run build`、`npm run test` 持续通过。
4. 交付说明中明确列出 `cargo/libclang` 为独立环境阻塞，而不是 i18n 功能错误。
5. 中文模式下剩余补齐范围内的固定 UI 文案不允许英文回退、translation key、空白占位符。

## Assumptions Exposed And Resolutions
- Assumption: 这轮“继续推进”可能应先去处理 `cargo check` 环境阻塞。
  - Resolution: 否。优先补剩余固定 UI 文案，环境问题独立记录。
- Assumption: “剩余固定 UI”只包含主界面和常见弹窗。
  - Resolution: 否。所有用户可见且非动态的固定文本都算本轮范围。
- Assumption: 可以只做 review，不继续推进代码。
  - Resolution: 否。用户明确要求继续推进。

## Pressure-pass Findings
- Pressure target: “先补剩余固定 UI”
- Challenge mode: contrarian
- What changed: 从宽泛的“补剩余 UI”澄清为“所有用户可见且非动态的固定文本都算”
- Impact: 直接排除了“只补主路径，其余边角文案后置”的误解

## Brownfield Evidence Vs Inference
### Evidence
- 当前主线验证已通过：`typecheck`、`build`、全量 `test`
- 当前仍有固定 UI 英文热点示例：
  - `src/features/about/components/AboutView.tsx`
  - `src/features/debug/components/DebugPanel.tsx`
  - `src/features/app/utils/usageLabels.ts`
- `cargo check` 当前失败原因是 `whisper-rs-sys` 缺 `libclang` 环境，不是本次 i18n 代码类型错误

### Inference
- 当前继续推进的最佳路径不是重做架构，而是做固定 UI 文案扫尾
- 功能 gap 与环境阻塞需要拆开管理，否则会拖慢 i18n 收尾

## Technical Context Findings
- 已完成的设置合同与运行时入口：
  - `src/types.ts`
  - `src/features/settings/hooks/useAppSettings.ts`
  - `src-tauri/src/types.rs`
  - `src/main.tsx`
  - `src/features/app/components/MainApp.tsx`
  - `src/i18n/*`
- 当前确认的剩余固定 UI 热点：
  - `src/features/about/components/AboutView.tsx`
  - `src/features/debug/components/DebugPanel.tsx`
  - `src/features/app/utils/usageLabels.ts`

## Missing Content / Unfinished Tasks
### Missing content
- About 页面固定英文文案
- Debug 面板固定英文文案
- usage label / reset / credits 等固定展示文本
- 其余用户可见且非动态的边缘层固定文本

### Unfinished tasks
- 继续迁移剩余固定 UI 文案
- 保持前端验证面持续绿色
- 在最终交付中明确记录 `cargo/libclang` 为独立环境阻塞

## Recommended Handoff
- Recommended: `$ralph .omx/specs/deep-interview-codexmonitor-i18n-gap-review.md`
- Reason: 需求边界已经足够明确，下一轮应该直接进入“剩余固定 UI 收尾 + 验证保绿”的执行闭环，而不是再次规划。
