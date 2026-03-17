/* ═══════════════════════════════════════════════
   Portfolio 2026 — Qusai Kagalwala
   main.js — All interactions & animations
═══════════════════════════════════════════════ */

// ── LOADING SCREEN ──────────────────────────────
(function () {
    const loader = document.getElementById('loader');
    const main = document.getElementById('main-content');
    const MIN_MS = 2400;
    const start = Date.now();
    let done = false;

    function hideLoader() {
        if (done || !loader || !main) return;
        done = true;
        loader.classList.add('loader-hidden');
        loader.setAttribute('aria-hidden', 'true');
        main.classList.remove('main-hidden');
        main.classList.add('main-visible');
        document.body.classList.remove('loading');
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
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('qk-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('qk-theme', next);
});


// ── HAMBURGER MENU ───────────────────────────────
const hamburgerBtn = document.getElementById('hamburger-btn');
const mobileNav = document.getElementById('mobile-nav');
const navOverlay = document.getElementById('nav-overlay');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

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

hamburgerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileNav.classList.contains('open') ? closeNav() : openNav();
});

navOverlay?.addEventListener('click', closeNav);

// Close nav when a mobile link is clicked
mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeNav);
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('open')) {
        closeNav();
    }
});


// ── SCROLL PROGRESS BAR ──────────────────────────
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    if (!progressBar) return;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${(window.scrollY / Math.max(h, 1)) * 100}%`;
}, { passive: true });


// ── NAVBAR SHADOW ON SCROLL ──────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (!navbar) return;
    navbar.style.boxShadow = window.scrollY > 50 ? 'var(--shadow)' : 'none';
}, { passive: true });


// ── HERO PARALLAX ────────────────────────────────
const hero = document.getElementById('hero');
window.addEventListener('scroll', () => {
    if (!hero) return;
    const opacity = Math.max(0.3, 1 - window.scrollY * 0.0008);
    hero.style.opacity = opacity;
}, { passive: true });


// ── SCROLL REVEAL (Intersection Observer) ────────
const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-in').forEach(el => revealObserver.observe(el));


// ── PROJECT FILTERING ─────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCols = document.querySelectorAll('.project-col');

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();

        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCols.forEach(col => {
            const category = col.getAttribute('data-category');
            const show = filter === 'all' || category === filter;

            if (show) {
                col.style.display = '';
                col.style.animation = 'none';
                col.offsetHeight; // reflow
                col.style.animation = '';
                // Re-trigger fade-in
                col.querySelector('.project-card')?.classList.remove('visible');
                setTimeout(() => {
                    col.querySelector('.fade-in')?.classList.add('visible');
                }, 50);
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
    card.addEventListener('click', (e) => {
        if (e.target.closest('a[href]')) return;
        window.open(repo, '_blank', 'noopener,noreferrer');
    });
});


// ── SKILLS MARQUEE ───────────────────────────────
const skillsMarquee = document.getElementById('skills-marquee');
const skillsSection = document.getElementById('skills');

if (skillsMarquee && skillsSection) {
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            skillsMarquee.classList.toggle('marquee-active', entry.isIntersecting);
        });
    }, { threshold: 0.2 }).observe(skillsSection);
}


// ── SKILLS RADAR ANIMATION ────────────────────────
const statGraph = document.getElementById('stats-graph');
if (statGraph) {
    new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('stats-visible');
            }
        });
    }, { threshold: 0.3 }).observe(statGraph);
}


// ── CUSTOM CURSOR (desktop / hover devices) ──────
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');

// Only enable on hover-capable devices
const hasHover = window.matchMedia('(hover: hover)').matches;

if (hasHover && cursorDot && cursorOutline) {
    let outlineX = 0, outlineY = 0;
    let animating = false;

    const moveCursor = (x, y) => {
        cursorDot.style.left = `${x}px`;
        cursorDot.style.top = `${y}px`;

        if (!animating) {
            animating = true;
            requestAnimationFrame(function animate() {
                outlineX += (x - outlineX) * 0.12;
                outlineY += (y - outlineY) * 0.12;
                cursorOutline.style.left = `${outlineX}px`;
                cursorOutline.style.top = `${outlineY}px`;

                if (Math.abs(x - outlineX) > 0.1 || Math.abs(y - outlineY) > 0.1) {
                    requestAnimationFrame(animate);
                } else {
                    animating = false;
                }
            });
        }
    };

    window.addEventListener('mousemove', (e) => {
        moveCursor(e.clientX, e.clientY);
    }, { passive: true });

    // Hover effect on interactables
    document.querySelectorAll('a, button, .project-card, .cert-card, .stat-pill').forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });

    // Click burst
    window.addEventListener('click', (e) => {
        const burst = document.createElement('div');
        burst.classList.add('click-burst');
        burst.style.left = `${e.clientX}px`;
        burst.style.top = `${e.clientY}px`;
        document.body.appendChild(burst);
        burst.addEventListener('animationend', () => burst.remove());
    });
}


// ── BACKGROUND CONSTELLATION CANVAS ─────────────
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    // Detect accent color based on theme for canvas
    function getAccentColor() {
        return getComputedStyle(document.documentElement)
            .getPropertyValue('--accent').trim() || '#64ffda';
    }

    class Particle {
        constructor() { this.reset(); }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 1.5 + 0.5;
            this.baseSize = this.size;
        }

        update() {
            if (mouse.x !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * 0.4;
                    this.vy += Math.sin(angle) * force * 0.4;
                    this.size = this.baseSize + force * 2;
                } else {
                    this.size += (this.baseSize - this.size) * 0.1;
                }
            }

            this.vx *= 0.98;
            this.vy *= 0.98;
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw(accentAlpha) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(100, 255, 218, ${accentAlpha})`;
            ctx.fill();
        }
    }

    // Fewer particles on mobile
    const count = window.innerWidth < 768 ? 40 : 70;
    for (let i = 0; i < count; i++) particles.push(new Particle());

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const pAlpha = isDark ? 0.25 : 0.15;
        const lAlpha = isDark ? 0.12 : 0.06;

        particles.forEach((p, i) => {
            p.update();
            p.draw(pAlpha);

            // Connections between particles
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${lAlpha * (110 - dist) / 110})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            }

            // Mouse connections
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    const alpha = (mouse.radius - dist) / mouse.radius * 0.3;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${alpha})`;
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
const sections = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) current = section.getAttribute('id');
    });

    allNavLinks.forEach(link => {
        link.style.color = '';
        if (link.getAttribute('href') === `#${current}`) {
            link.style.color = 'var(--accent)';
        }
    });
}, { passive: true });
