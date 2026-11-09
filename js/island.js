// The island: an intro scene that opens the site, and a little shore where the journey ends.
// A stick figure lives here. He talks in terminal prompts, boards the paper boat in the intro,
// rides it down the page (see #boat in index.html) and hops off onto the island at the end.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  const LINES = [
    "git checkout -b vacation",
    "it's not a bug, it's a beach.",
    "npm install coconut --save",
    "sudo take-a-break",
    "ping qusai … reply within one tide.",
    "while (true) { sail(); draw(); build(); }",
    "404: stress not found.",
    "git commit -m \"found the island\"",
  ];

  /* ---------- shared drawing pieces (island coords: (0,0) = waterline under the palms) ---------- */
  // flat cartoon palm leaf: smooth arched top edge, jagged underside, a lighter highlight band
  const PAL = [['#1f9a50', '#7cc043', '#a9d846'], ['#46a83f', '#9fd04c', '#cfe46a'], ['#c9dc3c', '#e6e872', '#f3f19a']];
  const leaf = (a, s, dir, k) => { const [d, m, l] = PAL[k];
    return `<g transform="${dir < 0 ? 'scale(-1 1) ' : ''}rotate(${a}) scale(${s})">
      <path d="M0 0C38-44 112-50 158-8L149-10 145-5 136-12 130-6 121-16 114-8 103-19 97-9 85-20 79-8 67-18 62-6 50-14 45-3 34-9 29 0 18-3 12 2Z" fill="${d}"/>
      <path d="M3-3C40-42 108-47 152-10C112-30 70-27 40-14L30-5 22-9Z" fill="${m}"/>
      <path d="M8-8C44-38 100-42 140-16C104-32 64-30 28-16Z" fill="${l}" opacity=".85"/></g>`; };
  const crown = (leaves, s) => leaves.map(([a, dir, k]) => leaf(a, s, dir, k)).join('');
  const nuts = (r) => `<g class="nut"><circle cx="-7" cy="5" r="${r}" fill="#8d6640"/><circle cx="-8.5" cy="3.5" r="${r*.62}" fill="#c4a06e"/></g>
      <circle cx="${r*1.1}" cy="${r*.9}" r="${r}" fill="#7a5634"/><circle cx="${r*.9}" cy="${r*.6}" r="${r*.62}" fill="#b28c5c"/>`;
  // segmented trunk along a gentle curve: dark left side, lit right edge, stacked notched rings
  const trunk = (x0, y0, x1, y1, bend, w, n) => {
    const P = t => { const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2; return [(1-t)*(1-t)*x0 + 2*(1-t)*t*mx + t*t*x1, (1-t)*(1-t)*y0 + 2*(1-t)*t*my + t*t*y1]; };
    let segs = '';
    for (let i = 0; i < n; i++) {
      const [ax, ay] = P(i / n), [bx, by] = P((i + 1) / n), wa = w * (1 - i / n * .35), wb = w * (1 - (i + 1) / n * .35);
      segs += `<path d="M${ax - wa/2} ${ay}L${bx - wb/2} ${by}L${bx + wb/2 + 3} ${by + 4}L${ax + wa/2} ${ay}Z" fill="${i % 2 ? '#9a7458' : '#8f6a4f'}"/>
        <path d="M${ax - wa/2} ${ay}L${bx - wb/2} ${by}L${bx - wb/2 + wb*.32} ${by}L${ax - wa/2 + wa*.32} ${ay}Z" fill="#5e4130"/>
        <path d="M${ax + wa/2} ${ay}L${bx + wb/2 + 3} ${by + 4}" stroke="#c9a382" stroke-width="2"/>`;
    }
    return segs;
  };
  const figure = (id) => `
      <g class="walker"><g class="fig" role="button" tabindex="0" aria-label="The stick figure. Click to chat, drag to move him.">
        <rect x="4" y="-96" width="42" height="84" fill="transparent"/>
        <ellipse cx="24" cy="-15" rx="12" ry="3" fill="#000" opacity=".14"/>
        <g stroke="#1b1c29" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path class="lg lg1" d="M24-42L17-18"/><path class="lg lg2" d="M24-42L31-18"/>
          <path d="M24-68V-42M24-60L13-50"/><path class="arm" d="M24-60L36-73"/>
          <circle cx="24" cy="-76" r="8" fill="#fff8ec"/>
        </g>
        <path d="M21-78h1.5M27-78h1.5" stroke="#1b1c29" stroke-width="2" stroke-linecap="round"/>
        <path class="mouth" d="M21-72q3 3 6 0" stroke="#1b1c29" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      </g></g>`;
  const island = id => `
    <g class="isle">
      <ellipse cx="0" cy="8" rx="262" ry="30" fill="#55d0cf" opacity=".45"/>
      <ellipse cx="0" cy="6" rx="232" ry="20" fill="#8fe6dc" opacity=".55"/>
      <ellipse class="foam" cx="0" cy="6" rx="210" ry="13" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>
      <path d="M-200 3C-142-32 142-32 200 3C130 19-130 19-200 3Z" fill="url(#${id}-sand)"/>
      <path d="M-200 3C-130 19 130 19 200 3" stroke="#caa66a" stroke-width="3" fill="none" opacity=".7"/>
      <path d="M-132-12C-62-36 72-36 140-12C86-22-74-22-132-12Z" fill="url(#${id}-grass)"/>
      <g stroke="#3f8a35" stroke-width="2" fill="none" stroke-linecap="round">
        <path d="M-100-17l-3-11M-97-17l2-12M-94-17l5-9M-44-22l-2-10M-40-22l3-11M66-21l-3-10M70-21l2-12M74-21l5-9M108-15l2-9M112-15l5-7"/></g>
      <ellipse cx="-160" cy="-2" rx="14" ry="7" fill="#9aa3ad"/><ellipse cx="-146" cy="0" rx="8" ry="5" fill="#b9c1c9"/>
      <path d="M140 2a5 5 0 0 1 10 0z" fill="#f4a6a0"/><path d="M-60 6a4 4 0 0 1 8 0z" fill="#fff"/>
      <!-- deck chair -->
      <g transform="translate(-92 -12)">
        <path d="M-22 6L-26-14M20 6L24-14M-18 6L-12-6M16 6L10-6" stroke="#7a5230" stroke-width="3" stroke-linecap="round"/>
        <path d="M-19-50H17L21-18H-23Z" fill="url(#${id}-stripes)" stroke="#7a5230" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M-25-18H23L28-8H-30Z" fill="#2457b8" stroke="#7a5230" stroke-width="2.5" stroke-linejoin="round"/>
      </g>
      <g clip-path="url(#${id}-peek)" class="figclip">${figure(id)}</g>
      <!-- palms -->
      <g class="sway s2">
        ${trunk(40, -14, 92, -150, 14, 15, 7)}
        <g transform="translate(92 -152)"><g class="fr">${crown([[-28, 1, 0], [14, 1, 1], [52, 1, 2], [-26, -1, 0], [22, -1, 1], [-78, 1, 0]], .62)}${nuts(5.5)}</g></g>
      </g>
      <g class="sway s1" data-palm="1">
        ${trunk(4, -14, -14, -198, -16, 18, 9)}
        <g transform="translate(-14 -198)"><g class="fr">${crown([[-18, 1, 0], [26, 1, 1], [62, 1, 2], [-14, -1, 1], [24, -1, 0], [58, -1, 2], [-74, 1, 0], [-70, -1, 1]], .84)}${nuts(7)}</g></g>
      </g>
      <g transform="translate(-30 -10)">
        <path d="M-24 6C-30-10-12-22 4-18 18-24 34-10 28 6Z" fill="#7a6652"/><path d="M-24 6C-26-4-16-12-6-12L0 6Z" fill="#8e7a64"/>
        <path d="M10 6C10-6 26-12 38-4 44 2 42 6 40 6Z" fill="#6a5745"/>
        <path d="M-20-14l-6-10 9 6 0-12 6 11 5-9 0 12M30-6l8-10-2 11 9-5-6 9" stroke="#2f8a3c" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
    </g>`;
  const defs = id => `<defs>
      <pattern id="${id}-stripes" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#fff"/><rect width="4.5" height="9" fill="#2f6fd6"/></pattern>
      <clipPath id="${id}-peek"><rect x="9" y="-130" width="400" height="160"/></clipPath>
      <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6cc4"/><stop offset=".6" stop-color="#77ade6"/><stop offset="1" stop-color="#d7ebf8"/></linearGradient>
      <linearGradient id="${id}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5cc3d9"/><stop offset=".25" stop-color="#2b9cc2"/><stop offset="1" stop-color="#0d4373"/></linearGradient>
      <radialGradient id="${id}-sun"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#fff2b8" stop-opacity=".9"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e8bf"/><stop offset="1" stop-color="#ddbd82"/></linearGradient>
      <linearGradient id="${id}-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc25a"/><stop offset="1" stop-color="#4d913b"/></linearGradient>
      <linearGradient id="${id}-trunk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#b07a44"/><stop offset=".6" stop-color="#8b5a2b"/><stop offset="1" stop-color="#5e3a1a"/></linearGradient>
      <linearGradient id="${id}-leaf0" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2d7a36"/><stop offset="1" stop-color="#5fb04c"/></linearGradient>
      <linearGradient id="${id}-leaf1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#256b2f"/><stop offset="1" stop-color="#4c9a3f"/></linearGradient>
    </defs>`;
  const band = (y, amp, len, c, o, d) => {   // a translucent wave band, twice as wide as the scene so it can drift
    let p = `M-1200 ${y}`; for (let x = -1200; x < 2400; x += len) p += ` q${len/4} ${-amp} ${len/2} 0 t${len/2} 0`;
    return `<path class="band" style="--d:${d}s" d="${p} V900 H-1200Z" fill="${c}" opacity="${o}"/>`;
  };
  const lines = (y0, n, w) => Array.from({length: n}, (_, i) => {
    const y = y0 + i * 36, x = (i * 173) % 260 - 130;
    return `<g class="wave" style="--d:${7 + i * 1.6}s"><path d="M${x} ${y}${' q20 -7 40 0 t40 0'.repeat(3)}M${x + 600} ${y + 12}${' q20 -7 40 0 t40 0'.repeat(2)}M${x + 1080} ${y - 6}${' q20 -7 40 0 t40 0'.repeat(3)}" stroke="#fff" stroke-opacity="${w}" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`;
  }).join('');
  const rider = `<g class="rider" stroke="#1b1c29" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="-18" cy="-28" r="6" fill="#fff8ec"/><path d="M-18-22v14M-18-14l9-6M-18-8l10 2"/><path class="arm2" d="M-18-17l-9-8"/></g>`;
  const boatSVG = `<g class="pboat"><g class="bobber">
      <path d="M-33 0h66l-13 18H-20z" fill="#f2b01e"/><path d="M0-36v36H-22z" fill="#fff"/><path d="M0-36v36h22z" fill="#2f6fd6"/>
      ${rider}
      <g fill="none" stroke="#1b1c29" stroke-width="2" stroke-linejoin="round"><path d="M-33 0h66l-13 18H-20z"/><path d="M0-36L-22 0M0-36l22 36M0-36V0"/></g></g></g>`;

  /* ---------- speech bubble that types like a terminal ---------- */
  function bubble(host){
    const b = document.createElement('div'); b.className = 'say'; b.setAttribute('aria-live', 'polite');
    b.innerHTML = '<p><b>›</b> <span></span><i class="caret"></i></p><div class="act"></div>'; host.appendChild(b);
    const span = b.querySelector('span'); let timer;
    b.type = (text, done) => {
      clearInterval(timer); b.classList.add('on'); span.textContent = ''; b.querySelector('.act').innerHTML = '';
      if (reduce) { span.textContent = text; done && done(); return; }
      let i = 0; timer = setInterval(() => { span.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(timer); done && done(); } }, 32);
    };
    b.hide = () => b.classList.remove('on');
    return b;
  }
  function placeBubble(b, fig, host){
    const r = fig.getBoundingClientRect(), h = host.getBoundingClientRect(), vw = root.clientWidth;
    if (vw < 720) { b.classList.add('wide'); b.style.left = (16 - h.left) + 'px'; b.style.width = (vw - 32) + 'px'; b.style.top = (r.top - h.top - 18) + 'px'; }
    else { b.classList.remove('wide'); b.style.width = '';
      b.style.left = Math.max(12 - h.left, Math.min(r.right - h.left + 8, vw - h.left - 332)) + 'px'; b.style.top = (r.top - h.top - 14) + 'px'; }
  }
  const wave = fig => { fig.classList.remove('wave'); void fig.getBBox(); fig.classList.add('wave'); };
  function chatter(fig, b, host){
    let k = Math.floor(Math.random() * LINES.length);
    return (line) => { wave(fig); b.type(line || LINES[k++ % LINES.length]); placeBubble(b, fig, host); };
  }
  const anim = (el, frames, opts) => reduce ? Promise.resolve(el.animate(frames.slice(-1), {duration: 1, fill: 'forwards'})) : el.animate(frames, {fill: 'forwards', ...opts}).finished;

  /* ---------- 1. the intro ---------- */
  const intro = document.getElementById('intro');
  if (intro && root.classList.contains('loading')) {
    const birds = [0, 1, 2].map(i => `<g class="bird" style="--d:${26 + i * 7}s;--y:${120 + i * 38}px;--dl:-${i * 6}s"><path d="M0 0q7-7 14 0q7-7 14 0" stroke="#24395f" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>`).join('');
    const glitter = Array.from({length: 18}, (_, i) => `<rect class="glint" style="--dl:${(i * .37) % 2.4}s" x="${930 + ((i * 53) % 150) - 60}" y="${486 + i * 14}" width="${18 + (i % 4) * 8}" height="2.4" rx="1.2" fill="#fff"/>`).join('');
    intro.innerHTML = `
      <svg class="scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        ${defs('i')}
        <rect width="1200" height="480" fill="url(#i-sky)"/>
        <circle cx="960" cy="170" r="190" fill="url(#i-sun)"/><circle cx="960" cy="170" r="44" fill="#fff8de"/>
        <g class="clouds">
          <g class="cloud" style="--d:70s"><ellipse cx="230" cy="200" rx="110" ry="30" fill="#e6f0fb"/><ellipse cx="280" cy="176" rx="64" ry="42" fill="#fff"/><ellipse cx="190" cy="184" rx="52" ry="32" fill="#fff"/><ellipse cx="240" cy="190" rx="90" ry="26" fill="#fff"/></g>
          <g class="cloud" style="--d:95s"><ellipse cx="760" cy="120" rx="120" ry="30" fill="#e6f0fb"/><ellipse cx="800" cy="96" rx="70" ry="44" fill="#fff"/><ellipse cx="720" cy="104" rx="52" ry="32" fill="#fff"/><ellipse cx="770" cy="112" rx="100" ry="24" fill="#fff"/></g>
          <g class="cloud" style="--d:120s"><ellipse cx="330" cy="370" rx="140" ry="16" fill="#fff" opacity=".55"/><ellipse cx="1040" cy="340" rx="100" ry="13" fill="#fff" opacity=".5"/></g>
        </g>
        ${birds}
        <rect y="470" width="1200" height="330" fill="url(#i-sea)"/>
        <rect y="466" width="1200" height="10" fill="#e9f6fb" opacity=".55"/>
        ${glitter}
        ${band(600, 10, 160, '#1b6fa0', .35, 16)}${band(680, 12, 200, '#135a8c', .4, 22)}
        ${lines(520, 7, .3)}
        <g class="stage">
        <g transform="translate(600 520) scale(1.25)" class="rise">
          <g transform="scale(1 -.45) translate(0 -20)" opacity=".16" class="refl"><path d="M6-16C6-70-2-130-14-196M36-16C48-66 64-112 86-152" stroke="#08324f" stroke-width="12" fill="none"/></g>
          ${island('i')}
        </g>
        <g transform="translate(830 548) scale(1.3)" class="ride">${boatSVG}</g>
        </g>
        ${band(740, 14, 240, '#0d4373', .5, 28)}
      </svg>
      <button class="skip" type="button">Skip intro</button>`;
    // on tall, narrow screens shrink the island so the boat stays in view
    const stage = intro.querySelector('.stage');
    const fit = () => { const r = innerWidth / innerHeight; stage.setAttribute('transform', r < 1 ? `translate(600 520) scale(${Math.max(.52, r * .78)}) translate(-600 -520)` : ''); };
    fit(); addEventListener('resize', fit);
    const fig = intro.querySelector('.fig'), walker = intro.querySelector('.walker'), clip = intro.querySelector('.figclip');
    const boatG = intro.querySelector('.pboat'), riderEl = intro.querySelector('.rider');
    const b = bubble(intro), talk = chatter(fig, b, intro);
    fig.addEventListener('click', e => { e.stopPropagation(); if (!gone) talk(); });
    fig.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !gone) { e.preventDefault(); talk(); } });

    let gone = false;
    const curtain = (delay) => setTimeout(() => {
      intro.classList.add('done'); root.classList.remove('loading');
      try { sessionStorage.setItem('seen', '1'); } catch (e) {}
      dispatchEvent(new Event('intro:done'));
      setTimeout(() => intro.remove(), 1200);
    }, delay);
    async function board(){
      if (gone) return; gone = true; b.hide();
      clip.removeAttribute('clip-path'); fig.classList.add('peek');
      // walk down the beach…
      walker.classList.add('walking');
      await anim(walker, [{transform:'translate(0,0)'}, {transform:'translate(132px,8px)'}], {duration: 1300, easing: 'cubic-bezier(.4,0,.6,1)'});
      walker.classList.remove('walking');
      // …hop into the boat…
      await anim(walker, [{transform:'translate(132px,8px)'}, {transform:'translate(158px,-46px)', offset:.45}, {transform:'translate(176px,18px)', opacity:1, offset:.85}, {transform:'translate(178px,24px)', opacity:0}], {duration: 650, easing: 'ease-in-out'});
      riderEl.classList.add('on');
      anim(boatG, [{transform:'translateY(0)'}, {transform:'translateY(6px)'}, {transform:'translateY(0)'}], {duration: 420, easing: 'ease-out'});
      // …and sail.
      setTimeout(() => intro.classList.add('sail'), 450);
      curtain(1500);
    }
    function skip(){ if (gone) return; gone = true; b.hide(); riderEl.classList.add('on'); intro.classList.add('sail'); curtain(reduce ? 0 : 650); }
    intro.querySelector('.skip').onclick = skip;
    addEventListener('keydown', e => { if (e.key === 'Escape') skip(); });
    setTimeout(() => fig.classList.add('peek'), reduce ? 0 : 1200);
    setTimeout(() => {
      if (gone) return; placeBubble(b, fig, intro);
      b.type("Need a break? Hop on the boat — let's sail through Qusai's journey.", () => {
        const go = document.createElement('button'); go.className = 'go'; go.type = 'button'; go.textContent = 'Set sail →'; go.onclick = board;
        const hint = document.createElement('small'); hint.textContent = 'or click me for more';
        b.querySelector('.act').append(go, hint); go.focus({preventScroll: true});
      });
    }, reduce ? 0 : 1900);
    addEventListener('resize', () => !gone && placeBubble(b, fig, intro));
    setTimeout(board, 14000);   // don't hold anyone hostage
  } else if (intro) intro.remove();

  /* ---------- 2. the shore at the end of the page ---------- */
  const shore = document.getElementById('shore');
  if (!shore) return;
  shore.innerHTML = `<svg viewBox="0 0 700 300">
      ${defs('e')}
      <rect class="water" x="-200" y="226" width="1100" height="120" fill="transparent"/>
      <g opacity=".9">${lines(236, 3, .22)}</g>
      <g transform="translate(400 238) scale(.92)" class="rise">${island('e')}</g>
      <g class="ripples"></g>
    </svg>`;
  const svg = shore.querySelector('svg'), fig = shore.querySelector('.fig'), walker = shore.querySelector('.walker');
  shore.querySelector('.figclip').removeAttribute('clip-path');
  const b = bubble(shore), talk = chatter(fig, b, shore);
  let x = 30, ashore = false, seen = false;
  const setX = (nx, dur = 0) => { x = Math.max(-150, Math.min(150, nx)); walker.style.transition = dur ? `transform ${dur}ms cubic-bezier(.4,0,.6,1)` : 'none'; walker.style.transform = `translate(${x - 24 + 24}px,${Math.abs(x) > 120 ? (Math.abs(x) - 120) * .25 : 0}px)`; };
  walker.style.opacity = 0;

  // he hops off the ship when it docks, and climbs back aboard if you scroll away
  function landing(){
    if (ashore) return; ashore = true;
    walker.style.opacity = 1; fig.classList.add('peek');
    setX(-170); void walker.getBBox();
    walker.classList.add('walking'); setX(30, reduce ? 0 : 1400);
    setTimeout(() => { walker.classList.remove('walking'); placeBubble(b, fig, shore);
      if (seen) return talk(); seen = true;
      b.type('journey.complete() ✓  Thanks for sailing along — say hello?', () => {
        const a = document.createElement('a'); a.className = 'go'; a.href = 'mailto:qusai.kagalwala53@gmail.com'; a.textContent = 'Write to me →';
        const hint = document.createElement('small'); hint.textContent = 'drag me · tap the palm · tap the water';
        b.querySelector('.act').append(a, hint); }); }, reduce ? 0 : 1450);
  }
  function boarding(){ if (!ashore) return; ashore = false; b.hide(); walker.style.transition = 'opacity .3s'; walker.style.opacity = 0; }
  addEventListener('boat:docked', landing);
  addEventListener('boat:undocked', boarding);
  new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) shore.classList.add('in'); }), {threshold: .3}).observe(shore);

  // drag him along the beach
  const unit = () => { const m = svg.getScreenCTM(); return m ? m.a * .92 : 1; };
  let drag = null;
  fig.addEventListener('pointerdown', e => { drag = {x0: e.clientX, from: x, moved: false}; fig.setPointerCapture(e.pointerId); });
  fig.addEventListener('pointermove', e => { if (!drag) return; const dx = (e.clientX - drag.x0) / unit();
    if (Math.abs(dx) > 3) { drag.moved = true; walker.classList.add('walking'); b.hide(); } if (drag.moved) setX(drag.from + dx); });
  fig.addEventListener('pointerup', () => { if (!drag) return; const moved = drag.moved; drag = null; walker.classList.remove('walking');
    placeBubble(b, fig, shore);
    if (moved) talk(x < -110 ? 'cd ~/chair && sit' : x > 110 ? 'git push origin sea  # nope, too wet' : 'mv me ./somewhere-sunny');
    else talk(); });
  fig.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); talk(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); setX(x + (e.key === 'ArrowLeft' ? -24 : 24), 250); } });

  // tap the palm: a coconut drops
  const palm = shore.querySelector('[data-palm]'), nut = palm.querySelector('.nut');
  palm.style.cursor = 'pointer';
  palm.addEventListener('click', () => {
    if (nut.dataset.busy) return; nut.dataset.busy = 1;
    anim(nut, [{transform:'translate(0,0)'}, {transform:'translate(-6px,176px)', offset:.55, easing:'ease-in'}, {transform:'translate(-14px,160px)', offset:.7}, {transform:'translate(-26px,178px)', offset:.82}, {transform:'translate(-60px,180px) rotate(-200deg)'}], {duration: 1300})
      .then(() => { talk('coconut.drop()  // ouch, that was close'); setTimeout(() => { nut.getAnimations().forEach(a => a.cancel()); delete nut.dataset.busy; }, 2500); });
  });

  // tap the water: ripples
  const rip = shore.querySelector('.ripples');
  svg.addEventListener('click', e => {
    if (e.target.closest('.isle')) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    if (p.y < 226) return;
    for (let i = 0; i < 2; i++) { const c = document.createElementNS(NS, 'ellipse');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('rx', 4); c.setAttribute('ry', 1.6);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', 2); rip.appendChild(c);
      c.animate([{transform:'scale(1)', opacity:.9}, {transform:'scale(9)', opacity:0}], {duration: 1200, delay: i * 220, easing: 'ease-out', fill: 'both'}).onfinish = () => c.remove();
      c.style.transformBox = 'fill-box'; c.style.transformOrigin = 'center'; }
  });
  addEventListener('resize', () => b.classList.contains('on') && placeBubble(b, fig, shore));
})();
