# 个人主页 — GitHub Pages

暗色电影风格个人主页，博客界面采用心电图式单线折线自动布局。

## 快速开始

1. 将仓库命名为 `yourusername.github.io`（用户主页）或使用普通仓库名（项目主页）。
2. 推送到 GitHub。
3. 进入仓库 `Settings -> Pages`，选择发布分支（通常是 `main`）和目录（`/(root)`）。
4. 等待 Pages 构建完成后访问站点。

## 上线前必改项

- `index.html` 中的站点标题、描述、`og:url`、`canonical`。
- `index.html` 中的 `og:image` 与 `twitter:image`。
- `sitemap.xml` 和 `robots.txt` 里的域名。
- 页面中的占位内容（姓名、简介、联系方式、项目链接、博客链接）。

## 路径规范（推荐）

为避免 GitHub Pages 在不同部署场景（用户主页/项目主页）出现资源加载失败，建议遵循：

- 站内静态资源统一使用相对路径：`css/style.css`、`js/main.js`、`images/xxx.jpg`。
- Markdown 文件引用图片或附件时，优先使用相对当前 Markdown 文件的路径。
- 避免写死以 `/` 开头的站内路径（如 `/images/a.png`），项目主页场景下容易 404。
- SEO 元标签（`canonical`、`og:url`、`og:image`）保留绝对地址，方便搜索引擎与社交平台抓取。

示例（Markdown 内图片）：

```md
![架构图](../images/diagram.png)
```

示例（Markdown 内同目录附件）：

```md
[下载文档](./notes.pdf)
```

## 设置背景图

三个面板和首页都支持背景图。在 `index.html` 中找到对应的 `.panel-bg` 或 `.landing-image`，在 `style` 属性中写入：

```html
<div class="panel-bg" style="background-image: url('images/blog-bg.jpg');"></div>
```

## 添加博客文章

博客界面是心电图单线折线布局。**只需在列表末尾追加节点，折线自动延伸。**

在 `#blogMap` 末尾复制一个 `.blog-node` 块：

```html
<div class="blog-node" data-tag="分类标签" data-href="文章链接">
  <div class="node-hex"></div>
  <div class="node-badge">OPERATION</div>
  <div class="node-label">显示名称</div>
  <div class="node-popup">
    <h3>文章标题</h3>
    <p>简短摘要</p>
    <a href="文章链接">阅读 »</a>
  </div>
</div>
```

节点位置完全自动计算，按心电图波形（中→中→上→中→下→中→上→中→下→…）排列。右侧分类面板也会根据 `data-tag` 自动更新。

## 调整波形

在 `js/blog-map.js` 顶部修改：

```js
const CFG = {
  colSpacing: 50,
  padLeft: 80,
  padRight: 120,
  cycleGap: 80,
  topMargin: 0.18,
  bottomMargin: 0.18,
  wave: [0.5, 0.15, 0.5, 0.85, 0.5]
};
```

## 本地预览建议

建议使用本地静态服务器，而不是直接双击打开 `index.html`：

```powershell
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/`。
