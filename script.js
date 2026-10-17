(function () {
  const root = document.documentElement;

  // Scroll reveal
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('visible'));
  }

  // Mobile menu
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('primary-navigation');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!e.target.closest('.navbar')) setMenu(false); });

  // Theme toggle
  const themeBtn = document.querySelector('.theme-toggle');
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('vexora-theme', t); } catch (e) {}
  }
  let saved = null;
  try { saved = localStorage.getItem('vexora-theme'); } catch (e) {}
  if (saved) applyTheme(saved);
  themeBtn.addEventListener('click', () => applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));

  // Navbar shadow, back to top, year
  const navbar = document.querySelector('.navbar');
  const topBtn = document.querySelector('.back-to-top');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    topBtn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Atom-like particles
  const c = document.getElementById('particle-canvas');
  const ctx = c.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mouse = { x: -9999, y: -9999 };
  const LINK = 120;
  let W, H, P = [];

  function rgb() { return root.getAttribute('data-theme') === 'light' ? '124,58,237' : '167,139,250'; }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.max(40, Math.min(120, Math.floor(W * H / 12000)));
    while (P.length < n) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5, r: Math.random() * 1.4 + .8 });
    P.length = n;
  }
  function frame() {
    ctx.clearRect(0, 0, W, H);
    const col = rgb();
    for (const p of P) {
      p.vx += (Math.random() - .5) * .04; p.vy += (Math.random() - .5) * .04;
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { const f = (1 - d / 120) * .5; p.vx += dx / (d || 1) * f; p.vy += dy / (d || 1) * f; }
      const s = Math.hypot(p.vx, p.vy);
      if (s > .9) { p.vx *= .9 / s; p.vy *= .9 / s; }
      if (!reduce) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
      if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
    }
    for (let a = 0; a < P.length; a++) for (let b = a + 1; b < P.length; b++) {
      const d = Math.hypot(P[a].x - P[b].x, P[a].y - P[b].y);
      if (d < LINK) {
        ctx.strokeStyle = `rgba(${col},${.22 * (1 - d / LINK)})`;
        ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
      }
    }
    ctx.fillStyle = `rgba(${col},.85)`;
    for (const p of P) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill(); }
    if (!reduce) requestAnimationFrame(frame);
  }
  addEventListener('resize', () => { resize(); if (reduce) frame(); });
  addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  resize(); frame();
})();