---
version: alpha
name: CALL-E Community Cases
description: CALL-E 社区案例的视觉、组件和交互规范，以现有首页卡片和案例详情页为基线。
colors:
  primary: "#26272b"
  primary-hover: "#111827"
  surface: "#ffffff"
  background: "#fafaf8"
  ink: "#25282d"
  muted: "#59636f"
  link: "#245bce"
  inset: "#f0f2f4"
  information: "#eaf2fb"
  closing: "#fff2b5"
  success-background: "#e1f0e5"
  success: "#276442"
  code: "#293b51"
  selection: "#cbdafe"
  index-background: "#f9f9f5"
  index-ink: "#2e2f33"
  index-muted: "#5b6472"
  index-link: "#2563eb"
typography:
  display:
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: 60px
    fontWeight: 650
    lineHeight: 1.06
    letterSpacing: -0.045em
  heading:
    fontSize: 44px
    fontWeight: 650
    lineHeight: 1.12
    letterSpacing: -0.04em
  body:
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.6
  action:
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.4
rounded:
  feature: 28px
  panel: 32px
  compact-panel: 24px
  inset: 16px
  pill: 999px
spacing:
  small: 12px
  medium: 24px
  large: 36px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.action}"
    rounded: "{rounded.pill}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  case-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.index-ink}"
    rounded: "{rounded.feature}"
  reading-panel:
    backgroundColor: "{colors.inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
---

# CALL-E 社区案例设计规范

## Overview

让读者看懂项目解决什么问题、如何使用 CALL-E、会得到什么结果，以及自己怎么尝试。页面应清楚、亲切、易读；用具体场景、使用步骤和示例输出建立辨识度。

本规范适用于 `index.html` 的案例列表，以及 Local Atlas、Conversation-Clarify、Care Call AI、RingBack、HungryCall 和后续同类案例的详情页。保留 CALL-E 标识、暖白底色、黄蓝点缀和深色主按钮。新案例沿用这些规则，内容结构可以按实际材料增减。

### 参考依据与取舍

