// hamburger
const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');

menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? '✕' : '☰';
});

menu.addEventListener('click', e => {
  if (e.target.closest('a')) {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
    menuBtn.textContent = '☰';
  }
});

// dark mode (remembered)
const root = document.documentElement;
const themeBtn = document.getElementById('theme');

function isDark() {
  return root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
}
function paintIcon() { themeBtn.textContent = isDark() ? '☀️' : '🌙'; }

try {
  const saved = localStorage.getItem('theme');
  if (saved) root.dataset.theme = saved;
} catch (e) {}
paintIcon();

themeBtn.addEventListener('click', () => {
  root.dataset.theme = isDark() ? 'light' : 'dark';
  try { localStorage.setItem('theme', root.dataset.theme); } catch (e) {}
  paintIcon();
});


(() => {
  document.documentElement.classList.add('js');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Endless strip: clone the list once so the loop never jumps
  const track = document.querySelector('.marquee-track');
  if (track && !still) {
    [...track.children].forEach(li => {
      const copy = li.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
    });
  }

  // 2. Staggered reveal on scroll
  document.querySelectorAll('.cap-grid, .stats').forEach(group =>
    group.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--i', i)));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      const num = e.target.querySelector('[data-count]');
      if (num) countUp(num);
      io.unobserve(e.target);
    });
  },  { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // 3. Count-up numbers
  function countUp(el) {
    const end = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (still) { el.textContent = end + suffix; return; }
    const dur = 1500, t0 = performance.now();
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // 4. Cursor light on cards
  document.querySelectorAll('.cap-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();