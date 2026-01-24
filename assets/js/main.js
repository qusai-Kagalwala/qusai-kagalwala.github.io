// Loading screen: hide after load + minimum display time, then reveal main
(function () {
    const loader = document.getElementById('loader');
    const main = document.getElementById('main-content');
    const minDisplayMs = 2400;
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

    window.addEventListener('load', function onLoad() {
        const elapsed = Date.now() - start;
        setTimeout(hideLoader, Math.max(200, minDisplayMs - elapsed));
    });
    if (document.readyState === 'complete') {
        const elapsed = Date.now() - start;
        setTimeout(hideLoader, Math.max(200, minDisplayMs - elapsed));
    }
})();

// Navbar: always sticky (no hide-on-scroll), add shadow when scrolled
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (navbar) {
        navbar.style.boxShadow = window.scrollY > 50 ? 'var(--shadow-light)' : 'none';
    }
});

// Scroll Reveal Animation (Intersection Observer)
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2
};

const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .section-title').forEach(el => observer.observe(el));

// Scroll progress bar
const progressBar = document.getElementById('scroll-progress');
if (progressBar) {
    window.addEventListener('scroll', () => {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const p = (window.scrollY / Math.max(h, 1)) * 100;
        progressBar.style.width = `${p}%`;
    });
}

// Parallax on hero (subtle)
const hero = document.getElementById('hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        const opacity = Math.max(0.3, 1 - y * 0.0008);
        hero.style.setProperty('--hero-opacity', opacity);
    });
}

// Skills marquee: start endless horizontal scroll when section in view
const skillsMarquee = document.getElementById('skills-marquee');
const skillsSection = document.getElementById('skills');
if (skillsMarquee && skillsSection) {
    const marqueeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            skillsMarquee.classList.toggle('marquee-active', entry.isIntersecting);
        });
    }, { threshold: 0.2 });
    marqueeObserver.observe(skillsSection);
}

// PUBG-style stat graph: animate bars on scroll into view
const statGraph = document.getElementById('stats-graph');
if (statGraph) {
    const graphObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('stats-visible');
            }
        });
    }, { threshold: 0.3 });
    graphObserver.observe(statGraph);
}

// Project Filtering
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');
        projectCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                card.classList.remove('visible');
                setTimeout(() => card.classList.add('visible'), 50);
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Project card click → open repo (GitHub). Clicks on links use their href.
projectCards.forEach(card => {
    const repo = card.getAttribute('data-repo');
    card.style.cursor = repo ? 'pointer' : 'default';
    card.addEventListener('click', (e) => {
        if (!repo) return;
        if (e.target.closest('a[href]')) return;
        window.open(repo, '_blank', 'noopener,noreferrer');
    });
});

// Custom Cursor Logic with Trail
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
let cursorTrails = [];
const maxTrails = 10;
let trailIndex = 0;

// Create trail elements
for (let i = 0; i < maxTrails; i++) {
    const trail = document.createElement('div');
    trail.classList.add('cursor-trail');
    trail.style.opacity = '0';
    document.body.appendChild(trail);
    cursorTrails.push(trail);
}

let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    mouseX = posX;
    mouseY = posY;

    // Dot follows immediately
    if (cursorDot) {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;
    }

    // Add trail point
    const trail = cursorTrails[trailIndex];
    trail.style.left = `${posX}px`;
    trail.style.top = `${posY}px`;
    trail.style.opacity = '0.6';
    trail.style.transition = 'opacity 0.3s ease-out';
    
    setTimeout(() => {
        trail.style.opacity = '0';
    }, 50);
    
    trailIndex = (trailIndex + 1) % maxTrails;

    // Outline follows with smooth animation
    if (cursorOutline) {
        outlineX += (posX - outlineX) * 0.15;
        outlineY += (posY - outlineY) * 0.15;
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
    }
});

// Cursor Hover Interactions
const interactables = document.querySelectorAll('a, button, .project-card, input, textarea, .cert-card, .skill-item');

interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
    });
});

// Subtle click burst (toned down: single, small, low opacity)
window.addEventListener('click', (e) => {
    const burst = document.createElement('div');
    burst.classList.add('click-burst');
    burst.style.left = `${e.clientX}px`;
    burst.style.top = `${e.clientY}px`;
    document.body.appendChild(burst);
    burst.addEventListener('animationend', () => burst.remove());
});

// Enhanced Interactive Background (Constellation Effect with Cursor Reaction)
const canvas = document.getElementById('bg-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.baseSize = this.size;
            this.color = 'rgba(100, 255, 218, 0.3)';
            this.baseColor = this.color;
        }

        update() {
            // React to mouse proximity
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Push particles away from cursor
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.vx += Math.cos(angle) * force * 0.5;
                    this.vy += Math.sin(angle) * force * 0.5;
                    
                    // Increase size and brightness near cursor
                    this.size = this.baseSize + force * 2;
                    const opacity = Math.min(0.8, 0.3 + force * 0.5);
                    this.color = `rgba(100, 255, 218, ${opacity})`;
                } else {
                    // Gradually return to normal
                    this.size += (this.baseSize - this.size) * 0.1;
                    this.color = this.baseColor;
                }
            }

            // Apply velocity with damping
            this.vx *= 0.98;
            this.vy *= 0.98;
            
            this.x += this.vx;
            this.y += this.vy;

            // Wrap around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize more particles for better effect
    for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
    }

    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections between particles
        particles.forEach((p, i) => {
            particles.slice(i + 1).forEach(other => {
                const dx = p.x - other.x;
                const dy = p.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.15;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.stroke();
                }
            });

            // Enhanced connection to mouse with gradient
            if (mouse.x !== null && mouse.y !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const opacity = (mouse.radius - distance) / mouse.radius * 0.4;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(100, 255, 218, ${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                    
                    // Add glow effect at connection point
                    const gradient = ctx.createRadialGradient(
                        mouse.x, mouse.y, 0,
                        mouse.x, mouse.y, mouse.radius
                    );
                    gradient.addColorStop(0, 'rgba(100, 255, 218, 0.1)');
                    gradient.addColorStop(1, 'rgba(100, 255, 218, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    animate();
}
