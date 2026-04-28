# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

sdonfint 的个人主页/博客网站，部署于 GitHub Pages。核心特色是**心电图式单线折线博客地图**。

## 本地预览

```powershell
python -m http.server 4173
```
然后访问 `http://127.0.0.1:4173/`

## 部署

推送到 `main` 分支后，GitHub Actions 自动部署到 GitHub Pages。有两套 workflow：
- `static.yml` — 当前激活，直接上传所有静态文件
- `jekyll-gh-pages.yml` — Jekyll 静态站点构建（未激活）

## 添加博客文章

在 `index.html` 的 `#blogMap` 末尾末尾添加节点，折线和位置**自动计算**：

```html
<div class="blog-node" data-tag="分类标签" data-href="#" data-md="blog-posts/xx.md">
  <div class="node-hex"></div>
  <div class="node-badge">OPERATION</div>
  <div class="node-label">N</div>
  <div class="node-popup">
    <h3>文章标题</h3>
    <p>简短摘要</p>
    <a href="#">阅读 »</a>
  </div>
</div>
```

`data-md` 指向 Markdown 文件路径（相对路径）。文章实际内容放在 `blog-posts/` 目录。

## 调整心电图波形

在 `js/blog-map.js` 顶部修改 `CFG`：

```js
const CFG = {
  wave: [0.5, 0.15, 0.5, 0.85, 0.5]  // 波形位置（0=顶，1=底）
};
```

## 主题与样式

- 亮/暗/跟随系统三模式在 `index.html` 的 `.theme-mode-switch` 中切换
- 主题色（默认 `#c8a56`）通过 `.theme-accent-picker` 选择
- 样式集中在 `css/style.css`

## 资源路径规范

- 站内资源统一使用**相对路径**：`css/style.css`、`js/main.js`、`images/xxx.jpg`
- 避免使用以 `/` 开头的绝对路径（项目主页场景下会 404）
- SEO 元标签（`canonical`、`og:url`）保留绝对地址
