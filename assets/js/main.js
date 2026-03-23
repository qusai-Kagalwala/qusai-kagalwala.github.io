/* ═══════════════════════════════════════════════
   Portfolio 2026 — Qusai Kagalwala
   main.js — All interactions & animations
═══════════════════════════════════════════════ */

// ── LOADING SCREEN ──────────────────────────────
(function () {
  const loader = document.getElementById('loader');
  const main   = document.getElementById('main-content');
  const MIN_MS = 2400;
  const start  = Date.now();
  let done = false;

  function hideLoader() {
    if (done || !loader || !main) return;
    done = true;
    loader.classList.add('loader-hidden');
    loader.setAttribute('aria-hidden', 'true');
    main.classList.remove('main-hidden');
    main.classList.add('main-visible');
    document.body.classList.remove('loading');
    // Trigger scroll-reveal on elements already in viewport
    document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));
  }

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    setTimeout(hideLoader, Math.max(200, MIN_MS - elapsed));
  });

  if (document.readyState === 'complete') {
    const elapsed = Date.now() - start;
    setTimeout(hideLoader, Math.max(200, MIN_MS - elapsed));
  }
})();


// ── THEME TOGGLE (Dark / Light) ──────────────────
const themeToggle = document.getElementById('theme-toggle');
const html        = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('qk-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('qk-theme', next);
});


// ── HAMBURGER MENU ───────────────────────────────
const hamburgerBtn  = document.getElementById('hamburger-btn');
const mobileNav     = document.getElementById('mobile-nav');
const navOverlay    = document.getElementById('nav-overlay');
const mobileLinks   = document.querySelectorAll('.mobile-nav-link');

function openNav() {
  hamburgerBtn.classList.add('open');
  hamburgerBtn.setAttribute('aria-expanded', 'true');
  mobileNav.classList.add('open');
  mobileNav.setAttribute('aria-hidden', 'false');
  navOverlay.classList.add('active');
  navOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('nav-open');
}

function closeNav() {
  hamburgerBtn.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  mobileNav.classList.remove('open');
  mobileNav.setAttribute('aria-hidden', 'true');
  navOverlay.classList.remove('active');
  navOverlay.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('nav-open');
}

hamburgerBtn?.addEventListener('click', e => {
  e.stopPropagation();
  mobileNav.classList.contains('open') ? closeNav() : openNav();
});

navOverlay?.addEventListener('click', closeNav);
mobileLinks.forEach(link => link.addEventListener('click', closeNav));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileNav?.classList.contains('open')) closeNav();
});


// ── SCROLL PROGRESS BAR ──────────────────────────
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  if (!progressBar) return;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = `${(window.scrollY / Math.max(h, 1)) * 100}%`;
}, { passive: true });


// ── NAVBAR BORDER ON SCROLL ──────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (!navbar) return;
  if (window.scrollY > 50) {
    navbar.style.boxShadow = 'var(--shadow)';
    navbar.style.borderBottomColor = 'var(--border)';
  } else {
    navbar.style.boxShadow = 'none';
    navbar.style.borderBottomColor = 'var(--border-subtle)';
  }
}, { passive: true });


// ── HERO PARALLAX ────────────────────────────────
const hero = document.getElementById('hero');
window.addEventListener('scroll', () => {
  if (!hero) return;
  hero.style.opacity = Math.max(0.3, 1 - window.scrollY * 0.0008);
}, { passive: true });


// ── SCROLL REVEAL ────────────────────────────────
const revealObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Observed after loader hides (see loading block above)


// ── PROJECT FILTERING ─────────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCols = document.querySelectorAll('.project-col');

filterBtns.forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCols.forEach(col => {
      const match = filter === 'all' || col.getAttribute('data-category') === filter;
      if (match) {
        col.style.display = '';
        // Re-trigger fade
        const fi = col.querySelector('.fade-in');
        if (fi && !fi.classList.contains('visible')) {
          setTimeout(() => fi.classList.add('visible'), 50);
        }
      } else {
        col.style.display = 'none';
      }
    });
  });
});


// ── PROJECT CARD CLICK → OPEN REPO ───────────────
document.querySelectorAll('.project-card[data-repo]').forEach(card => {
  const repo = card.getAttribute('data-repo');
  if (!repo) return;
  card.addEventListener('click', e => {
    if (e.target.closest('a[href]')) return;
    window.open(repo, '_blank', 'noopener,noreferrer');
  });
});


