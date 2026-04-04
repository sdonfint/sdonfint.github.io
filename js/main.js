/* ============================================================
   PERSONAL PORTFOLIO — v4
   博客地图已移至单独的 blog-map.js 文件
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

  backBtn.addEventListener('click', () => {
    mainInterface.classList.remove('visible');
    mainInterface.classList.add('hidden');
    setTimeout(() => { landing.style.display = 'flex'; landing.classList.remove('exit'); }, 500);
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const target = document.getElementById(targetId);
      if (target) target.classList.add('active');
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
    // 滚轮 → 水平滚动
    blogScroll.addEventListener('wheel', e => {
      const panel = document.getElementById('panelBlog');
      if (!panel || !panel.classList.contains('active')) return;
      e.preventDefault();
      blogScroll.scrollLeft += e.deltaY * 1.8;
    }, { passive: false });

    // 拖拽滚动
    let dragging = false, sx, ss;
    blogScroll.addEventListener('mousedown', e => {
      if (e.target.closest('a')) return;
      dragging = true; sx = e.clientX; ss = blogScroll.scrollLeft; e.preventDefault();
    });
    window.addEventListener('mousemove', e => { if (dragging) blogScroll.scrollLeft = ss - (e.clientX - sx); });
    window.addEventListener('mouseup', () => { dragging = false; });
    blogScroll.addEventListener('touchstart', e => { sx = e.touches[0].clientX; ss = blogScroll.scrollLeft; }, { passive: true });
    blogScroll.addEventListener('touchmove', e => { blogScroll.scrollLeft = ss - (e.touches[0].clientX - sx); }, { passive: true });
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
      groups[tag].push({
        title: title ? title.textContent : label ? label.textContent : `节点 ${i}`,
        index: i
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
        });
        group.appendChild(link);
      });

      container.appendChild(group);
    });
  }
  
  initCategoryPanel();

});
