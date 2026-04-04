/* ============================================================
   PERSONAL PORTFOLIO — v4
   Single ECG polyline + auto layout + category panel
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  const landing       = document.getElementById('landing');
  const mainInterface = document.getElementById('mainInterface');
  const enterBtn      = document.getElementById('enterBtn');
  const backBtn       = document.getElementById('backBtn');
  const tabBtns       = document.querySelectorAll('.tab-btn');
  const tabPanels     = document.querySelectorAll('.tab-panel');
  const meshCanvas    = document.getElementById('meshCanvas');

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
     2. BLOG MAP — 心电图单线折线自动布局
     =========================================================== */

  /*
    心电图 Y 坐标模式（占视口高度的比例）：
    起始两个节点在中线，然后循环：上 → 中 → 下 → 中 → 上 → 中 → 下 → 中 ...
    这样折线在中线上下来回波动，形成心电图波形。

    可以修改此数组来调整波形形状。
  */
  const ECG_START = [0.50, 0.50];
  const ECG_CYCLE = [0.20, 0.50, 0.80, 0.50];
  const COL_SPACING = 240; // 节点水平间距
  const PAD_LEFT    = 160;
  const PAD_RIGHT   = 200;

  function getEcgY(index) {
    if (index < ECG_START.length) return ECG_START[index];
    const ci = (index - ECG_START.length) % ECG_CYCLE.length;
    return ECG_CYCLE[ci];
  }

  let blogInited = false;

  function initBlogMap() {
    const scroll = document.getElementById('blogMapScroll');
    const map    = document.getElementById('blogMap');
    const svg    = document.getElementById('ecgSvg');
    if (!scroll || !map || !svg) return;

    const nodes = Array.from(map.querySelectorAll('.blog-node'));
    if (!nodes.length) return;

    function layout() {
      const vh = scroll.clientHeight;
      const points = []; // [{x, y}] for polyline

      nodes.forEach((node, i) => {
        const x = PAD_LEFT + i * COL_SPACING;
        const yFrac = getEcgY(i);
        const y = vh * yFrac;

        // 定位节点（居中在坐标点上）
        const nw = node.offsetWidth || 80;
        const nh = node.offsetHeight || 60;
        node.style.left = (x - nw / 2) + 'px';
        node.style.top  = (y - nh / 2) + 'px';

        // 标记底部节点（弹窗朝上）
        if (yFrac > 0.6) {
          node.classList.add('node-bottom');
        } else {
          node.classList.remove('node-bottom');
        }

        points.push({ x, y });
      });

      // 设置 map 总宽度
      const totalW = PAD_LEFT + (nodes.length - 1) * COL_SPACING + PAD_RIGHT;
      map.style.width = totalW + 'px';

      // 绘制 SVG
      drawEcgLine(svg, points, totalW, vh);
    }

    function drawEcgLine(svg, points, tw, th) {
      svg.setAttribute('viewBox', `0 0 ${tw} ${th}`);
      svg.setAttribute('width', tw);
      svg.setAttribute('height', th);
      svg.innerHTML = '';

      if (points.length < 2) return;

      // Defs: 发光滤镜
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = `
        <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      `;
      svg.appendChild(defs);

      // 构建折线点字符串
      const ptStr = points.map(p => `${p.x},${p.y}`).join(' ');

      // 外层发光线
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      glow.setAttribute('points', ptStr);
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', 'rgba(210, 210, 225, 0.12)');
      glow.setAttribute('stroke-width', '8');
      glow.setAttribute('filter', 'url(#ecgGlow)');
      glow.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(glow);

      // 主折线（白色半透明，游戏质感）
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('points', ptStr);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', 'rgba(220, 220, 230, 0.55)');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('stroke-linejoin', 'round');
      line.setAttribute('stroke-linecap', 'round');
      svg.appendChild(line);

      // 每个节点位置画一个小圆点
      points.forEach(p => {
        const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
        c.setAttribute('r', '3');
        c.setAttribute('fill', 'rgba(79, 195, 247, 0.35)');
        svg.appendChild(c);
      });

      // 起点的延伸线（向左延伸到边缘）
      const extL = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      extL.setAttribute('x1', 0); extL.setAttribute('y1', points[0].y);
      extL.setAttribute('x2', points[0].x); extL.setAttribute('y2', points[0].y);
      extL.setAttribute('stroke', 'rgba(220,220,230,0.2)');
      extL.setAttribute('stroke-width', '1.5');
      svg.appendChild(extL);

      // 终点的延伸线（向右延伸到边缘）
      const last = points[points.length - 1];
      const extR = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      extR.setAttribute('x1', last.x); extR.setAttribute('y1', last.y);
      extR.setAttribute('x2', tw); extR.setAttribute('y2', last.y);
      extR.setAttribute('stroke', 'rgba(220,220,230,0.2)');
      extR.setAttribute('stroke-width', '1.5');
      svg.appendChild(extR);
    }

    layout();
    blogInited = true;

    // 响应式
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 200); });

    // 滚轮 → 水平滚动
    scroll.addEventListener('wheel', e => {
      if (!document.getElementById('panelBlog').classList.contains('active')) return;
      e.preventDefault();
      scroll.scrollLeft += e.deltaY * 1.8;
    }, { passive: false });

    // 拖拽滚动
    let dragging = false, sx, ss;
    scroll.addEventListener('mousedown', e => {
      if (e.target.closest('a')) return;
      dragging = true; sx = e.clientX; ss = scroll.scrollLeft; e.preventDefault();
    });
    window.addEventListener('mousemove', e => { if (dragging) scroll.scrollLeft = ss - (e.clientX - sx); });
    window.addEventListener('mouseup', () => { dragging = false; });
    scroll.addEventListener('touchstart', e => { sx = e.touches[0].clientX; ss = scroll.scrollLeft; }, { passive: true });
    scroll.addEventListener('touchmove', e => { scroll.scrollLeft = ss - (e.touches[0].clientX - sx); }, { passive: true });

    // 生成右侧分类面板
    buildCategoryPanel(nodes);
  }

  /* ===========================================================
     3. CATEGORY PANEL（右侧分类目录）
     =========================================================== */
  function buildCategoryPanel(nodes) {
    const container = document.getElementById('categoryList');
    if (!container) return;
    container.innerHTML = '';

    // 按 data-tag 分组
    const groups = {};
    nodes.forEach((node, i) => {
      const tag = node.dataset.tag || '未分类';
      if (!groups[tag]) groups[tag] = [];
      const title = node.querySelector('.node-popup h3');
      const label = node.querySelector('.node-label');
      groups[tag].push({
        title: title ? title.textContent : label ? label.textContent : `节点 ${i}`,
        index: i
      });
    });

    // 渲染
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
          // 点击分类项：滚动到对应节点
          const scroll = document.getElementById('blogMapScroll');
          const targetX = PAD_LEFT + item.index * COL_SPACING - scroll.clientWidth / 2;
          scroll.scrollTo({ left: Math.max(0, targetX), behavior: 'smooth' });
        });
        group.appendChild(link);
      });

      container.appendChild(group);
    });
  }

  /* ===========================================================
     4. PARTICLES
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
     5. TRANSITIONS & TABS
     =========================================================== */
  enterBtn.addEventListener('click', () => {
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      mainInterface.classList.remove('hidden');
      mainInterface.classList.add('visible');
      animAS();
      if (!blogInited) setTimeout(initBlogMap, 100);
    }, 600);
  });

  backBtn.addEventListener('click', () => {
    mainInterface.classList.remove('visible');
    mainInterface.classList.add('hidden');
    setTimeout(() => { landing.style.display = 'flex'; landing.classList.remove('exit'); }, 500);
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabPanels.forEach(p => p.classList.remove('active'));
      document.getElementById(t).classList.add('active');
      if (t === 'panelAbout') animAS();
      if (t === 'panelBlog' && !blogInited) setTimeout(initBlogMap, 50);
    });
  });

  function animAS() {
    document.querySelectorAll('.about-section').forEach((s, i) => {
      s.style.opacity = '0'; s.style.transform = 'translateY(20px)';
      setTimeout(() => {
        s.style.transition = 'opacity .6s ease, transform .6s ease';
        s.style.opacity = '1'; s.style.transform = 'translateY(0)';
      }, 150 * i);
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mainInterface.classList.contains('visible')) backBtn.click();
    if (e.key === 'Enter' && landing.style.display !== 'none') enterBtn.click();
  });

});