// ── SKILLS MARQUEE ───────────────────────────────
const skillsMarquee = document.getElementById('skills-marquee');
const skillsSection = document.getElementById('skills');

if (skillsMarquee && skillsSection) {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      skillsMarquee.classList.toggle('marquee-active', entry.isIntersecting);
    });
  }, { threshold: 0.2 }).observe(skillsSection);
}


// ── SKILLS RADAR ANIMATION ────────────────────────
const statGraph = document.getElementById('stats-graph');
if (statGraph) {
  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('stats-visible');
    });
  }, { threshold: 0.3 }).observe(statGraph);
}


// ── CUSTOM CURSOR ────────────────────────────────
const cursorDot     = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
const hasHover      = window.matchMedia('(hover: hover)').matches;

if (hasHover && cursorDot && cursorOutline) {
  let ox = 0, oy = 0, anim = false;

  window.addEventListener('mousemove', e => {
    const x = e.clientX, y = e.clientY;
    cursorDot.style.left = `${x}px`;
    cursorDot.style.top  = `${y}px`;

    if (!anim) {
      anim = true;
      (function tick() {
        ox += (x - ox) * 0.12;
        oy += (y - oy) * 0.12;
        cursorOutline.style.left = `${ox}px`;
        cursorOutline.style.top  = `${oy}px`;
        if (Math.abs(x - ox) > 0.1 || Math.abs(y - oy) > 0.1) {
          requestAnimationFrame(tick);
        } else {
          anim = false;
        }
      })();
    }
  }, { passive: true });

  document.querySelectorAll('a, button, .project-card, .cert-card, .stat-pill, .filter-btn').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
  });

  window.addEventListener('click', e => {
    const burst = document.createElement('div');
    burst.classList.add('click-burst');
    burst.style.left = `${e.clientX}px`;
    burst.style.top  = `${e.clientY}px`;
    document.body.appendChild(burst);
    burst.addEventListener('animationend', () => burst.remove());
  });
}


// ── BACKGROUND CONSTELLATION CANVAS ─────────────
const canvas = document.getElementById('bg-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  const mouse = { x: null, y: null, radius: 150 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.size     = Math.random() * 1.5 + 0.5;
      this.baseSize = this.size;
    }
    update() {
      if (mouse.x !== null) {
        const dx   = this.x - mouse.x;
        const dy   = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const f = (mouse.radius - dist) / mouse.radius;
          const a = Math.atan2(dy, dx);
          this.vx += Math.cos(a) * f * 0.4;
          this.vy += Math.sin(a) * f * 0.4;
          this.size = this.baseSize + f * 2;
        } else {
          this.size += (this.baseSize - this.size) * 0.1;
        }
      }
      this.vx *= 0.98;
      this.vy *= 0.98;
      this.x  += this.vx;
      this.y  += this.vy;
      if (this.x < 0) this.x = W;
      if (this.x > W) this.x = 0;
      if (this.y < 0) this.y = H;
      if (this.y > H) this.y = 0;
    }
    draw(pA) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100,255,218,${pA})`;
      ctx.fill();
    }
  }

  const count = W < 768 ? 40 : 70;
  for (let i = 0; i < count; i++) particles.push(new Particle());

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function animate() {
    ctx.clearRect(0, 0, W, H);
    const light = html.getAttribute('data-theme') === 'light';
    const pA = light ? 0.12 : 0.22;
    const lA = light ? 0.06 : 0.11;

    particles.forEach((p, i) => {
      p.update();
      p.draw(pA);

      for (let j = i + 1; j < particles.length; j++) {
        const o  = particles[j];
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,255,218,${lA * (110 - d) / 110})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }

      if (mouse.x !== null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < mouse.radius) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(100,255,218,${((mouse.radius - d) / mouse.radius) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(animate);
  }

  animate();
}


// ── ACTIVE NAV LINK ON SCROLL ─────────────────────
const sections   = document.querySelectorAll('section[id]');
const allLinks   = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
  });
  allLinks.forEach(link => {
    link.style.color = (link.getAttribute('href') === `#${current}`) ? 'var(--accent)' : '';
  });
}, { passive: true });
