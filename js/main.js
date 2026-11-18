(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const sections = [...document.querySelectorAll('main section')];
  const navLinks = [...document.querySelectorAll('nav > a')];
  const boat = document.getElementById('boat');
  const MODE = root.dataset.mode || 'voyage', voyage = MODE === 'voyage';   // the river, boat and colour changes belong to Voyage only

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
  const isletBox = document.getElementById('islets');
  function build(){
    if (!voyage) return;
    const W = root.clientWidth; docH = root.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', docH); svg.setAttribute('viewBox', `0 0 ${W} ${docH}`);
    const mobile = W <= 720, m = mobile ? 24 : Math.max(34, (W - 1060)/4 + 12), pts = [];
    sections.forEach((s, i) => {
      const top = s.offsetTop, h = s.offsetHeight, x = mobile ? m : (s.dataset.side === 'L' ? m : W - m), wob = mobile ? 5 : 18;
      if (i === 0) pts.push([mobile ? m : W*.72, 70]);
      pts.push([x, top + Math.min(150, h*.2)]);
      if (i) islet(i, x, top + Math.min(150, h*.2), s);
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
  // every section is an island on the route, flying a flag with its name
  function islet(i, x, y, s){
    if (!isletBox) return;
    let el = isletBox.children[i - 1];
    if (!el) { el = document.createElement('div'); el.className = 'islet';
      const name = (navLinks.find(a => a.hash === '#' + s.id) || {childNodes: []}).childNodes; const label = name.length ? name[name.length - 1].textContent : '';
      el.innerHTML = `<svg viewBox="0 0 150 110">
        <ellipse cx="75" cy="92" rx="72" ry="15" fill="#55d0cf" opacity=".35"/><ellipse cx="75" cy="90" rx="60" ry="11" fill="#9fe9df" opacity=".6"/>
        <ellipse cx="75" cy="89" rx="52" ry="8" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/>
        <path d="M22 88C40 66 110 66 128 88 104 96 46 96 22 88z" fill="#f6e5b8"/><path d="M22 88c24 8 82 8 106 0" stroke="#caa66a" stroke-width="2" fill="none"/>
        <path d="M46 78c16-9 44-9 60 0-18-4-42-4-60 0z" fill="#6fb04f"/>
        <ellipse cx="38" cy="86" rx="7" ry="4" fill="#9aa3ad"/><ellipse cx="45" cy="88" rx="4" ry="2.5" fill="#b9c1c9"/>
        <g transform="translate(98 80)"><path d="M0 0C3-18 1-34-6-48" stroke="#8f6a4f" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M-1-12h5M-2-24h5M-4-36h5" stroke="#5e4130" stroke-width="1.4"/>
          <g transform="translate(-6 -48)"><path d="M0 0C12-16 36-16 50-2 34-8 18-6 0 0z" fill="#1f9a50"/><path d="M0 0C-12-16-36-16-50-2-34-8-18-6 0 0z" fill="#46a83f"/><path d="M0 0C-4-18 4-30 16-36 10-22 8-10 0 0z" fill="#7cc043"/>
            <path d="M0 0C10 4 24 16 26 32 16 20 8 10 0 0z" fill="#c9dc3c"/><path d="M0 0C-10 4-24 16-26 32-16 20-8 10 0 0z" fill="#1f9a50"/><circle cx="-3" cy="4" r="4" fill="#8d6640"/><circle cx="4" cy="5" r="4" fill="#7a5634"/></g></g>
        <g transform="translate(56 80)"><path d="M0 0V-34" stroke="#7a5230" stroke-width="3.4" stroke-linecap="round"/>
          <g transform="rotate(-4 0 -30)"><rect x="-30" y="-44" width="60" height="18" rx="3" fill="#c79a5e" stroke="#7a5230" stroke-width="1.6"/><path d="M-26-38h52" stroke="#a97c44" stroke-width=".8"/>
          <text x="0" y="-31" text-anchor="middle">${label}</text></g></g></svg>`; isletBox.appendChild(el); }
    el.style.left = x + 'px'; el.style.top = y + 'px';
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
  if (voyage) (function loop(){ update(false); requestAnimationFrame(loop); })();
  else {   // Professional: no boat, just a progress line and the current section in the nav
    const onScroll = () => { bar.style.width = Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight)) * 100 + '%'; };
    addEventListener('scroll', onScroll, {passive: true}); onScroll();
    const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id)); }), {rootMargin: '-45% 0px -50% 0px'});
    sections.forEach(s => spy.observe(s));
  }

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
    wrap.classList.add('loaded');
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
  if (voyage) paint();

  /* ---------- hover to peek at certificates (tap on phones) ---------- */
  const peek = document.getElementById('peek'), peekImg = peek.querySelector('img');
  let px = 0, py = 0, tx = 0, ty = 0, showing = false;
  document.querySelectorAll('.peekable .row[data-img]').forEach(r => {
    const name = r.querySelector('h3').textContent;
    const inline = document.createElement('img'); inline.className = 'peek-inline'; inline.alt = name + ' certificate'; inline.loading = 'lazy'; r.appendChild(inline);
    r.addEventListener('mouseenter', e => { peekImg.src = r.dataset.img; peekImg.alt = inline.alt; showing = true; peek.classList.add('on'); px = tx = e.clientX; py = ty = e.clientY; });
    r.addEventListener('mouseleave', () => { showing = false; peek.classList.remove('on'); });
    r.addEventListener('click', () => { if (!inline.src) inline.src = r.dataset.img; r.classList.toggle('open'); });
    if (MODE !== 'gallery') (window.requestIdleCallback || setTimeout)(() => { new Image().src = r.dataset.img; });
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
    cue: [['media/cue-1.webp', 'A guided lesson: fill in the blanks, then check your prompt'], ['media/cue-2.webp', 'Ten stages, from everyday prompts to directing AI agents']],
    docly: [['media/docly-1.webp', 'Exact size and KB limit for any portal'], ['media/docly-2.webp', 'Swap the background in one click'],
            ['media/docly-3.webp', 'A clean signature from a phone photo'], ['media/docly-4.webp', 'Merge, reorder and shrink PDFs'],
            ['media/docly-5.webp', 'Fill and sign forms without printing'], ['media/docly-6.webp', 'Works offline, light and dark']],
    // hisaab: [['media/hisaab-1.webp', 'caption'], …]   ← add phone screenshots here
  };
  document.querySelectorAll('.shot[data-shot]').forEach(el => {
    const list = SHOTS[el.dataset.shot]; if (!list) return el.remove();
    el.classList.add('has');
    el.innerHTML = `<div class="slides">${list.map(([s, c], i) => `<figure class="${i ? '' : 'on'}"><img src="${s}" alt="${c}" loading="lazy" decoding="async" width="960" height="540" onload="this.parentElement.classList.add('loaded')"><figcaption>${c}</figcaption></figure>`).join('')}</div>
      ${list.length > 1 ? `<div class="dots">${list.map((_, i) => `<button aria-label="Screenshot ${i + 1}" class="${i ? '' : 'on'}"></button>`).join('')}</div>` : ''}`;
    el.querySelectorAll('figure img').forEach(im => { if (im.complete) im.parentElement.classList.add('loaded'); });
    const figs = el.querySelectorAll('figure'), dots = el.querySelectorAll('.dots button'); let k = 0, timer;
    const show = i => { k = (i + figs.length) % figs.length; figs.forEach((f, j) => f.classList.toggle('on', j === k)); dots.forEach((d, j) => d.classList.toggle('on', j === k)); };
    dots.forEach((d, i) => d.onclick = e => { e.stopPropagation(); show(i); clearInterval(timer); });
    const det = el.closest('details');
    det.addEventListener('toggle', () => { clearInterval(timer); if (det.open && !reduce && figs.length > 1) timer = setInterval(() => show(k + 1), 3200); });
    let sx = 0; el.addEventListener('touchstart', e => sx = e.touches[0].clientX, {passive: true});
    el.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - sx; if (Math.abs(d) > 40) { clearInterval(timer); show(k + (d < 0 ? 1 : -1)); } });
  });

  /* ---------- project cards open and close smoothly ---------- */
  document.querySelectorAll('.proj details').forEach(d => {
    const sum = d.querySelector('summary'), panel = d.querySelector('.pdetail'); let a = null;
    sum.addEventListener('click', e => {
      e.preventDefault(); if (a) a.cancel();
      const opening = !d.classList.contains('is-open');
      d.classList.toggle('is-open', opening);
      if (reduce) { d.open = opening; return; }
      if (opening) { d.open = true; const h = panel.offsetHeight, pb = getComputedStyle(panel).paddingBottom;
        a = panel.animate([{height: '0px', paddingBottom: '0px', opacity: 0}, {height: h + 'px', paddingBottom: pb, opacity: 1}], {duration: 520, easing: 'cubic-bezier(.22,.9,.24,1)'}); }
      else { const h = panel.offsetHeight, pb = getComputedStyle(panel).paddingBottom;
        a = panel.animate([{height: h + 'px', paddingBottom: pb, opacity: 1}, {height: '0px', paddingBottom: '0px', opacity: 0}], {duration: 360, easing: 'cubic-bezier(.5,0,.3,1)'});
        a.onfinish = () => { d.open = false; }; }
      a.addEventListener('finish', () => { a = null; });
    });
  });

  /* ---------- certificate filters ---------- */
  document.querySelectorAll('.filters button').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(b => b.classList.toggle('on', b === btn));
    const f = btn.dataset.f, list = document.querySelector('.certs');
    if (!list.style.minHeight) list.style.minHeight = list.offsetHeight + 'px';   // keep the page from jumping
    document.querySelectorAll('.certs .row').forEach(r => r.classList.toggle('hide', f !== 'all' && !(r.dataset.cat || '').split(' ').includes(f)));
  }));
  document.querySelectorAll('.filters button').forEach(btn => { const rows = [...document.querySelectorAll('.certs .row')];
    const n = btn.dataset.f === 'all' ? rows.length : rows.filter(r => (r.dataset.cat || '').split(' ').includes(btn.dataset.f)).length;
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
