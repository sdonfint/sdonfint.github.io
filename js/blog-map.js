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
      cycleGap: 400,
      nodeW: 75,
      nodeH: 30,
      topMargin: 0.18,
      bottomMargin: 0.18,
      wave: [0.5, 0.15, 0.5, 0.85, 0.5]
    };

    let layoutRafId = 0;
    let settleTimerId = 0;
    let resizeTimerId = 0;

    function requestLayout() {
      if (layoutRafId) return;
      layoutRafId = requestAnimationFrame(() => {
        layoutRafId = 0;
        layout();
      });
    }

    function requestSettledLayout() {
      if (settleTimerId) clearTimeout(settleTimerId);
      settleTimerId = setTimeout(() => {
        settleTimerId = 0;
        requestLayout();
      }, 120);
    }

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
      
      const finishedCycle = nodes.length % CFG.wave.length === 0;
      const farTail = finishedCycle ? 1400 : 520;
      const totalW = x + CFG.padRight + farTail;
      map.style.width = totalW + 'px';
      let pointsForRender = pts;
      if (debugMode) {
        const drift = measureAlignmentDrift();
        pointsForRender = pts.map((p) => ({
          x: p.x + drift.avgDx,
          y: p.y + drift.avgDy
        }));
        reportAlignment(drift);
      }

      renderSvg(svg, pointsForRender, totalW, viewH);
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
      if (!el.dataset.inited) {
        const lineSoft = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        lineSoft.setAttribute('fill', 'none');
        lineSoft.setAttribute('stroke', 'rgba(220,220,230,0.35)');
        lineSoft.setAttribute('stroke-width', '4');
        lineSoft.setAttribute('stroke-linejoin', 'round');
        lineSoft.setAttribute('stroke-linecap', 'round');
        el.appendChild(lineSoft);

        const lineMain = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        lineMain.setAttribute('fill', 'none');
        lineMain.setAttribute('stroke', 'rgba(220,220,230,0.6)');
        lineMain.setAttribute('stroke-width', '3');
        lineMain.setAttribute('stroke-linejoin', 'round');
        lineMain.setAttribute('stroke-linecap', 'round');
        el.appendChild(lineMain);

        const lineHi = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        lineHi.setAttribute('fill', 'none');
        lineHi.setAttribute('stroke', 'rgba(255,255,255,0.75)');
        lineHi.setAttribute('stroke-width', '1.5');
        lineHi.setAttribute('stroke-linejoin', 'round');
        lineHi.setAttribute('stroke-linecap', 'round');
        el.appendChild(lineHi);

        el.dataset.inited = '1';
      }
      
      if (pts.length < 2) return;

      const all = [{ x: 0, y: pts[0].y }, { x: pts[0].x - 30, y: pts[0].y }];
      pts.forEach(p => all.push(p));
      all.push({ x: w, y: pts[pts.length - 1].y });
      const s = all.map(p => p.x + ',' + p.y).join(' ');

      const lineSoft = el.children[0];
      const lineMain = el.children[1];
      const lineHi = el.children[2];
      lineSoft.setAttribute('points', s);
      lineMain.setAttribute('points', s);
      lineHi.setAttribute('points', s);
    }

    function go() {
      requestLayout();
      requestSettledLayout();
    }
    
    const obs = new MutationObserver(() => {
      if (panel.classList.contains('active')) {
        go();
      }
    });
    obs.observe(panel, { attributes: true });
    
    window.addEventListener('resize', () => {
      if (panel.classList.contains('active')) {
        if (resizeTimerId) clearTimeout(resizeTimerId);
        resizeTimerId = setTimeout(() => {
          resizeTimerId = 0;
          go();
        }, 100);
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
