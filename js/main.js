/* ============================================================
   PERSONAL PORTFOLIO — v4
   博客地图已移至单独的 blog-map.js 文件
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  function getSiteBasePath() {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (!parts.length) return '/';
    const last = parts[parts.length - 1];
    if (/\.[a-z0-9]+$/i.test(last)) parts.pop();
    return '/' + (parts.length ? parts.join('/') + '/' : '');
  }

  const SITE_BASE_PATH = getSiteBasePath();

  function resolveSitePath(path) {
    if (!path) return path;
    if (/^(?:[a-z]+:)?\/\//i.test(path)) return path;
    if (/^(?:data:|mailto:|tel:|#)/i.test(path)) return path;
    const normalized = path.replace(/^\.?\//, '').replace(/^\//, '');
    return SITE_BASE_PATH + normalized;
  }

  function resolveMarkdownAssetPath(assetPath, markdownPath) {
    if (!assetPath) return assetPath;
    if (/^(?:[a-z]+:)?\/\//i.test(assetPath)) return assetPath;
    if (/^(?:data:|mailto:|tel:|#)/i.test(assetPath)) return assetPath;
    if (assetPath.startsWith('/')) return resolveSitePath(assetPath);

    const baseDir = (markdownPath || '').replace(/[^/]*$/, '');
    const baseUrl = new URL(resolveSitePath(baseDir), window.location.origin);
    const resolved = new URL(assetPath, baseUrl);
    return resolved.pathname + resolved.search + resolved.hash;
  }

  const landing       = document.getElementById('landing');
  const mainInterface = document.getElementById('mainInterface');
  const enterBtn      = document.getElementById('enterBtn');
  const backBtn       = document.getElementById('backBtn');
  const tabBtns       = document.querySelectorAll('.tab-btn');
  const tabPanels     = document.querySelectorAll('.tab-panel');
  const meshCanvas    = document.getElementById('meshCanvas');

  const aboutMarkdownPreview = document.getElementById('aboutMarkdownPreview');
  const blogMarkdownPreview = document.getElementById('blogMarkdownPreview');
  const blogMarkdownToc = document.getElementById('blogMarkdownToc');
  const blogPostModal = document.getElementById('blogPostModal');
  const blogPostModalBackdrop = document.getElementById('blogPostModalBackdrop');
  const blogPostClose = document.getElementById('blogPostClose');
  const blogPostTitle = document.getElementById('blogPostTitle');
  const mdImageModal = document.getElementById('mdImageModal');
  const mdImageModalBackdrop = document.getElementById('mdImageModalBackdrop');
  const mdImageModalClose = document.getElementById('mdImageModalClose');
  const mdImageModalImg = document.getElementById('mdImageModalImg');

  /* ===========================================================
     1. MESH GRADIENT (Landing page)
     =========================================================== */
  function initMeshGradient() {
    if (!meshCanvas) return;
    const ctx = meshCanvas.getContext('2d');
    let w, h, animId;
    const blobs = [
      { x:.15, y:.3,  r:.45, c:[26,21,32],  vx: .0003, vy: .0002 },
      { x:.4,  y:.6,  r:.5,  c:[15,18,30],  vx:-.0002, vy: .0003 },
      { x:.7,  y:.2,  r:.4,  c:[20,15,25],  vx: .0002, vy:-.0001 },
      { x:.3,  y:.8,  r:.35, c:[25,20,15],  vx:-.0001, vy:-.0002 },
      { x:.85, y:.5,  r:.5,  c:[10,10,15],  vx: .0001, vy: .0002 },
      { x:.5,  y:.4,  r:.3,  c:[30,22,18],  vx:-.0003, vy: .0001 },
    ];
    function resize() {
      const r = meshCanvas.getBoundingClientRect();
      w = meshCanvas.width = r.width * devicePixelRatio;
      h = meshCanvas.height = r.height * devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    }
    function render() {
      const cw=w/devicePixelRatio,ch=h/devicePixelRatio;
      const img=ctx.createImageData(w,h);const d=img.data;const dpr=devicePixelRatio;const step=3;
      for(let py=0;py<h;py+=step){for(let px=0;px<w;px+=step){
        const nx=(px/dpr)/cw,ny=(py/dpr)/ch;let r=10,g=10,b=15;
        for(const bl of blobs){const dx=nx-bl.x,dy=ny-bl.y;const wt=Math.exp(-(dx*dx+dy*dy)/(2*bl.r*bl.r));r+=bl.c[0]*wt;g+=bl.c[1]*wt;b+=bl.c[2]*wt}
        const af=Math.min(1,Math.max(0,(nx-.05)/.45));const alpha=Math.round((1/(1+Math.exp(-12*(af-.5))))*255);
        for(let sy=0;sy<step&&py+sy<h;sy++){for(let sx=0;sx<step&&px+sx<w;sx++){
          const i=((py+sy)*w+(px+sx))*4;d[i]=Math.min(255,Math.round(r));d[i+1]=Math.min(255,Math.round(g));d[i+2]=Math.min(255,Math.round(b));d[i+3]=alpha}}
      }}
      ctx.putImageData(img,0,0);
      for(const bl of blobs){bl.x+=bl.vx;bl.y+=bl.vy;if(bl.x<-.1||bl.x>1.1)bl.vx*=-1;if(bl.y<-.1||bl.y>1.1)bl.vy*=-1}
      animId=requestAnimationFrame(render);
    }
    resize(); render();
    window.addEventListener('resize',()=>{cancelAnimationFrame(animId);resize();render()});
  }
  initMeshGradient();

  /* ===========================================================
     1.2 IMAGE RESOLVER (multi-format)
     =========================================================== */
  const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const IMAGE_CACHE_BUSTER = String(Date.now());

  function hasFileExtension(path) {
    return /\.[a-zA-Z0-9]+$/.test(path);
  }

  function buildImageCandidates(basePath) {
    if (!basePath) return [];
    if (hasFileExtension(basePath)) return [resolveSitePath(basePath)];
    return IMAGE_EXTS.map((ext) => resolveSitePath(basePath + '.' + ext));
  }

  function withCacheBuster(path) {
    const sep = path.includes('?') ? '&' : '?';
    return path + sep + 'v=' + IMAGE_CACHE_BUSTER;
  }

  function canLoadImage(path) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = path;
    });
  }

  async function resolveFirstImage(basePath) {
    const candidates = buildImageCandidates(basePath);
    for (const candidate of candidates) {
      const busted = withCacheBuster(candidate);
      if (await canLoadImage(busted)) return busted;
    }
    return '';
  }

  async function initDynamicImages() {
    const bgEls = Array.from(document.querySelectorAll('[data-image-base]'));
    for (const bgEl of bgEls) {
      const base = bgEl.dataset.imageBase || '';
      const src = await resolveFirstImage(base);
      if (src) {
        bgEl.style.backgroundImage = "url('" + src + "')";
        bgEl.classList.add('has-image');
      }
    }
  }

  initDynamicImages();

  /* ===========================================================
     1.5 MARKDOWN PREVIEW
     =========================================================== */
  const defaultAboutMarkdown = [
    '# 你好，我是你的名字',
    '',
    '未能加载 `about.md`，当前显示的是默认简介。',
    '',
    '你可以直接编辑根目录的 `about.md` 并刷新页面。'
  ].join('\n');

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderMarkdown(mdText) {
    if (window.marked && typeof window.marked.parse === 'function') {
      return window.marked.parse(mdText);
    }
    return '<pre><code>' + escapeHtml(mdText) + '</code></pre>';
  }

  function makeHeadingId(text, usedIds) {
    const base = String(text || '')
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-') || 'section';

    let id = base;
    let idx = 2;
    while (usedIds.has(id)) {
      id = base + '-' + idx;
      idx += 1;
    }
    usedIds.add(id);
    return id;
  }

  function applyCodeHighlight(container) {
    if (!container || !window.hljs || typeof window.hljs.highlightElement !== 'function') return;
    container.querySelectorAll('pre code').forEach((codeEl) => {
      window.hljs.highlightElement(codeEl);
    });
  }

  function renderMarkdownInto(previewEl, tocEl, mdText) {
    if (!previewEl) return;
    previewEl.innerHTML = renderMarkdown(mdText);

    const usedIds = new Set();
    const headings = Array.from(previewEl.querySelectorAll('h1, h2, h3'));
    headings.forEach((heading) => {
      if (!heading.id) {
        heading.id = makeHeadingId(heading.textContent, usedIds);
      } else {
        usedIds.add(heading.id);
      }
    });

    applyCodeHighlight(previewEl);

    if (!tocEl) return;
    tocEl.innerHTML = '';

    const tocTitle = document.createElement('div');
    tocTitle.className = 'markdown-toc-title';
    tocTitle.textContent = '目录';
    tocEl.appendChild(tocTitle);

    if (!headings.length) {
      const empty = document.createElement('div');
      empty.className = 'toc-empty';
      empty.textContent = '该文档没有可跳转标题';
      tocEl.appendChild(empty);
      return;
    }

    headings.forEach((heading, index) => {
      const link = document.createElement('a');
      const level = Number(heading.tagName.slice(1));
      link.className = 'toc-link toc-level-' + level;
      link.href = '#' + heading.id;
      link.textContent = heading.textContent || ('章节 ' + (index + 1));
      link.addEventListener('click', (e) => {
        e.preventDefault();
        heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        tocEl.querySelectorAll('.toc-link').forEach((el) => el.classList.remove('active'));
        link.classList.add('active');
      });
      tocEl.appendChild(link);
    });
  }

  function rewriteMarkdownAssetLinks(container, markdownPath) {
    if (!container) return;

    container.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const resolved = resolveMarkdownAssetPath(src, markdownPath);
      if (resolved && resolved !== src) img.setAttribute('src', resolved);
    });

    container.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const resolved = resolveMarkdownAssetPath(href, markdownPath);
      if (resolved && resolved !== href) link.setAttribute('href', resolved);
    });
  }

  function setActiveBlogNode(node) {
    const nodes = document.querySelectorAll('#blogMap .blog-node');
    nodes.forEach((n) => n.classList.remove('active'));
    if (node) node.classList.add('active');
  }

  function openBlogPostModal() {
    if (!blogPostModal) return;
    blogPostModal.classList.add('visible');
    blogPostModal.setAttribute('aria-hidden', 'false');
  }

  function closeBlogPostModal() {
    if (!blogPostModal) return;
    blogPostModal.classList.remove('visible');
    blogPostModal.setAttribute('aria-hidden', 'true');
  }

  function openMarkdownImageModal(src, altText) {
    if (!mdImageModal || !mdImageModalImg || !src) return;
    mdImageModalImg.src = src;
    mdImageModalImg.alt = altText || 'Markdown image preview';
    mdImageModal.classList.add('visible');
    mdImageModal.setAttribute('aria-hidden', 'false');
  }

  function closeMarkdownImageModal() {
    if (!mdImageModal || !mdImageModalImg) return;
    mdImageModal.classList.remove('visible');
    mdImageModal.setAttribute('aria-hidden', 'true');
    mdImageModalImg.removeAttribute('src');
  }

  function initMarkdownImageLightbox() {
    document.addEventListener('click', (e) => {
      const img = e.target.closest('.markdown-preview img');
      if (!img) return;
      e.preventDefault();
      openMarkdownImageModal(img.currentSrc || img.src, img.alt || 'Markdown image preview');
    });

    if (mdImageModalBackdrop) {
      mdImageModalBackdrop.addEventListener('click', () => closeMarkdownImageModal());
    }

    if (mdImageModalClose) {
      mdImageModalClose.addEventListener('click', () => closeMarkdownImageModal());
    }
  }

  function loadBlogPostFromPath(path, displayName, activeNode) {
    if (!path || !blogMarkdownPreview) return;

    const resolvedPath = resolveSitePath(path);

    fetch(resolvedPath, { cache: 'no-cache' })
      .then((resp) => {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then((content) => {
        renderMarkdownInto(blogMarkdownPreview, blogMarkdownToc, content);
        rewriteMarkdownAssetLinks(blogMarkdownPreview, path);
        if (blogPostTitle) blogPostTitle.textContent = displayName;
        setActiveBlogNode(activeNode || null);
        openBlogPostModal();
      })
      .catch(() => {
        const fallback = [
          '# 文档加载失败',
          '',
          '无法读取：`' + resolvedPath + '`',
          '',
          '- 请确认该 Markdown 文件存在。',
          '- 如果你正在使用 file:// 直接打开页面，请改为本地静态服务器或 GitHub Pages 访问。'
        ].join('\n');
        renderMarkdownInto(blogMarkdownPreview, blogMarkdownToc, fallback);
        if (blogPostTitle) blogPostTitle.textContent = displayName;
        openBlogPostModal();
      });
  }

  function initBlogNodeMarkdownBinding() {
    const nodes = Array.from(document.querySelectorAll('#blogMap .blog-node[data-md]'));
    if (!nodes.length) return;

    nodes.forEach((node) => {
      const mdPath = node.dataset.md;
      const title = (node.querySelector('.node-popup h3') || node.querySelector('.node-label'))?.textContent || mdPath;
      const bindOpen = (el) => {
        if (!el) return;
        el.addEventListener('click', (e) => {
          e.preventDefault();
          loadBlogPostFromPath(mdPath, title, node);
        });
      };

      bindOpen(node);
      bindOpen(node.querySelector('.node-popup a'));
    });

    if (blogPostClose) {
      blogPostClose.addEventListener('click', () => closeBlogPostModal());
    }

    if (blogPostModalBackdrop) {
      blogPostModalBackdrop.addEventListener('click', () => closeBlogPostModal());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeBlogPostModal();
        closeMarkdownImageModal();
      }
    });
  }

  function initMarkdownViews() {
    if (aboutMarkdownPreview) {
      const aboutPath = resolveSitePath('about.md');
      fetch(aboutPath, { cache: 'no-cache' })
        .then((resp) => {
          if (!resp.ok) throw new Error('HTTP ' + resp.status);
          return resp.text();
        })
        .then((content) => {
          renderMarkdownInto(aboutMarkdownPreview, null, content);
          rewriteMarkdownAssetLinks(aboutMarkdownPreview, 'about.md');
        })
        .catch(() => {
          renderMarkdownInto(aboutMarkdownPreview, null, defaultAboutMarkdown);
        });
    }

    initBlogNodeMarkdownBinding();
  }

  initMarkdownViews();
  initMarkdownImageLightbox();

  /* ===========================================================
     2. PARTICLES
     =========================================================== */
  (function() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random()*100+'%';
      p.style.top  = Math.random()*100+'%';
      p.style.setProperty('--dx', (Math.random()*60-30)+'px');
      p.style.setProperty('--dy', (Math.random()*-80-20)+'px');
      p.style.setProperty('--duration', (6+Math.random()*8)+'s');
      p.style.setProperty('--delay', (Math.random()*10)+'s');
      const s = (1+Math.random()*2)+'px';
      p.style.width = s; p.style.height = s;
      c.appendChild(p);
    }
  })();

  /* ===========================================================
     3. TRANSITIONS & TABS
     =========================================================== */
  enterBtn.addEventListener('click', () => {
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      mainInterface.classList.remove('hidden');
      mainInterface.classList.add('visible');
    }, 600);
  });

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      closeBlogPostModal();
      closeMarkdownImageModal();
      mainInterface.classList.remove('visible');
      mainInterface.classList.add('hidden');
      setTimeout(() => { landing.style.display = 'flex'; landing.classList.remove('exit'); }, 500);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
      if (targetId !== 'panelBlog') closeBlogPostModal();
      closeMarkdownImageModal();
    });
  });

  // 简单的进入动画
  function animAS() {
    const els = mainInterface.querySelectorAll('.about-section, .project-card, .category-group');
    els.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      setTimeout(() => {
        el.style.transition = 'all .5s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + i * 50);
    });
  }

  /* ===========================================================
     4. BLOG SCROLL & DRAG (保留)
     =========================================================== */
  const blogScroll = document.getElementById('blogMapScroll');
  if (blogScroll) {
    let wheelTargetX = blogScroll.scrollLeft;
    let wheelRafId = 0;

    function clampScrollX(x) {
      const max = Math.max(0, blogScroll.scrollWidth - blogScroll.clientWidth);
      return Math.max(0, Math.min(max, x));
    }

    function stopWheelAnim() {
      if (!wheelRafId) return;
      cancelAnimationFrame(wheelRafId);
      wheelRafId = 0;
    }

    function runWheelAnim() {
      const diff = wheelTargetX - blogScroll.scrollLeft;
      if (Math.abs(diff) < 0.6) {
        blogScroll.scrollLeft = wheelTargetX;
        wheelRafId = 0;
        return;
      }

      blogScroll.scrollLeft += diff * 0.18;
      wheelRafId = requestAnimationFrame(runWheelAnim);
    }

    // 滚轮 → 水平滚动
    blogScroll.addEventListener('wheel', e => {
      const panel = document.getElementById('panelBlog');
      if (!panel || !panel.classList.contains('active')) return;
      e.preventDefault();

      const dominantDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelTargetX = clampScrollX(wheelTargetX + dominantDelta * 1.28);

      if (!wheelRafId) {
        wheelRafId = requestAnimationFrame(runWheelAnim);
      }
    }, { passive: false });

    // 拖拽滚动
    let dragging = false, sx, ss;
    blogScroll.addEventListener('mousedown', e => {
      if (e.target.closest('a')) return;
      stopWheelAnim();
      dragging = true; sx = e.clientX; ss = blogScroll.scrollLeft; e.preventDefault();
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      blogScroll.scrollLeft = ss - (e.clientX - sx);
      wheelTargetX = clampScrollX(blogScroll.scrollLeft);
    });
    window.addEventListener('mouseup', () => {
      dragging = false;
      wheelTargetX = clampScrollX(blogScroll.scrollLeft);
    });
    blogScroll.addEventListener('touchstart', e => {
      stopWheelAnim();
      sx = e.touches[0].clientX;
      ss = blogScroll.scrollLeft;
    }, { passive: true });
    blogScroll.addEventListener('touchmove', e => {
      blogScroll.scrollLeft = ss - (e.touches[0].clientX - sx);
      wheelTargetX = clampScrollX(blogScroll.scrollLeft);
    }, { passive: true });
  }

  /* ===========================================================
     5. CATEGORY PANEL (保留)
     =========================================================== */
  function initCategoryPanel() {
    const map = document.getElementById('blogMap');
    if (!map) return;
    const nodes = Array.from(map.querySelectorAll('.blog-node'));
    if (!nodes.length) return;
    
    const container = document.getElementById('categoryList');
    if (!container) return;
    container.innerHTML = '';

    const groups = {};
    nodes.forEach((node, i) => {
      const tag = node.dataset.tag || '未分类';
      if (!groups[tag]) groups[tag] = [];
      const title = node.querySelector('.node-popup h3');
      const label = node.querySelector('.node-label');
      const displayTitle = title ? title.textContent : label ? label.textContent : `节点 ${i}`;
      groups[tag].push({
        title: displayTitle,
        index: i,
        mdPath: node.dataset.md || '',
        node: node
      });
    });

    Object.keys(groups).forEach(tag => {
      const group = document.createElement('div');
      group.className = 'category-group';

      const groupTitle = document.createElement('div');
      groupTitle.className = 'category-group-title';
      groupTitle.textContent = tag + ` (${groups[tag].length})`;
      group.appendChild(groupTitle);

      groups[tag].forEach(item => {
        const link = document.createElement('div');
        link.className = 'category-item';
        link.textContent = item.title;
        link.addEventListener('click', () => {
          const scroll = document.getElementById('blogMapScroll');
          if (!scroll) return;
          const colSpacing = 50;
          const padLeft = 80;
          const cycleGap = 80;
          const wavePatternLen = 5;
          
          let currentX = padLeft;
          for (let i = 0; i < item.index; i++) {
            const waveIndex = i % wavePatternLen;
            if (waveIndex === wavePatternLen - 1) {
              currentX += colSpacing + cycleGap;
            } else {
              currentX += colSpacing;
            }
          }
          
          const targetX = currentX - scroll.clientWidth / 2;
          scroll.scrollTo({ left: Math.max(0, targetX), behavior: 'smooth' });

          if (item.mdPath) {
            loadBlogPostFromPath(item.mdPath, item.title, item.node || null);
          }
        });
        group.appendChild(link);
      });

      container.appendChild(group);
    });
  }
  
  initCategoryPanel();

});
