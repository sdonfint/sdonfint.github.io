/* ============================================================
   PERSONAL PORTFOLIO - MAIN SCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const landing = document.getElementById('landing');
  const mainInterface = document.getElementById('mainInterface');
  const enterBtn = document.getElementById('enterBtn');
  const backBtn = document.getElementById('backBtn');
  const tabNav = document.getElementById('tabNav');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const blogScroll = document.getElementById('blogScroll');

  // ---- 生成装饰粒子 ----
  createParticles();

  // ---- 进入按钮 ----
  enterBtn.addEventListener('click', () => {
    landing.classList.add('exit');
    setTimeout(() => {
      landing.style.display = 'none';
      mainInterface.classList.remove('hidden');
      mainInterface.classList.add('visible');
      animateAboutSections();
    }, 600);
  });

  // ---- 返回按钮 ----
  backBtn.addEventListener('click', () => {
    mainInterface.classList.remove('visible');
    mainInterface.classList.add('hidden');
    setTimeout(() => {
      landing.style.display = 'flex';
      landing.classList.remove('exit');
    }, 500);
  });

  // ---- Tab 切换 ----
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      // 更新按钮状态
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切换面板
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      document.getElementById(targetId).classList.add('active');

      // 如果切换到 About，触发动画
      if (targetId === 'panelAbout') {
        animateAboutSections();
      }
    });
  });

  // ---- 博客页面：鼠标滚轮 → 水平滚动 ----
  if (blogScroll) {
    blogScroll.addEventListener('wheel', (e) => {
      // 只在 Blog 面板激活时拦截
      if (!document.getElementById('panelBlog').classList.contains('active')) return;

      e.preventDefault();
      blogScroll.scrollLeft += e.deltaY * 2;
    }, { passive: false });
  }

  // ---- About 区块入场动画 ----
  function animateAboutSections() {
    const sections = document.querySelectorAll('.about-section');
    sections.forEach((section, i) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      setTimeout(() => {
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 150 * i);
    });
  }

  // ---- 生成粒子 ----
  function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
      p.style.setProperty('--dy', (Math.random() * -80 - 20) + 'px');
      p.style.setProperty('--duration', (6 + Math.random() * 8) + 's');
      p.style.setProperty('--delay', (Math.random() * 10) + 's');
      p.style.width = (1 + Math.random() * 2) + 'px';
      p.style.height = p.style.width;
      container.appendChild(p);
    }
  }

  // ---- 键盘快捷键 ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mainInterface.classList.contains('visible')) {
        backBtn.click();
      }
    }
    if (e.key === 'Enter' && landing.style.display !== 'none') {
      enterBtn.click();
    }
  });
});
