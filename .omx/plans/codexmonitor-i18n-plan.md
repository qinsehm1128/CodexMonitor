# CodexMonitor i18n 实施计划

## Plan Metadata
- Source spec: `.omx/specs/deep-interview-codexmonitor-i18n-settings.md`
- Planning mode: direct
- Status: ready for implementation

## Requirements Summary
- 默认语言必须是英文。
- 语言切换入口必须位于设置页。
- 用户切换语言后，前端固定 UI 文案与应用内固定提示要即时生效。
- 用户的语言选择要通过现有设置链路持久化，重启后仍保持。
- 中文模式下，纳入范围的固定 UI 文案必须完整中文化，不接受英文回退、空白或 key 泄露。
- 动态内容不纳入翻译：Agent 回复、终端输出、Git diff 原文、文件预览、用户输入保持原样。

## Brownfield Evidence
- 应用入口当前直接渲染 `App`，是挂载 i18n provider 的天然锚点：`src/main.tsx:92`，`src/main.tsx:94`
- `App` 当前只负责窗口分流并返回 `MainApp`，适合保持为轻薄外壳：`src/App.tsx:51`，`src/App.tsx:62`
- 应用设置状态由 `useAppSettingsController` 汇总，且 `useAppBootstrap` 已将其接入全局启动链路：`src/features/app/hooks/useAppSettingsController.ts:7`，`src/features/app/bootstrap/useAppBootstrap.ts:8`
- 前端 `AppSettings` 当前没有通用 UI 语言字段，只有功能性 `dictationPreferredLanguage`：`src/types.ts:238`，`src/types.ts:298`
- 前端设置加载与保存统一经过 `getAppSettings` / `updateAppSettings`：`src/services/tauri.ts:864`，`src/services/tauri.ts:872`
- 前端默认设置由 `buildDefaultSettings` 和 `useAppSettings` 管理，是新增默认 locale 的第一落点：`src/features/settings/hooks/useAppSettings.ts:125`，`src/features/settings/hooks/useAppSettings.ts:282`
- 设置页显示区已经存在大量英文固定文案，且正好是用户要求的语言切换入口位置：`src/features/settings/components/sections/SettingsDisplaySection.tsx:163`，`src/features/settings/components/sections/SettingsDisplaySection.tsx:172`，`src/features/settings/components/sections/SettingsDisplaySection.tsx:495`
- 设置模态本身也存在硬编码标题与返回文案，说明 i18n 不能只改 section 内部：`src/features/settings/components/SettingsView.tsx:70`，`src/features/settings/components/SettingsView.tsx:156`，`src/features/settings/components/SettingsView.tsx:163`
- Rust 端的设置类型、命令面和持久化链路独立存在，新增语言字段必须跨端对齐：`src-tauri/src/types.rs:379`，`src-tauri/src/types.rs:1123`，`src-tauri/src/settings/mod.rs:11`，`src-tauri/src/settings/mod.rs:21`，`src-tauri/src/shared/settings_core.rs:18`，`src-tauri/src/shared/settings_core.rs:43`，`src-tauri/src/storage.rs:154`，`src-tauri/src/storage.rs:173`
- 现有测试已经覆盖设置 hook、设置显示 section 与 SettingsView，可作为 i18n 回归基础：`src/features/settings/hooks/useAppSettings.test.ts:23`，`src/features/settings/components/sections/SettingsDisplaySection.test.tsx:7`，`src/features/settings/components/SettingsView.test.tsx:510`

## Viable Options
### Option A: 自定义 locale context + 手写字典
Pros:
- 依赖最少，控制面完全在仓内
- 对 Tauri / React 的接线简单

Cons:
- 缺失 key 检测、命名空间组织、测试支持都要自己补
- 本次要求“中文模式不能英文回退”，纯手写方案更容易漏文案
- 后续做格式化、复数、插值时扩展成本更高

### Option B: `i18next` + `react-i18next`，外加一层仓内封装
Pros:
- 运行时切换成熟，适合“设置切换后即时生效”
- 有 namespace、缺失 key、测试替身等成熟配套
- 更适合 brownfield 全量固定 UI 迁移

Cons:
- 需要引入新依赖
- 首次迁移需要建立 key 体系与 locale 资源组织规范

## Recommendation
采用 **Option B**：引入 `i18next` + `react-i18next`，并在仓内增加轻量封装层，例如 `src/i18n/` 下的 provider、typed key helper、locale 资源入口。

