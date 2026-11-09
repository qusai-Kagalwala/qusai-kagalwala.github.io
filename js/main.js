(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main section')];
  const navLinks = [...document.querySelectorAll('nav > a')];
  const boat = document.getElementById('boat');

  /* ---------- theme per section + a soft splash of colour ---------- */
  const splash = document.getElementById('splash');
  let curSec = null;
  function setTheme(s, withSplash){
    if (s === curSec) return; curSec = s;
    const d = s.dataset, dark = !!d.dark;
    root.style.setProperty('--bg', d.bg); root.style.setProperty('--ink', d.ink); root.style.setProperty('--accent', d.accent);
    root.style.setProperty('--mute', dark ? 'rgba(243,238,227,.62)' : 'rgba(27,28,41,.6)');
    root.style.setProperty('--line', dark ? 'rgba(243,238,227,.16)' : 'rgba(27,28,41,.13)');
    document.querySelector('meta[name=theme-color]').content = d.bg;
    navLinks.forEach(a => a.classList.toggle('on', a.hash === '#' + s.id));
    const i = sections.indexOf(s), stage = i < 2 ? 0 : i < 5 ? 1 : 2;   // paper boat → sailboat → ship
    if (boat.dataset.stage != stage) boat.dataset.stage = stage;
    if (withSplash && !reduce) burst(d.accent);
  }
  function burst(color){
    const r = boat.getBoundingClientRect(), x = r.left + r.width/2, y = r.top + r.height/2;
    const S = Math.hypot(innerWidth, innerHeight) * 2.1 / 120, rot = Math.random()*90;
    const b = document.createElement('i'); b.style.cssText = `left:${x}px;top:${y}px;background:${color}`; splash.appendChild(b);
    b.animate([{transform:`scale(0) rotate(${rot}deg)`, opacity:.42},
               {transform:`scale(${S*.55}) rotate(${rot+30}deg)`, opacity:.22, offset:.45},
               {transform:`scale(${S}) rotate(${rot+45}deg)`, opacity:0}],
              {duration:1100, easing:'cubic-bezier(.2,.7,.2,1)', fill:'both'}).onfinish = () => b.remove();
    for (let k = 0; k < 6; k++) {
      const d = document.createElement('i'); d.className = 'drop'; d.style.cssText = `left:${x}px;top:${y}px;background:${color}`; splash.appendChild(d);
      const a = Math.random()*Math.PI*2, dist = 50 + Math.random()*120, sc = .5 + Math.random();
      d.animate([{transform:'translate(0,0) scale(0)', opacity:.9},
                 {transform:`translate(${Math.cos(a)*dist}px,${Math.sin(a)*dist}px) scale(${sc})`, opacity:.7, offset:.55},
                 {transform:`translate(${Math.cos(a)*dist*1.1}px,${Math.sin(a)*dist*1.1+16}px) scale(${sc*.6})`, opacity:0}],
                {duration:900, easing:'cubic-bezier(.2,.8,.3,1)', fill:'both'}).onfinish = () => d.remove();
    }
  }

  /* ---------- the river (it keeps going past the end of the page) ---------- */
  const svg = document.getElementById('route'), ghost = document.getElementById('r-ghost'),
        wash = document.getElementById('r-wash'), ink = document.getElementById('r-ink'), bar = document.getElementById('bar');
  let LUT = [], total = 1, docH = 0, cur = null, tilt = 0, face = 1;
  function build(){
    const W = root.clientWidth; docH = root.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', docH); svg.setAttribute('viewBox', `0 0 ${W} ${docH}`);
    const mobile = W <= 720, m = mobile ? 24 : Math.max(34, (W - 1060)/4 + 12), pts = [];
    sections.forEach((s, i) => {
      const top = s.offsetTop, h = s.offsetHeight, x = mobile ? m : (s.dataset.side === 'L' ? m : W - m), wob = mobile ? 5 : 18;
      if (i === 0) pts.push([mobile ? m : W*.72, 70]);
      pts.push([x, top + Math.min(150, h*.2)]);
      pts.push([x + (i % 2 ? wob : -wob), top + h*.5]);
      if (!(s.dataset.end && document.getElementById('shore'))) pts.push([x, top + h - 90]);
    });
    const shore = document.getElementById('shore');
    if (shore) {   // the journey ends at the little island
      const r = shore.getBoundingClientRect(), sx = r.left + scrollX, sy2 = r.top + scrollY;
      const end = [sx + r.width*(mobile ? .2 : .26), sy2 + r.height*.74];
      const last = pts[pts.length-1]; if (end[1] - last[1] > 160) pts.push([last[0], end[1] - 110]);
      pts.push(end);
    } else pts.push([pts[pts.length-1][0], docH + 60]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i-1] || pts[i], p1 = pts[i], p2 = pts[i+1], p3 = pts[i+2] || p2;
      d += ` C${p1[0]+(p2[0]-p0[0])/6},${p1[1]+(p2[1]-p0[1])/6} ${p2[0]-(p3[0]-p1[0])/6},${p2[1]-(p3[1]-p1[1])/6} ${p2[0]},${p2[1]}`;
    }
    [ghost, wash, ink].forEach(p => p.setAttribute('d', d));
    total = ink.getTotalLength(); ink.style.strokeDasharray = wash.style.strokeDasharray = total;
    LUT = []; for (let l = 0; l <= total; l += 5) { const q = ink.getPointAtLength(l); LUT.push([l, q.x, q.y]); }
    update(true);
  }
  const at = y => { let lo = 0, hi = LUT.length - 1; while (lo < hi) { const mid = (lo+hi) >> 1; if (LUT[mid][2] < y) lo = mid + 1; else hi = mid; } return lo; };
  function update(snap){
    if (!LUT.length) return;
    const vh = innerHeight, sy = scrollY, p = Math.min(1, sy / Math.max(1, docH - vh));
    bar.style.width = p*100 + '%';
    const [len, x, y] = LUT[at(sy + vh*(.4 + .45*p))];
    if (!cur || snap || reduce) cur = {len, x, y};
    else { cur.len += (len-cur.len)*.1; cur.x += (x-cur.x)*.1; cur.y += (y-cur.y)*.1; }
    const j = Math.min(LUT.length-1, at(cur.y)+3), k = Math.max(0, j-6);
    const dx = LUT[j][1]-LUT[k][1], dy = (LUT[j][2]-LUT[k][2]) || 1;
    if (Math.abs(dx) > 4) face = dx > 0 ? 1 : -1;
    tilt += (Math.max(-14, Math.min(14, dx/dy*11)) - tilt)*.1;
    boat.style.transform = `translate(${cur.x - boat.offsetWidth/2}px,${cur.y - boat.offsetHeight*.82}px) rotate(${tilt}deg) scaleX(${face})`;
    ink.style.strokeDashoffset = wash.style.strokeDashoffset = Math.max(0, total - cur.len);
    let s = sections[0]; for (const sec of sections) if (sec.offsetTop <= cur.y + 1) s = sec;
    const docked = total - cur.len < 26 && !!document.getElementById('shore');   // reached the island?
    if (docked !== boat.classList.contains('docked')) { boat.classList.toggle('docked', docked); dispatchEvent(new Event(docked ? 'boat:docked' : 'boat:undocked')); }
    setTheme(s, !snap && curSec !== null);
  }
  (function loop(){ update(false); requestAnimationFrame(loop); })();

  /* ---------- reveal + rolling numbers ---------- */
  document.querySelectorAll('.odo').forEach(el => {
    const v = String(el.dataset.value);
    el.setAttribute('aria-label', v + (el.dataset.suffix || ''));
    [...v].forEach(ch => { const col = document.createElement('span'); col.className = 'col'; col.setAttribute('aria-hidden', 'true');
      col.innerHTML = Array.from({length: 30}, (_, i) => `<span>${i % 10}</span>`).join(''); col.dataset.t = 20 + +ch; el.appendChild(col); });
    if (el.dataset.suffix) { const s = document.createElement('span'); s.className = 'sfx'; s.setAttribute('aria-hidden', 'true'); s.textContent = el.dataset.suffix; el.appendChild(s); }
  });
  const roll = el => el.querySelectorAll('.col').forEach((c, i) => { c.style.transitionDelay = i*.15 + 's'; c.style.transform = `translateY(-${c.dataset.t}em)`; });
  const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return;
    e.target.classList.add('in'); e.target.querySelectorAll('.odo').forEach(roll); io.unobserve(e.target); }), {threshold:.12});
  let revealed = false;
  function startReveal(){ if (revealed) return; revealed = true; document.querySelectorAll('.reveal').forEach(el => io.observe(el)); }

  /* ---------- mobile menu ---------- */
  const mb = document.getElementById('menuBtn'), body = document.body;
  const setMenu = o => { body.classList.toggle('menu', o); body.classList.toggle('lock', o); mb.setAttribute('aria-expanded', o); mb.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); };
  mb.onclick = () => setMenu(!body.classList.contains('menu'));
  navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- sketchbook ---------- */
  const N = 40, LAND = new Set([12,26,32,34,36,37]), pad = n => String(n).padStart(2, '0');
  const src = n => `art/${pad(n)}${LAND.has(n) ? '-book' : ''}.jpg`;
  const wrap = document.getElementById('bookwrap'), book = document.getElementById('book');
  const top = book.querySelector('.top'), under = book.querySelector('.under');
  const topImg = top.querySelector('img'), underImg = under.querySelector('img'), shade = top.querySelector('.shade');
  const pn = document.getElementById('pn'), reel = document.getElementById('reel');
  let page = 1, busy = false;
  const cache = {};
  const load = n => { if (n < 1 || n > N) return Promise.resolve(); if (!cache[n]) { const i = new Image(); i.src = src(n); cache[n] = i.decode().catch(() => {}); } return cache[n]; };
  // reel: all forty thumbnails drifting past, twice over for a seamless loop
  const thumbs = [];
  for (let r = 0; r < 2; r++) for (let n = 1; n <= N; n++) {
    const b = document.createElement('button'); b.setAttribute('aria-label', 'Go to page ' + n); if (r) b.tabIndex = -1, b.setAttribute('aria-hidden', 'true');
    b.innerHTML = `<img src="art/t/${pad(n)}.jpg" alt="" loading="lazy">`; b.onclick = () => go(n); reel.appendChild(b); thumbs.push([n, b]);
  }
  function paint(){
    topImg.src = src(page); topImg.alt = `Sketchbook page ${page} of ${N}`; underImg.src = src(Math.min(N, page + 1));
    pn.textContent = pad(page); thumbs.forEach(([n, b]) => b.classList.toggle('on', n === page));
    wrap.classList.toggle('land', LAND.has(page));
    load(page + 1); load(page + 2); load(page - 1);
  }
  const ease = 'cubic-bezier(.45,.05,.2,1)', D = 850;
  async function flip(dir){
    if (busy) return; const to = page + dir; if (to < 1 || to > N) return;
    busy = true;
    await load(to);
    if (reduce) { page = to; paint(); busy = false; return; }
    if (dir > 0) {                                   // lift the page up and over the spiral
      underImg.src = src(to);
      const a = top.animate([{transform:'rotateX(0deg)'},{transform:'rotateX(180deg)'}], {duration:D, easing:ease});
      shade.animate([{opacity:0},{opacity:1, offset:.45},{opacity:0}], {duration:D});
      await a.finished;
    } else {                                         // bring the previous page back down
      underImg.src = src(page); topImg.src = src(to);
      await topImg.decode().catch(() => {});
      const a = top.animate([{transform:'rotateX(180deg)'},{transform:'rotateX(0deg)'}], {duration:D, easing:ease});
      shade.animate([{opacity:0},{opacity:1, offset:.55},{opacity:0}], {duration:D});
      await a.finished;
    }
    page = to; paint(); busy = false;
  }
  async function go(n){ if (busy || n === page) return; if (Math.abs(n - page) === 1) return flip(n - page);
    busy = true; await load(n); page = n; paint(); busy = false; }
  document.getElementById('next').onclick = () => flip(1);
  document.getElementById('prev').onclick = () => flip(-1);
  book.addEventListener('click', () => flip(1));
  book.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); flip(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); flip(-1); } });
  let sx = 0, sy0 = 0, swiped = false;
  book.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy0 = e.touches[0].clientY; swiped = false; }, {passive:true});
  book.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy0;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { swiped = true; e.preventDefault(); flip(dx < 0 ? 1 : -1); } });
  paint();

  /* ---------- hover to peek at certificates (tap on phones) ---------- */
  const peek = document.getElementById('peek'), peekImg = peek.querySelector('img');
  let px = 0, py = 0, tx = 0, ty = 0, showing = false;
  document.querySelectorAll('.peekable .row[data-img]').forEach(r => {
    const name = r.querySelector('h3').textContent;
    const inline = document.createElement('img'); inline.className = 'peek-inline'; inline.alt = name + ' certificate'; inline.loading = 'lazy'; r.appendChild(inline);
    r.addEventListener('mouseenter', e => { peekImg.src = r.dataset.img; peekImg.alt = inline.alt; showing = true; peek.classList.add('on'); px = tx = e.clientX; py = ty = e.clientY; });
    r.addEventListener('mouseleave', () => { showing = false; peek.classList.remove('on'); });
    r.addEventListener('click', () => { if (!inline.src) inline.src = r.dataset.img; r.classList.toggle('open'); });
    new Image().src = r.dataset.img;
  });
  addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  (function follow(){
    px += (tx - px)*.18; py += (ty - py)*.18;
    if (showing) { const w = 360, h = peek.offsetHeight || 270;
      const x = px + 28 + w > innerWidth - 16 ? px - w - 28 : px + 28, y = Math.min(innerHeight - h - 16, Math.max(70, py - h/2));
      peek.style.transform = `translate(${x}px,${y}px) rotate(${(tx - px)*.04}deg)`; }
    requestAnimationFrame(follow);
  })();



  /* ---------- project screenshots: drop an image or short video into media/ and list it here ---------- */
  const SHOTS = {
    // docly: 'media/docly.webp',
    // hisaab: 'media/hisaab.mp4',
  };
  document.querySelectorAll('.shot[data-shot]').forEach(el => {
    const src = SHOTS[el.dataset.shot]; if (!src) return el.remove();
    el.classList.add('has');
    el.innerHTML = /\.(mp4|webm)$/.test(src) ? `<video src="${src}" autoplay muted loop playsinline></video>` : `<img src="${src}" alt="" loading="lazy">`;
  });

  /* ---------- certificate filters ---------- */
  document.querySelectorAll('.filters button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(b => b.classList.toggle('on', b === btn));
    const f = btn.dataset.f, list = document.querySelector('.certs');
    if (!list.style.minHeight) list.style.minHeight = list.offsetHeight + 'px';   // keep the page from jumping
    document.querySelectorAll('.certs .row').forEach(r => r.classList.toggle('hide', f !== 'all' && !(r.dataset.cat || '').split(' ').includes(f)));
  }));
  document.querySelectorAll('.filters button').forEach(btn => { if (btn.dataset.f === 'all') return;
    const n = [...document.querySelectorAll('.certs .row')].filter(r => (r.dataset.cat || '').split(' ').includes(btn.dataset.f)).length;
    btn.insertAdjacentHTML('beforeend', ` <i>${n}</i>`); });

  /* ---------- sketchbook: surprise me ---------- */
  const rnd = document.getElementById('rnd');
  if (rnd) rnd.addEventListener('click', () => { let n; do n = 1 + Math.floor(Math.random() * N); while (n === page); go(n); });

  /* ---------- the intro (js/island.js) holds the page until the boat sets sail ---------- */
  if (root.classList.contains('loading')) addEventListener('intro:done', startReveal, {once:true});
  else startReveal();

  /* ---------- keep the river in sync with the layout ---------- */
  let t, lastW = innerWidth;
  const rebuild = () => { clearTimeout(t); t = setTimeout(build, 120); };
  addEventListener('resize', () => { if (innerWidth !== lastW) { lastW = innerWidth; rebuild(); } });
  addEventListener('load', rebuild);
  if (document.fonts) document.fonts.ready.then(rebuild);
  new ResizeObserver(rebuild).observe(document.querySelector('main'));
  build();
})();
