# Deep Interview Transcript

## Metadata
- Profile: standard
- Context type: brownfield
- Interview ID: `129bbe9a-7240-4257-967a-bc63d5bfab0c`
- Final ambiguity: `19.6%`
- Threshold: `20%`
- Context snapshot: `.omx/context/codexmonitor-i18n-settings-20260409T063655Z.md`

## Summary
本次访谈将“给项目加中文语言选择”的模糊需求收敛为可执行规格。最终明确：默认英文；在设置中切换语言；切换后即时生效并持久化；覆盖范围是前端 UI 与应用内固定提示；运行时动态内容不纳入翻译；技术方案可自行决定；中文模式验收要求为固定 UI 文案必须完整中文化，不接受英文回退。

## Condensed Transcript
### Round 1
- Target: scope
- Question: 首期覆盖范围是哪一种？
- Answer: 全量 UI

### Round 2
- Target: decision-boundaries
- Challenge mode: contrarian
- Question: “全量 UI”具体覆盖到哪一层？
- Answer: 前端 UI + 应用内提示

### Round 3
- Target: non-goals
- Question: 动态内容默认要不要排除？
- Answer: 全部排除

### Round 4
- Target: decision-boundaries
- Question: 技术方案是否可自行决定？
- Answer: 方案可自行决定

### Round 5
- Target: outcome / success
- Question: 默认语言与切换生效方式是什么？
- Answer: 英文默认并即时生效

### Round 6
- Target: success criteria
- Question: 中文模式下个别漏译如何验收？
- Answer: 必须完整中文化

## Pressure Pass
- Revisited answer: Round 1 的“全量 UI”
- Follow-up: Round 2 追问其实际层级边界，并用 tradeoff 方式逼出是否包含系统通知、Tauri 原生文本与 Rust 侧用户可见字符串
- Result: “全量 UI”被收敛为“前端 UI + 应用内提示”，排除了系统层与 Rust 原生文本的强制覆盖要求
