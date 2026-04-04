/* ============================================================
   BLOG MAP - 正常版本
   ============================================================ */

(function() {
  'use strict';

  function init() {
    const scroll = document.getElementById('blogMapScroll');
    const map = document.getElementById('blogMap');
    const svg = document.getElementById('ecgSvg');
    const panel = document.getElementById('panelBlog');
    
    if (!scroll || !map || !svg || !panel) return;
    
    const nodes = Array.from(map.querySelectorAll('.blog-node'));
    if (!nodes.length) return;
    const debugMode = new URLSearchParams(window.location.search).has('debugAlign');
    const isFileProtocol = window.location.protocol === 'file:';

    const CFG = {
      colSpacing: 50,
      padLeft: 80,
      padRight: 120,
      cycleGap: 80,
      nodeW: 75,
      nodeH: 30,
      topMargin: 0.18,
      bottomMargin: 0.18,
      wave: [0.5, 0.15, 0.5, 0.85, 0.5]
    };

    function layout() {
      const viewH = scroll.clientHeight;
      if (!viewH || viewH < 100) return;
      
      const usableH = viewH * (1 - CFG.topMargin - CFG.bottomMargin);
      const topY = viewH * CFG.topMargin;
      
      let x = CFG.padLeft;
      const pts = [];
      
      nodes.forEach((node, i) => {
        const waveIdx = i % CFG.wave.length;
        const yFrac = CFG.wave[waveIdx];
        const y = topY + yFrac * usableH;
        
        pts.push({ x: x, y: y });
        node.style.display = 'block';
        node.style.left = x + 'px';
        node.style.top = y + 'px';
        node.dataset.pointX = String(x);
        node.dataset.pointY = String(y);

        const lbl = node.querySelector('.node-label');
        if (lbl) {
          lbl.style.position = 'absolute';
          lbl.style.left = (-CFG.nodeW / 2) + 'px';
          lbl.style.top = (-CFG.nodeH / 2) + 'px';
          lbl.style.transform = 'none';
          lbl.style.width = CFG.nodeW + 'px';
          lbl.style.height = CFG.nodeH + 'px';
        }

        if (yFrac > 0.65) node.classList.add('node-bottom');
        else node.classList.remove('node-bottom');
        
        if (i < nodes.length - 1) {
          if (waveIdx === CFG.wave.length - 1) x += CFG.colSpacing + CFG.cycleGap;
          else x += CFG.colSpacing;
        }
      });
      
      const totalW = x + CFG.padRight;
      map.style.width = totalW + 'px';
      const drift = measureAlignmentDrift();
      const correctedPts = pts.map((p) => ({
        x: p.x + drift.avgDx,
        y: p.y + drift.avgDy
      }));
      renderSvg(svg, correctedPts, totalW, viewH);
      reportAlignment(drift);
    }

    function measureAlignmentDrift() {
      const mapRect = map.getBoundingClientRect();
      let maxDx = 0;
      let maxDy = 0;
      let sumDx = 0;
      let sumDy = 0;
      let count = 0;

      nodes.forEach((node) => {
        const lbl = node.querySelector('.node-label');
        if (!lbl) return;

        const expX = Number(node.dataset.pointX || 0);
        const expY = Number(node.dataset.pointY || 0);
        const rect = lbl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2 - mapRect.left;
        const cy = rect.top + rect.height / 2 - mapRect.top;
        const rawDx = cx - expX;
        const rawDy = cy - expY;
        const dx = Math.abs(rawDx);
        const dy = Math.abs(rawDy);

        if (dx > maxDx) maxDx = dx;
        if (dy > maxDy) maxDy = dy;

        sumDx += rawDx;
        sumDy += rawDy;
        count += 1;
      });

      return {
        maxDx,
        maxDy,
        avgDx: count ? sumDx / count : 0,
        avgDy: count ? sumDy / count : 0,
        count
      };
    }

    function reportAlignment(drift) {
      if (!drift.count) return;
      updateDebugProbe(drift);
      if (drift.maxDx > 1 || drift.maxDy > 1) {
        console.warn('[blog-map] alignment drift', {
          maxDx: Number(drift.maxDx.toFixed(2)),
          maxDy: Number(drift.maxDy.toFixed(2)),
          avgDx: Number(drift.avgDx.toFixed(2)),
          avgDy: Number(drift.avgDy.toFixed(2))
        });
      }
    }

    function updateDebugProbe(drift) {
      if (!debugMode) return;

      let probe = document.getElementById('blogAlignProbe');
      if (!probe) {
        probe = document.createElement('div');
        probe.id = 'blogAlignProbe';
        probe.style.position = 'absolute';
        probe.style.top = '8px';
        probe.style.left = '8px';
        probe.style.zIndex = '99';
        probe.style.padding = '6px 8px';
        probe.style.fontSize = '11px';
        probe.style.fontFamily = 'monospace';
        probe.style.color = '#fff';
        probe.style.background = 'rgba(0,0,0,0.65)';
        probe.style.border = '1px solid rgba(255,255,255,0.2)';
        map.appendChild(probe);
      }

      probe.textContent = 'align maxDx=' + drift.maxDx.toFixed(2) + ' maxDy=' + drift.maxDy.toFixed(2) +
        ' avgDx=' + drift.avgDx.toFixed(2) + ' avgDy=' + drift.avgDy.toFixed(2);
    }

    function renderSvg(el, pts, w, h) {
      el.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      el.setAttribute('width', w);
      el.setAttribute('height', h);
      el.setAttribute('preserveAspectRatio', 'none');
      el.style.width = w + 'px';
      el.style.height = h + 'px';
      el.style.left = '0px';
      el.style.top = '0px';
      el.innerHTML = '';
      
      if (pts.length < 2) return;
      
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.innerHTML = '<filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
      el.appendChild(defs);
      
      const all = [{ x: 0, y: pts[0].y }, { x: pts[0].x - 30, y: pts[0].y }];
      pts.forEach(p => all.push(p));
      all.push({ x: w, y: pts[pts.length - 1].y });
      const s = all.map(p => p.x + ',' + p.y).join(' ');
      
      function addLine(c, wl, f) {
        const l = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        l.setAttribute('points', s);
        l.setAttribute('fill', 'none');
        l.setAttribute('stroke', c);
        l.setAttribute('stroke-width', wl);
        l.setAttribute('stroke-linejoin', 'round');
        l.setAttribute('stroke-linecap', 'round');
        if (f) l.setAttribute('filter', f);
        el.appendChild(l);
      }
      
      addLine('rgba(220,220,230,0.35)', '6', 'url(#g)');
      addLine('rgba(220,220,230,0.6)', '3');
      addLine('rgba(255,255,255,0.75)', '1.5');
    }

    function go() {
      layout();
      setTimeout(layout, 100);
      setTimeout(layout, 200);
      setTimeout(layout, 500);
      setTimeout(layout, 1000);

      let rafCount = 0;
      function settleFrames() {
        layout();
        rafCount += 1;
        if (rafCount < 8) requestAnimationFrame(settleFrames);
      }
      requestAnimationFrame(settleFrames);
    }
    
    const obs = new MutationObserver(() => {
      if (panel.classList.contains('active')) {
        go();
      }
    });
    obs.observe(panel, { attributes: true });
    
    window.addEventListener('resize', () => {
      if (panel.classList.contains('active')) {
        let t; clearTimeout(t);
        t = setTimeout(go, 100);
      }
    });

    window.addEventListener('load', () => {
      if (panel.classList.contains('active')) go();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (panel.classList.contains('active')) go();
      });
    }

    if (isFileProtocol) {
      setTimeout(() => {
        if (panel.classList.contains('active')) go();
      }, 1500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
