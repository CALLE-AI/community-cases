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
  index-background: "#f6f7f5"
  index-ink: "#2e2f33"
  index-muted: "#5b6472"
  index-link: "#2563eb"
  index-border: "#dde5ef"
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
  index-display:
    fontFamily: 'Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: clamp(42px, 5.3vw, 64px)
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -0.04em
  index-display-compact:
    fontSize: clamp(36px, 9vw, 44px)
    lineHeight: 1.1
  index-intro:
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.65
  index-intro-compact:
    fontSize: 17px
    lineHeight: 1.6
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

本规范适用于 `index.html` 的案例列表，以及 Local Atlas、Conversation-Clarify、Care Call AI、RingBack、HungryCall 和后续同类案例的详情页。保留 CALL-E 标识、黄蓝场景插画和案例卡深色主按钮。首页使用连续中性背景和统一 Geist，Logo 与 Use Cases 组成栏目身份；详情页保留暖白、黄蓝点缀和既有字体。新案例沿用这些规则，内容结构可以按实际材料增减。

### 参考依据与取舍

- **Apple Design：** 用户指定的[设计入口](https://developer.apple.com/cn/design/)作为用途、层级、对齐、可读性和尺寸适配的方法论参考。[HIG Layout](https://developer.apple.com/design/human-interface-guidelines/layout)关于重要性排序、对齐、分组、逐步展开和尺寸适配的建议，落实为短卡片、独立详情页和共享栅格。首页围绕现有案例建立自己的布局，不照搬 Apple 网站或 CALL-E Blog 页面；这里是 Web 项目的应用取舍，不是 Apple 的官方样式或认证。
- **可访问性：** 参考 [HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)，提供可见焦点、足够对比度、键盘操作和减少动态效果。下文的像素尺寸是本项目规则，不把原生平台的 pt 直接等同于 CSS px。
- **Taste Skill 与 Hallmark：** 检查内容具体性、留白、图像选择和重复组件的一致性。现有设计已经确定，不为每个案例重新抽取主题、字体或版式。
- **UI/UX Pro Max 与 Impeccable：** 用于响应式、交互、可访问性和收尾检查；建议与本规范不一致时，以用户需求和本项目规范为准。

文档采用 [DESIGN.md 格式](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md)的八个章节和可复用 token。规范记录设计约定；实际值来自 `tokens.css`、`assets/community-cards.css`、`assets/local-atlas.css` 及首页现有变量。修改共享规则时同步文档与实现。

## Colors

详情页用暖白背景承托内容，白色表示主要阅读面，深色用于正文和主操作。蓝色识别链接；浅蓝承托可复用模式或解释；浅灰组织流程、代码与示例；浅黄用于收尾行动区。成功状态同时提供文字，绿色不单独承担含义。

颜色 token 中的 `index-*` 对应首页，其余保留详情页与共享组件基线。首页共享卡片读取页面变量；不要在单张卡里另设一套颜色。新组件优先引用既有 CSS 变量，新增颜色需要明确语义和实际用途。

普通文字对比度至少 4.5:1，大字至少 3:1；不要把正文、作者或关键限制降成难读的浅灰。白底蓝字、浅灰底正文、黄色收尾区和按钮状态都需要实际计算。

首页页头、介绍区、案例间隙和页脚共用 `index-background`，以留白、对齐和 `index-border` 分隔内容；白色案例卡承托图文，黄蓝色来自既有场景插画。官网入口使用正文色文字链接，悬停时转为 `index-link` 并加下划线。蓝色还用于案例辅助链接与键盘焦点，不装饰静态标题。首页不使用渐变或白、黄、白的分段横带。

## Typography

详情页沿用系统无衬线字体栈。`Inter` 目前只是首选声明，仓库没有打包该字体；排版必须在系统回退字体下成立，不假设所有设备都加载 Inter。代码使用 `SFMono-Regular, Consolas, "Liberation Mono", monospace`。

首页的页头、介绍、案例卡和页脚统一使用本地 Geist，回退栈与 `index-display` 相同。Latin 可变字体随站点存放在 `assets/fonts/`，保留 OFL 许可和来源；加载失败时使用系统无衬线字体。栏目名 15px、官网入口 14px，字重 600、行高 1.5；600px 以下两者均为 13px。详情页的字体保持现有规则。

| 角色 | 当前用法 |
|---|---|
| 首页主标题 | 使用 `index-display`；680px 以下以 `index-display-compact` 覆盖字号与行高，并取消强制换行 |
| 首页介绍 | 使用 `index-intro`；680px 以下以 `index-intro-compact` 覆盖字号与行高 |
| 详情主标题（案例名） | 桌面 `clamp(40px, 4.5vw, 60px)`；1000px 以下 46px，760px 以下 `clamp(38px, 9vw, 52px)`，380px 以下 36px |
| 首页案例名 | `clamp(34px, 3.6vw, 44px)`；半粗，作为该卡的标题 |
| 详情章节标题 | 桌面 `clamp(32px, 3.6vw, 44px)`；手机 32px，窄屏 29px |
| 卡片价值句 | 25px，窄屏 23px；只讲一个具体用途 |
| 正文 | 16–19px，行高约 1.6–1.65；流程说明可用 15px |
| 作者、日期、来源与说明 | 12–14px；保留足够对比度，关键限制不能只藏在小字里 |

标题用正体，保持清楚的大小和粗细层级。正文控制在适合阅读的宽度，详情页现有介绍约 48–68ch。不要为了强行单行而压缩文字或降低可读性；长名称、放大文字和翻译内容可以换行，不能截断。

## Layout

### 页面关系

首页负责发现案例：每个案例只出现一张摘要卡，介绍用途、工作方式和体验入口。完整流程、示例、代码和来源进入独立详情页，首页底部不再重复某个案例的全文。

详情页按“任务与入口 → 使用流程与示例结果 → 尝试或复用 → 下一步”组织。示例结果直接可见，不藏在折叠区；演示、截图或结构化输出放在对应步骤旁。各页共享视觉结构，但没有材料的章节直接省略；Local Atlas 的提示词与结构化结果、HungryCall 的候选餐厅顺序各有自己的表达方式。专有项目以原创流程介绍和作者入口为主，不把可供评审的源码当成可自由复用的材料。

### 栅格与留白

- 内容区最大 1120px。详情页桌面两侧至少 32px；760px 以下改为两侧 18px、内容最大 560px。
- 首页页头、介绍、案例列表和页脚桌面两侧至少 20px；680px 以下介绍、案例列表和页脚改为两侧 14px，页头保留 20px。
- 首页标题与介绍桌面以 1.5:1 两列并排，底部对齐、间隔 64px，上下留白为 56px 与 48px；介绍限宽 38ch。900px 以下改为单列，间隔 24px、上下留白各 48px，介绍限宽 56ch。680px 以下间隔 20px、上下留白各 40px。
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

### 首页页头与页脚

首页页头与介绍区共用连续中性背景，以底部分隔线和留白区分。左侧官方 Logo 与 Use Cases 栏目名并排，使用 1px 竖线区分；栏目名是带 `aria-current="page"` 的文字，不是重复跳回当前页的链接。右侧 `Explore CALL-E` 使用低强调文字链接与右上箭头，和 Logo 一样进入官网。Website、Docs、GitHub 和 Dashboard 位于页脚，页脚链接允许换行。

页头与桌面 1120px 正文栅格对齐，两侧至少 20px，最小高度 80px，垂直内边距 12px。桌面 Logo 为 134×44px，与栏目名间隔 20px；600px 以下 Logo 宽 104px，Use Cases 排在 Logo 下方并持续可见，移除竖线。官网链接上下内边距 10px；文字放大时允许整组换行。页头和页脚链接至少 44px 高，焦点使用 2px 蓝色轮廓并留 3px 间距。680px 以下页脚内容上下排列。

### 案例卡

固定阅读顺序：**场景图 → 案例名 → 一句价值说明 → 一段工作方式 → 主次入口 → 可获取材料 → 作者与许可**。同级卡片共用 `assets/community-cards.css` 的 `.case-feature` 组件；不要复制后改成独立样式。首页分组标题使用 h2，卡片名使用 h3；获奖项目在作者区用普通文字标明奖项，不新增装饰徽章。不要把内部测试数量、核查日期和状态作为案例卡内容。

主入口按真实资源命名，例如 `Watch demo` 或 `Try demo`；次入口统一为 `Explore the case`，进入该案例详情。素材类型不同可以改变按钮文字，同一层级的外观、间距和位置保持一致。卡片本身不做整块链接，以免与两个操作嵌套。

### 场景图与素材

当前案例使用同一视觉语言的概念插画：柔和的场景模型、清楚的业务主体、少量黄蓝点缀。插画表达任务场景；不能当作真实产品截图或通话证明。替换成真实截图时保留相近裁切、视觉重量和清晰度，必要时加说明。

不复用 Apple 的品牌标识、产品图或专有字体文件。真实素材记录来源和使用许可；生成插画的替代文本说明其场景，承载信息的截图需要可理解的文字说明。声明图片尺寸或宽高比；首屏主图及时加载，后续图片按需加载。

### 详情开场与导航

案例详情顶栏只保留 CALL-E 标识和返回案例列表的普通文字链接，最小高度 64px。Docs 和 Dashboard 使用页尾链接，不在详情顶栏设置额外主按钮。

正文以案例名作为主标题，用途句并入简介并适当加重，随后保留作者、一个主要体验入口、一个辅助入口和必要说明。来源仓库放在需要它的位置，读者不必先读源码才能理解案例。

Conversation-Clarify、Care Call AI、RingBack 和 HungryCall 将原生 3D 场景与操作合为一个流程，章节入口使用 Try the 3D flow 和 Try it；专有 Care Call AI 的最后一个入口用 Explore，避免暗示代码可自由复用。Local Atlas 保留旁白播放器与下方独立 mock，入口仍为 Watch the flow、Try the mock、Build your own。各页沿用暖白、黄蓝和微缩场景风格，关键文字由浏览器渲染。独立编写的流程模拟应明确区别于作者应用，不将简化模拟描述为完整产品实现。目录使用普通文档流、无底色的文字链接，不重复案例名、不固定悬浮；桌面和手机的锚点间距均为 24px。已有直接锚点继续可用；evidence 锚点指向统一场景操作区或 Local Atlas 的独立 mock。返回列表、章节跳转和页尾入口都必须能用键盘完成。

### 原生流程场景

四个交互案例复用 `assets/scene-kit.mjs` 中从 RingBack 提取的人物、电话握持、造型组件与渲染器，保留哑光微缩场景质感；各自的空间、道具和动作表达业务差异。Conversation-Clarify 从办公桌转向接听者，再回到待审草稿；Care Call AI 将同日两次通话的请求留在同一剪贴板上，整份交给协调人员；RingBack 将接受候补的预约纸条放入日历；HungryCall 沿餐厅街逐家确认价格与配送，首个匹配后停止，只展示匹配记录，不演出下单或送达。

动作由业务状态和该阶段经过的时间求值，同一状态、时间与视口应得到一致姿态；重启恢复初始状态。人物电话随握持关节移动，记录沿有净空的路径转移；不能穿过人物、桌子或已保存的记录。测试检查电话与头部、记录与人物的几何间隔，以及视口与面板边界；视觉检查仍需覆盖镜头投影遮挡、移动中间帧及窄屏构图。

三个新增交互场景共用 `assets/case-demos/data.mjs` 的状态转换和 `demo.mjs` 的原生控制器，`stories.mjs` 保留各自的空间与动作，`scene.mjs` 只挂载共享渲染器。手动选择和闲置默认动作进入同一状态转换；输入只重置闲置倒计时，不重置动画时钟。Pause auto 暂停自动推进，Start over 重启；离屏或页面隐藏时停止推进与动画。减少动态效果时使用阶段完成姿态，自动推进默认暂停；WebGL 不可用时保留同一组原生操作与结果。

这三个场景的地点和标题在画布上方按普通文档流排列，不能覆盖人物或道具。桌面侧边面板分别采用邮件、剪贴板和收据的内容形式；HungryCall 的开场条件面板位于场景底部。900px 以下统一为上方 360px 画布、下方操作区，至少 44px 的操作目标和键盘焦点持续可见。原有 Jenny 旁白保留在 Listen to the short overview 折叠项内，用原生音频控件单独播放并附原稿；它只介绍默认示例，不与交互分支同步。Local Atlas 继续使用原来的同步旁白与播放器。

RingBack 的交互演示将 3D 场景与操作合为一个流程：同一份状态驱动日历、通话回答和候补名单。原生按钮放在场景面板内，不设播放器、时间轴或下方独立 mock。不操作时按倒计时推进默认路径；真实鼠标移动、点击、按键和滚动重新计时，静止悬停和保留焦点不阻止推进。主动暂停或页面不可见时才暂停，完成后停在结果。用户可尝试明确接受、回答不明确和保存时冲突。接听动作以听筒贴耳、屏幕朝内和握持接触为约束，用固定长度的双骨关节求解抬手；同时检查姿势是否成立及是否穿模。场景进场用短镜头变化，操作期间保持稳定；店员用复用步态走到前台，接听保留持续的小幅动作，保存成功后预约纸条落入实体日历。操作面板缩至侧边，900px 以下改为上方 360px 场景、下方操作。可见时随屏幕刷新更新画面，输入只重置闲置倒计时，不重置动画时钟；减少动态效果时只在状态变化时更新画面，离屏停止场景与 CSS 动画；WebGL 不可用时同一组操作仍能使用。

### 交互场景验收标准

2026-10-28，用户认可 RingBack 当前的场景、交互和流畅度，将其作为后续案例的基线。Conversation-Clarify、Care Call AI 和 HungryCall 已按这一基线完成本地交互改版；本地验证不等于用户逐项验收或已经发布。后续案例继续采用以下标准。

- 用人物、环境和实际业务动作讲完整过程；保留有用途的家具、道具和空间层次。操作面板不能遮住主要动作，也不能让场景只剩文字切换。复用现有造型和关节组件，再补案例所需的动作。
- 手动操作与闲置自动推进共用同一份状态。用户随时可以接管，停止操作后继续展示，完整走到结果；接受、拒绝、不确定和冲突按具体业务处理，不用模拟结果冒充真实履约。
- 电话听筒贴耳、屏幕朝内、手掌有握持接触，手臂长度固定；人物、道具、文字和转移记录不能穿模或遮挡关键主体。镜头帮助理解流程，做选择时保持稳定。
- 桌面用紧凑的侧边操作区；窄屏优先保留当前动作主体，将操作放到场景下方。保留至少 44px 的操作目标、键盘焦点、减少动态效果和无 WebGL 回退。
- 性能修改先做同设备、同视口、同像素比的前后测量。当前桌面 60Hz 环境以接近 60fps、画面更新间隔约 16.7ms 为参考；不以删除关键动效或降低画质替代卡顿修复。输入只重置闲置倒计时，不能冻结动画时钟；离屏停止动画。
- 交付前验证默认完整流程、关键分支、重启、闲置恢复和响应式布局；报告实测环境和未覆盖设备。桌面浏览器的帧率不代表手机真机、其他浏览器或所有屏幕都已达标。

### 操作与反馈

交互目标至少 44px 高，图标独立操作至少 44×44px；详情主按钮最小高度 46px。普通状态、悬停和键盘焦点都要清楚；案例卡和详情页焦点使用 3px 蓝色轮廓并留 4px 间距。辅助链接通过蓝色和悬停下划线识别。

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

三个新增交互场景使用官方 CALL-E SVG，在原生操作面板底部与模拟通话次数一起显示；RingBack 保留现有通话与候补状态中的标识。品牌说明不能遮挡人物、道具或操作，不再要求把标识做成场景中的连线节点或移动记录。
