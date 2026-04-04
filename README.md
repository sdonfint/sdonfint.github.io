# 个人主页 - GitHub Pages

一个暗色系电影风格的个人主页，灵感来源于游戏 UI 设计。

## 目录结构

```
├── index.html          ← 主页面（修改个人信息、文章、项目）
├── css/
│   └── style.css       ← 样式文件（修改颜色、字体等）
├── js/
│   └── main.js         ← 交互逻辑（一般不需要修改）
├── images/             ← 放置图片资源
└── README.md
```

## 快速开始

1. 将此文件夹推送到 GitHub 仓库（仓库名为 `yourusername.github.io`）
2. 在 GitHub 仓库的 Settings → Pages 中启用 GitHub Pages
3. 访问 `https://yourusername.github.io` 即可

## 如何修改内容

### 修改个人信息

打开 `index.html`，搜索以下内容并替换：

- **首页名字**：搜索 `你的名字`
- **首页副标题**：搜索 `Developer / Designer / Creator`
- **首页简介**：搜索 `在这里写下你的个人简介`
- **详细介绍**：搜索 `个人简介` 区块中的文字
- **技能标签**：搜索 `skill-tag`，添加或删除标签
- **教育经历**：搜索 `timeline-item`，添加或修改条目
- **联系方式**：搜索 `contact-item`，修改邮箱和链接

### 添加新文章

在 `index.html` 中找到 `panelBlog` 区域，复制一个 `.blog-card` 块：

```html
<div class="blog-card size-2" style="--card-bg: linear-gradient(135deg, #1a1a2e, #0d0d1f);">
  <div class="blog-card-inner">
    <span class="blog-card-tag">标签</span>
    <h3 class="blog-card-title">文章标题</h3>
    <p class="blog-card-excerpt">文章摘要……</p>
    <div class="blog-card-meta">
      <span>2026-04-01</span>
      <a href="你的文章链接" class="blog-card-link">阅读 →</a>
    </div>
  </div>
</div>
```

**卡片尺寸**：`size-1`（小）、`size-2`（中）、`size-3`（大）
**卡片颜色**：修改 `--card-bg` 的渐变色值

### 添加新项目

在 `panelProjects` 区域复制一个 `.project-card` 块：

```html
<a href="https://github.com/你的链接" target="_blank" class="project-card">
  <div class="project-card-header">
    <span class="project-icon">📦</span>
    <span class="project-lang">语言</span>
  </div>
  <h3 class="project-name">项目名</h3>
  <p class="project-desc">项目描述</p>
  <div class="project-stats">
    <span>⭐ 数量</span>
    <span>🔀 数量</span>
  </div>
</a>
```

### 修改背景图片

1. 将图片放入 `images/` 文件夹
2. 在 `css/style.css` 中搜索对应注释：
   - **首页背景**：搜索 `替换你的主图`，取消注释 `background-image` 行
   - **About 头图**：搜索 `替换 About 头图`

### 修改主题色

在 `css/style.css` 顶部的 `:root` 中修改 CSS 变量：

- `--accent`：主强调色（默认暖金色 `#c8a882`）
- `--bg-primary`：主背景色
- `--text-primary`：主文字色

## 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yourusername.github.io.git
git push -u origin main
```

确保在仓库 Settings → Pages 中选择 `main` 分支作为部署源。