原因：
- 你的验收不是“能切换就行”，而是“中文模式下固定 UI 文案必须完整中文化，不接受英文回退”。
- 仓库当前没有通用 i18n 基础设施，且已有跨前端 / Tauri / Rust 的设置链路，成熟方案更利于缺失检测、批量迁移和测试收敛。

## ADR
### Decision
采用 `react-i18next` 作为前端 i18n runtime，并在 `AppSettings` 中新增持久化的 UI 语言字段。

### Drivers
- 必须支持即时切换
- 必须持久化用户语言选择
- 中文模式固定 UI 文案必须完整中文化

### Alternatives Considered
- 自定义 context + 手写字典
- 仅新增语言设置字段，后续分批迁移文案

### Why Chosen
成熟库更适合 brownfield 全量迁移和缺失检测，也更容易在测试中验证“无 key 泄露、无英文回退”。

### Consequences
- 仓库会新增一层 i18n 基础设施与 locale 资源目录
- 固定 UI 文案需要做一次系统性抽取与迁移
- 测试需要补充 locale 切换与缺失文案保护

### Follow-ups
- 后续如需系统通知或 Rust 原生错误消息双语化，可在本计划完成后单独立项

## Implementation Steps
### Step 1: 扩展跨端设置合同，增加 UI 语言字段
目标：
- 在前端 `AppSettings`、Rust `AppSettings`、默认值与 JSON 持久化中引入统一字段，例如 `uiLanguage`，候选值至少包含 `en` 与 `zh-CN`

Touchpoints:
- `src/types.ts:238`
- `src/features/settings/hooks/useAppSettings.ts:125`
- `src/services/tauri.ts:864`
- `src/services/tauri.ts:872`
- `src-tauri/src/types.rs:379`
- `src-tauri/src/types.rs:1123`
- `src-tauri/src/settings/mod.rs:11`
- `src-tauri/src/settings/mod.rs:21`
- `src-tauri/src/shared/settings_core.rs:18`
- `src-tauri/src/shared/settings_core.rs:43`
- `src-tauri/src/storage.rs:154`
- `src-tauri/src/storage.rs:173`

Deliverables:
- 类型定义
- 默认值为 `en`
- 读写链路对齐
- Rust 端默认值 / round-trip 测试补充

### Step 2: 建立前端 i18n 基础设施
目标：
- 新增 `src/i18n/` 目录，提供 provider、language switch API、namespace 组织和 locale 资源入口

Suggested files:
- `src/i18n/index.ts`
- `src/i18n/provider.tsx`
- `src/i18n/config.ts`
- `src/i18n/locales/en/*`
- `src/i18n/locales/zh-CN/*`
- `src/i18n/useT.ts`

Design notes:
- 统一使用 key 调用，而不是继续散落硬编码文案
- 在 dev / test 环境提供缺失 key 可见化或直接 fail 的机制
- 禁止以“中文缺了就回退英文”作为最终行为

### Step 3: 把 i18n runtime 接入应用启动链路，并处理首屏语言状态
目标：
- 把 provider 接到应用根部，并让当前 locale 跟随 `appSettings.uiLanguage`

Touchpoints:
- `src/main.tsx:92`
- `src/main.tsx:94`
- `src/App.tsx:51`
- `src/App.tsx:62`
- `src/features/app/hooks/useAppSettingsController.ts:7`
- `src/features/app/bootstrap/useAppBootstrap.ts:8`
- `src/features/app/components/MainApp.tsx:96`

Recommended behavior:
- 默认先以 `en` 初始化
- 启动期复用现有 `appSettingsLoading`，避免已选择中文的用户在重启时先看到英文闪屏
- 用户在设置切换语言后，直接驱动 i18n runtime 更新，无需刷新或重启

### Step 4: 在设置页增加语言切换入口，并完成设置侧文案迁移
目标：
- 在设置页 `Display` 区或其相邻位置新增语言选择器
- 先把 Settings 模态及其子 section 完整迁移为 i18n key

Touchpoints:
- `src/features/settings/components/SettingsView.tsx:70`
- `src/features/settings/components/SettingsView.tsx:156`
- `src/features/settings/components/SettingsView.tsx:163`
- `src/features/settings/components/SettingsView.tsx:171`
- `src/features/settings/components/SettingsView.tsx:195`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx:163`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx:172`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx:495`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx:509`
- `src/features/settings/components/sections/SettingsDisplaySection.tsx:523`

