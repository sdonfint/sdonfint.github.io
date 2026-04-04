# 个人主页 — GitHub Pages

暗色电影风格个人主页，博客界面采用心电图式单线折线自动布局。

## 快速开始

推送至 `yourusername.github.io` 仓库，启用 GitHub Pages 即可。

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

在 `js/main.js` 顶部修改：

```js
const ECG_CYCLE = [0.20, 0.50, 0.80, 0.50]; // 上→中→下→中 循环
const COL_SPACING = 240; // 节点水平间距
```