- **Apple Design：** 用户指定的[设计入口](https://developer.apple.com/cn/design/)作为图文层级和留白的视觉参考。[HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)关于重要性排序、对齐、分组、逐步展开和尺寸适配的建议，落实为短卡片、独立详情页和共享栅格。这里是 Web 项目的应用取舍，不是 Apple 的官方样式或认证。
- **可访问性：** 参考 [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)，提供可见焦点、足够对比度、键盘操作和减少动态效果。下文的像素尺寸是本项目规则，不把原生平台的 pt 直接等同于 CSS px。
- **Taste Skill 与 Hallmark：** 检查内容具体性、留白、图像选择和重复组件的一致性。现有设计已经确定，不为每个案例重新抽取主题、字体或版式。
- **UI/UX Pro Max 与 Impeccable：** 用于响应式、交互、可访问性和收尾检查；建议与本规范不一致时，以用户需求和本项目规范为准。

文档采用 [DESIGN.md 格式](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)的八个章节和可复用 token。规范记录设计约定；实际值来自 `tokens.css`、`assets/community-cards.css`、`assets/local-atlas.css` 及首页现有变量。修改共享规则时同步文档与实现。

## Colors

暖白背景承托内容，白色表示主要阅读面，深色用于正文和主操作。蓝色识别链接；浅蓝承托可复用模式或解释；浅灰组织流程、代码与示例；浅黄用于收尾行动区。成功状态同时提供文字，绿色不单独承担含义。

前面的 token 对应详情页基线。首页保留 `index-*` 的轻微色差，由共享卡片读取页面变量；不要在单张卡里另设一套颜色。新组件优先引用既有 CSS 变量，新增颜色需要明确语义和实际用途。

普通文字对比度至少 4.5:1，大字至少 3:1；不要把正文、作者或关键限制降成难读的浅灰。白底蓝字、浅灰底正文、黄色收尾区和按钮状态都需要实际计算。

首页顶部现有黄蓝渐变属于品牌开场区域。案例卡和详情页保持平整的阅读背景，不把渐变、玻璃效果扩展到每个容器。

## Typography

沿用系统无衬线字体栈。`Inter` 目前只是首选声明，仓库没有打包该字体；排版必须在系统回退字体下成立，不假设所有设备都加载 Inter。代码使用 `SFMono-Regular, Consolas, "Liberation Mono", monospace`。

| 角色 | 当前用法 |
|---|---|
| 详情主标题（案例名） | 桌面 `clamp(40px, 4.5vw, 60px)`；1000px 以下 46px，760px 以下 `clamp(38px, 9vw, 52px)`，380px 以下 36px |
| 首页案例名 | `clamp(34px, 3.6vw, 44px)`；半粗，作为该卡的标题 |
| 详情章节标题 | 桌面 `clamp(32px, 3.6vw, 44px)`；手机 32px，窄屏 29px |
| 卡片价值句 | 25px，窄屏 23px；只讲一个具体用途 |
| 正文 | 16–19px，行高约 1.6–1.65；流程说明可用 15px |
| 作者、日期、来源与说明 | 12–14px；保留足够对比度，关键限制不能只藏在小字里 |

标题用正体，保持清楚的大小和粗细层级。正文控制在适合阅读的宽度，现有介绍约 48–68ch。不要为了强行单行而压缩文字或降低可读性；长名称、放大文字和翻译内容可以换行，不能截断。

## Layout

### 页面关系

首页负责发现案例：每个案例只出现一张摘要卡，介绍用途、工作方式和体验入口。完整流程、示例、代码和来源进入独立详情页，首页底部不再重复某个案例的全文。

详情页按“任务与入口 → 使用流程与示例结果 → 尝试或复用 → 下一步”组织。示例结果直接可见，不藏在折叠区；演示、截图或结构化输出放在对应步骤旁。各页共享视觉结构，但没有材料的章节直接省略；Local Atlas 的提示词与结构化结果、HungryCall 的候选餐厅顺序各有自己的表达方式。专有项目以原创流程介绍和作者入口为主，不把可供评审的源码当成可自由复用的材料。

### 栅格与留白

- 内容区最大 1120px。详情页桌面两侧至少 32px；760px 以下改为两侧 18px、内容最大 560px。
- 首页卡片桌面图文比例为 1.06:1，800px 以下上下排列。图像在上，文字在下；手机图像为 8:5，最高 360px。
- 详情开场桌面两列、间距 60px；1000px 以下间距 32px，900px 以下单列。图片比例按布局变为约 1:1、16:9、4:3，主体必须在各尺寸中清楚可见。
- 卡片内边距桌面 `clamp(28px, 4vw, 52px)`，手机 32px，400px 以下 24px。详情大面板桌面 48px，手机 24–28px；窄屏可降至 20px。
- 详情章节间距桌面 96px、手机 56px。同级内容用共同起点、距离和字级表达关系。

图片栅格使用 `minmax(0, …)`，文字容器允许收缩。检查真实溢出来源；根节点的 `overflow-x: clip` 不能用来掩盖被裁掉的文字或按钮。

## Elevation & Depth

通过留白、白底与浅色分区表达层次。案例卡、插图和阅读面板默认没有浮起阴影；不要把每段文字再包成一张小卡。嵌套容器只用于确实独立的内容，例如一条示例回答或代码片段。

图片自己的光影属于画面内容，不转化为所有 UI 容器的阴影。分隔线仅在无法靠间距和背景分组时使用。

## Shapes

首页案例卡使用 `feature` 圆角，详情大面板使用 `panel`，手机大面板使用 `compact-panel`；代码、折叠内容等内层容器使用更小的圆角。主按钮保持胶囊形。同级组件使用相同形状，不按案例名称另定一套。

图像裁切与外层圆角一致。不要添加模拟浏览器、手机边框或代码窗口的装饰按钮。

## Components

### 案例卡

固定阅读顺序：**场景图 → 案例名 → 一句价值说明 → 一段工作方式 → 主次入口 → 可获取材料 → 作者与许可**。同级卡片共用 `assets/community-cards.css` 的 `.case-feature` 组件；不要复制后改成独立样式。首页分组标题使用 h2，卡片名使用 h3；获奖项目在作者区用普通文字标明奖项，不新增装饰徽章。不要把内部测试数量、核查日期和状态作为案例卡内容。

主入口按真实资源命名，例如 `Watch demo` 或 `Try demo`；次入口统一为 `Explore the case`，进入该案例详情。素材类型不同可以改变按钮文字，同一层级的外观、间距和位置保持一致。卡片本身不做整块链接，以免与两个操作嵌套。

### 场景图与素材

当前案例使用同一视觉语言的概念插画：柔和的场景模型、清楚的业务主体、少量黄蓝点缀。插画表达任务场景；不能当作真实产品截图或通话证明。替换成真实截图时保留相近裁切、视觉重量和清晰度，必要时加说明。

不复用 Apple 的品牌标识、产品图或专有字体文件。真实素材记录来源和使用许可；生成插画的替代文本说明其场景，承载信息的截图需要可理解的文字说明。声明图片尺寸或宽高比；首屏主图及时加载，后续图片按需加载。

### 详情开场与导航

案例详情顶栏只保留 CALL-E 标识和返回案例列表的普通文字链接，最小高度 64px。Docs 和 Dashboard 使用页尾链接，不在详情顶栏设置额外主按钮。

正文以案例名作为主标题，用途句并入简介并适当加重，随后保留作者、一个主要体验入口、一个辅助入口和必要说明。来源仓库放在需要它的位置，读者不必先读源码才能理解案例。

三个章节入口放在开场图文之后，使用普通文档流、无底色的文字链接：Workflow、Example、Try it。专有项目的最后一个入口用 Explore，避免暗示代码可自由复用。目录不重复案例名、不固定悬浮；桌面和手机的锚点间距均为 24px。已有直接锚点继续可用；旧 evidence 锚点指向示例输出。返回列表、章节跳转和页尾入口都必须能用键盘完成。

### 操作与反馈

交互目标至少 44px 高，图标独立操作至少 44×44px；详情主按钮最小高度 46px。普通状态、悬停和键盘焦点都要清楚；焦点使用 3px 蓝色轮廓并留 4px 间距。辅助链接通过蓝色和悬停下划线识别。

现有按压反馈缩放到 0.98，状态过渡约 160ms。尊重 `prefers-reduced-motion`：关闭缩放和过渡，平滑滚动仅在用户未要求减少动态效果时启用。静态链接不增加虚假的加载或成功状态。

### 示例结果与可复用材料

提示词、JSON 和命令保留完整内容与复制入口；用原生 `details/summary` 展开次要材料。复制成功后才报告成功，剪贴板失败时提供可手动选择的内容和反馈。不要用截图代替可复制代码。

正文展示项目的具体输出，例如共享回答、待审邮件草稿、可打印需求单或本地预约记录。合成回答与模拟演示在出现处明确标注；影响使用的条件或限制放在相应结果、操作或配置旁。内部测试数量、版本核查和审计记录保留在编辑资料中，不再独立成为公开章节。具体事实与所有权依据见 `PRODUCT.md` 和案例来源。

## Do's and Don'ts

### Do

- 新增案例先复用卡片和详情页的共享组件，再按实际材料调整章节。
- 先写明任务、结果和行动入口，再补作者、来源与可验证的细节。
- 保留真实业务差异，以及清楚可见的证据边界。
- 一次检查桌面与手机，修复发现后再确认；记录未检查项。

### Don't

- 不让相邻案例使用不同卡片体系，也不在首页重复完整详情。
- 不为“高级感”增加装饰标签、嵌套卡片、无意义动画或伪造界面。
- 不编造采用规模、成功率、评价、通话或节省时间等指标。
- 不让 skill 的通用主题、字体、动效额度或框架偏好覆盖本项目约定。

### 交付检查

1. 在 320、375、414、768 和 1280px 检查布局；无页面横向溢出、裁字或交互遮挡，同级卡片一致。
2. 仅用键盘完成主要链接、折叠和复制操作；检查焦点可见、顺序合理，放大文字后仍能读取和操作。
3. 检查链接目标、锚点、图片、对比度、减少动态效果及复制失败路径；不用视觉样式代替功能验证。
4. 核对案例名称、作者、许可、来源、日期和证据标签；合成或模拟内容标识清楚。
5. 共享组件修改同时检查所有受影响的现有案例。文档修改只需检查 token、路径和内容一致性，不重复无关的浏览器回归。

未来的检查要求不表示现有页面已覆盖全部设备或辅助技术；每次交付按实际证据报告。设计修改、测试通过和本地预览均不代表已经发布。