Deliverables:
- 语言选择器
- 设置页固定文案 key 化
- 切换后 settings 当前视图即时更新

### Step 5: 迁移共享壳层与高复用组件，再做全量固定 UI 文案扫尾
目标：
- 先迁移会波及全局的壳层、导航、按钮、modal、toast、empty state
- 再执行固定 UI 文案 inventory sweep，补齐剩余页面

Evidence examples:
- 设置模态标题和动作文案已是固定英文：`src/features/settings/components/SettingsView.tsx:156`，`src/features/settings/components/SettingsView.tsx:163`
- 组合器字典按钮提示已有固定英文：`src/features/composer/hooks/useComposerDictationControls.ts:32`，`src/features/composer/hooks/useComposerDictationControls.ts:40`

Execution notes:
- 先扫 `src/features/**` 中的固定 UI 文案，排除 `*.test.*`
- 对动态内容保持白名单排除，不做误翻译
- 如果某些字符串同时承担语义与测试选择器角色，优先补 `aria-label` / `data-testid`，不要把测试绑死在英文文案上

### Step 6: 补测试与缺失文案保护
目标：
- 确保 settings 持久化、即时切换、中文完整性、动态内容排除都有自动化回归

Touchpoints:
- `src/features/settings/hooks/useAppSettings.test.ts:23`
- `src/features/settings/components/sections/SettingsDisplaySection.test.tsx:7`
- `src/features/settings/components/SettingsView.test.tsx:510`
- `src-tauri/src/types.rs:1123`
- `src-tauri/src/storage.rs:154`

Add tests for:
- `useAppSettings` 默认 locale 为 `en`
- 保存 `uiLanguage` 时调用 `updateAppSettings`
- 设置页语言选择器切换后即时刷新文案
- 中文模式下不出现 key / placeholder / 英文回退
- Rust 设置反序列化、默认值、读写 round-trip

### Step 7: 验证全量覆盖并收口
目标：
- 在交付前做一轮固定 UI 文案扫描与人工 walkthrough

Verification checklist:
- 打开应用，默认英文
- 设置中切换到中文，当前窗口即时全量切换
- 关闭应用重开，仍保持中文
- 在中文模式下抽查 Settings、Sidebar、Composer、Git、Threads、Home 等主区域
- 确认动态内容原样显示，不受 i18n 影响

## Risks And Mitigations
### Risk 1: 固定 UI 文案分散，容易漏翻
Mitigation:
- 先建统一 i18n 入口，再做 inventory sweep
- 增加测试态缺失 key 保护
- 以“中文模式不得英文回退”为验收红线

### Risk 2: 设置已持久化，但首屏出现英文闪屏
Mitigation:
- 复用 `appSettingsLoading` 做启动 gating
- 不采用“渲染后再异步切语言”的裸方案

### Risk 3: TS / Rust 设置字段不同步导致保存失败或旧配置损坏
Mitigation:
- 把新增字段放进 TS 类型、Rust struct、default、storage read/write 和测试一起改
- 保持默认值向后兼容，确保旧配置缺字段时仍落回 `en`

### Risk 4: 测试依赖英文文案，迁移后大面积脆断
Mitigation:
- 优先把测试断言从英文 copy 迁到角色、label 或 `data-testid`
- 对必须断言文案的测试，明确按 locale 运行

## Verification Steps
### Automated
- `npm run typecheck`
- `npm run test -- src/features/settings/hooks/useAppSettings.test.ts`
- `npm run test -- src/features/settings/components/sections/SettingsDisplaySection.test.tsx`
- `npm run test -- src/features/settings/components/SettingsView.test.tsx`
- `npm run test`
- `cd src-tauri && cargo check`

### Manual
1. 冷启动应用，确认默认英文
2. 打开 Settings，找到语言选择器并切换到中文
3. 不关闭窗口，确认 Settings 当前页与主壳层即时切换
4. 关闭并重开应用，确认语言保持中文
5. 在中文模式下走一遍主流程，确认没有英文固定文案、key 泄露或空白 UI

## Recommended Execution Order
1. 先做 Step 1-3，建立稳定运行时与持久化基础
2. 再做 Step 4，把设置页切换入口与 settings 文案跑通
3. 再做 Step 5-7，完成全量固定 UI 迁移、测试与收口

## Execution Handoff
- 推荐执行入口：`$ralph .omx/plans/codexmonitor-i18n-plan.md`
- 如果希望并行推进，可改走：`$team .omx/plans/codexmonitor-i18n-plan.md`
