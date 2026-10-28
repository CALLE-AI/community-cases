# CALL-E Community Cases

## 设计工作入口

先读 [PRODUCT.md](PRODUCT.md) 的产品与证据边界，再读 [DESIGN.md](DESIGN.md) 的设计规范，并检查本次涉及的 HTML/CSS/JS。这里是原生静态网站；沿用现有实现，不因 skill 示例引入新的框架或组件库。

用户要求、产品事实和项目设计规范共同限定当前任务。遇到 skill 的通用建议与已确定的视觉方向冲突时，沿用本项目规则；只有用户明确要求更换方向时才重新选择主题。

## 项目级 skills

四个 skill 的文件和随附资源保存在仓库中，不依赖开发者的个人目录。按实际问题读取相应入口，不把四套完整工作流机械叠加。

| Skill | 本项目用途 |
|---|---|
| [Taste Skill](.agents/skills/design-taste-frontend/SKILL.md) | 内容具体性、画面构图、图像和静态样式检查 |
| [Hallmark](.agents/skills/hallmark/SKILL.md) | 卡片、章节层级、共享组件和移动布局的一致性 |
| [UI/UX Pro Max](.agents/skills/ui-ux-pro-max/SKILL.md) | 针对具体问题查询可访问性、交互与响应式建议 |
| [Impeccable](.agents/skills/impeccable/SKILL.md) | 设计规范维护、可用性审阅和有范围的收尾检查 |

使用 skill 时先遵循其入口中的项目适配说明。`DESIGN.md` 是唯一的项目设计规范，不另建大小写不同的 `design.md` 或平行的 `MASTER.md`；工具生成的候选方案经核实后合入本规范。

`.impeccable/design.json` 保存现有组件的预览和规范格式未涵盖的动效、断点信息。更新对应设计规则时同步它；不要为填充预览而新增产品组件或编造结果。

脚本从仓库根目录运行，或根据当前 `SKILL.md` 的真实位置解析绝对路径。UI/UX Pro Max 需要 Python 3；Taste 的本地脚本需要 Node.js 22+。不自动安装依赖、引擎、浏览器、全局 shortcut 或 hook。Impeccable 只调用已安装引擎；不可用时读取项目文档，按手动流程继续。

浏览器检查遵循当前会话可用工具与权限；不能使用某个自带检查器时，采用允许的浏览器工具并报告实际覆盖，不绕过限制。公开素材搜索只发送非敏感的场景关键词，不上传项目源码、用户数据或凭据。

版本、来源、本地适配和审计范围见 [.agents/skills/README.md](.agents/skills/README.md)。更新 skill 时保留许可证，并重新核对随附代码和本地适配。

## 修改与验证

- 首页只保留案例摘要；完整教程放在对应详情页。主奖案例与其他社区案例分组显示；共享样式修改需检查所有受影响的现有案例。
- 优先复用 `tokens.css`、`assets/community-cards.css` 和 `assets/local-atlas.css`。不为一个案例复制整套样式。
- 后续案例的场景质感、交互和流畅度以 2026-10-28 已验收的 RingBack 为基线，遵循 `DESIGN.md` 的“交互场景验收标准”；优先复用 `assets/ringback-demo/` 的已有实现，再表达各案例的业务差异。
- 视觉变化按 `DESIGN.md` 的交付检查验证；交互变化运行相关测试。文档与 skill 导入不触发真实通话或外部发送。
- 事实、来源、合成示例和核查状态不能因视觉优化而改写。未执行的检查明确列出。
- 提交、推送、发布和部署按当前用户授权范围执行；本地改动本身不构成发布授权。
