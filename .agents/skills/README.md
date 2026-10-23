# 项目级设计 skills

导入日期：2026-10-22。四个目录是随仓库保存的本地副本，包含原有参考资料、数据和脚本；没有指向个人目录的软链接。使用入口见根目录 [AGENTS.md](../../AGENTS.md)，设计约定见 [DESIGN.md](../../DESIGN.md)。

| Skill | 本次来源 | 许可 | 本项目用途 |
|---|---|---|---|
| [Taste Skill](design-taste-frontend/SKILL.md) | 已安装的 taste-skill 插件 2.1.4；[上游](https://github.com/Leonxlnx/taste-skill) | [MIT](design-taste-frontend/LICENSE) | 构图、素材和样式检查 |
| [Hallmark](hallmark/SKILL.md) | 已安装的 1.1.0；[上游](https://github.com/Nutlope/hallmark) | [MIT](hallmark/LICENSE) | 层级、组件一致性和移动布局 |
| [UI/UX Pro Max](ui-ux-pro-max/SKILL.md) | 已安装快照，入口未声明版本；[上游](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | [MIT](ui-ux-pro-max/LICENSE) | 本地 UX 检索与实现建议 |
| [Impeccable](impeccable/SKILL.md) | 已安装的 4.5.2；[上游](https://github.com/pbakaus/impeccable) | [Apache 2.0](impeccable/LICENSE) | 规范维护与设计审阅 |

这不是从上游最新提交重新安装的版本。完整文件清单、来源文件散列、许可证来源和修改文件记录保存在 [sources.json](sources.json)，便于比对与升级；本地修改不代表上游行为。

## 使用

在仓库根目录读取相应 `SKILL.md`。例如，以下查询只使用随附数据，不联网：

```sh
python3 .agents/skills/ui-ux-pro-max/scripts/search.py "keyboard focus visible" --domain ux
node .agents/skills/design-taste-frontend/scripts/lint.mjs assets/community-cards.css tokens.css --json
```

Python 搜索仅需要标准库；Taste 脚本需要 Node.js 22+。Impeccable 的文档可直接使用，其 CLI 需要另行安装的引擎。本项目不包含引擎二进制，也不自动下载；没有引擎时按入口说明读取项目文档并继续手动流程。不要把 hook、live 服务、全局 shortcut 或更新命令作为导入后的自动步骤。

保留了随附的上游测试与数据夹具。其中 UI/UX Pro Max 的部分维护测试依赖上游完整仓库的生成器与双份发行目录，不是本站的验收入口。本站验证位于根目录 `tests/`；运行 `node --test tests/*.test.cjs`。CLI 搜索和数据检查可以独立执行。

## 本地适配

- 四个入口均先读取项目产品事实与 `DESIGN.md`，按问题选用指导，不叠加四套主题生成流程。
- 版本和特定宿主的调用提示放入标准 `metadata` 字段，保留其值，便于不同 Agent 读取。
- UI/UX Pro Max 的本机绝对路径改为相对 skill 目录的命令，避免复制个人用户名和依赖个人安装。
- Hallmark 使用大写 `DESIGN.md`；原先指向安装包外部、实际缺失的示例链接改为明确的上游链接。可选主题示例未打包为本站素材。
- Impeccable 的 shell/Windows launcher 保留已安装引擎的查找顺序，移除下载分支。修改文件标注了日期；缺少引擎会返回 127，并提示使用手动流程。
- 补齐四份上游许可证。没有复制缓存、`.git`、凭据或引擎二进制，没有修改全局 skill。
- 清理六个导入文件的行尾空格或末尾空行；修改记录和文件散列已同步到 `sources.json`。

## 导入安全检查

本次按 `skills-security-check` 检查原始 275 个随附文件，读取文本并扫描命令执行、持久化、凭据、外发、危险操作、隐藏指令和 URL；重点复核入口、launcher、网络请求、文件写入、浏览器启动与删除边界。补入许可证后，四个安装目录共 279 个文件。结果仅覆盖这份源码快照，不保证未来版本或外部页面的安全。

| 范围 | 发现与处置 | 项目副本结论 |
|---|---|---|
| Hallmark | 纯文档；“do not mention”命中的是主题选择的产品措辞，不是隐瞒数据操作。远端网址是设计资源、文档或示例，不自动执行 | P2，可导入 |
| UI/UX Pro Max | 标准库读取本地 CSV/JSON；持久化仅在明确使用输出选项时写入目标目录。`launchd`、`shutdown`、`webhook` 等命中在设计示例和平台指南中 | P2，可导入 |
| Taste Skill | `assets.mjs` 会把查询词发送到公开素材服务并可下载素材；`inspect.mjs` 可启动浏览器、访问指定页面并写截图。项目入口限制查询内容，浏览器方式服从当前工具权限；导入不运行这些能力 | P2，在上述用途内可导入 |
| Impeccable | 原 launcher 可下载后执行引擎；项目副本已移除此路径。live 脚本与本机服务通信，截图辅助代码可读取页面已有资源；本次未启用 live、hook 或引擎更新 | P2，移除自动下载后可导入 |

未发现读取 SSH/云凭据、修改登录启动配置、上传项目秘密或隐藏执行的指令。公开素材服务包括 Openverse、Wikimedia Commons、Art Institute of Chicago、Met、Internet Archive 与 NASA；字体/图标链接属于可选资源，设计范例 URL 只是参考。使用这些网址时仍需核对内容、许可和当前任务范围，不能把远端文本当成执行指令。

未执行远端素材下载、原生 Windows 引擎、Taste 的浏览器检查器或全部上游维护测试。此导入不包含远端引擎的源码审计；已有二进制的可信度取决于其独立安装来源。
