# sdonfint.github.io

一个可长期维护、可视化编辑的个人 GitHub Pages 主页。

## 你现在拥有的能力

- 一个已经可运行的主页：[index.html](index.html)
- 一个可视化编辑器：[admin.html](admin.html)
- 一个统一内容源：[content/site.json](content/site.json)

主页会自动读取 `content/site.json`，你无需修改 HTML/CSS。

## 设计调研与方案依据

本仓库参考了多个优秀个人主页的共同模式：

- **Karpathy 风格**：内容密度高、时间线清晰、项目和写作可持续积累。
- **Rauch 风格**：极简结构但信息组织非常稳定，长期可维护。
- **Sindre 风格**：个人定位明确，社交和项目入口一眼可见。
- **Paul Graham 风格**：内容价值优先，视觉简单也能长期有效。

结合这些模式，本主页采用：

- 数据驱动：页面只负责展示，内容全部放在 JSON。
- 四大模块：About / Projects / Timeline / Writing。
- Now 区块：持续更新你当前在做的事，增强主页“活性”。

## 最简单的维护方式（推荐）

### 方式 A：可视化编辑（不会写代码也能用）

1. 打开 `admin.html`。
2. 在页面里直接填写信息。
3. 点击 `下载 JSON`：会得到 `site.json`。
4. 在 GitHub 仓库里把 `content/site.json` 替换为新文件并提交。

### 方式 B：一键发布到 GitHub（仍在编辑器内）

1. 在 `admin.html` 的发布设置里填写：
	- Owner：你的 GitHub 用户名
	- Repo：`sdonfint.github.io`
	- Branch：通常是 `main`
	- Token：你的 GitHub Personal Access Token
2. 点击 `发布到 GitHub`。
3. 等待 GitHub Pages 自动更新（通常几十秒到几分钟）。

> Token 仅在当前页面内存中使用，不会自动写入仓库文件。

## 文件说明

- `index.html`: 主页结构
- `styles.css`: 主页和编辑器共用样式
- `app.js`: 主页渲染逻辑（读取 JSON）
- `admin.html`: 可视化编辑器页面
- `admin.js`: 编辑器逻辑（表单、下载、发布）
- `content/site.json`: 你的内容数据库

## 后续扩展建议

- 增加 `content/posts/` 目录，做文章详情页。
- 接入独立域名（例如 `yourname.com`）。
- 在编辑器中加入头像上传与主题切换。
